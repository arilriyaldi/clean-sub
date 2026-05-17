/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserAccount {
  uid: string;
  fullName: string;
  email: string;
  subscriptionPlan: string;
}

interface AuthContextType {
  user: { uid: string; email?: string | null; displayName?: string | null } | null;
  profile: UserAccount | null;
  loading: boolean;
  refreshProfile: (uid?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginManual: (user: { uid: string; email: string; displayName: string }) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
  loginManual: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email?: string | null; displayName?: string | null } | null>(null);
  const [profile, setProfile] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const loginManual = (userData: { uid: string; email: string; displayName: string }) => {
    localStorage.setItem('cleansub_session', JSON.stringify(userData));
    setUser(userData);
    refreshProfile(userData.uid);
  };

  const refreshProfile = async (currentUid?: string) => {
    const uid = currentUid || user?.uid || auth.currentUser?.uid;
    if (!uid) {
      setProfile(null);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserAccount;
        setProfile(data);
        if (!user) {
          setUser({ uid: data.uid, email: data.email, displayName: data.fullName });
        }
      } else if (auth.currentUser) {
        const newProfile: UserAccount = {
          uid: auth.currentUser.uid,
          fullName: auth.currentUser.displayName || 'User',
          email: auth.currentUser.email || '',
          subscriptionPlan: 'none',
        };
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('cleansub_session');
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('cleansub_session');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        setUser(sessionData);
        refreshProfile(sessionData.uid);
      } catch (e) {
        localStorage.removeItem('cleansub_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName });
        await refreshProfile(fbUser.uid);
      } else if (!localStorage.getItem('cleansub_session')) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, logout, loginManual }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
