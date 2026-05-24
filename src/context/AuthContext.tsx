/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserAccount {
  uid: string;
  fullName: string;
  email: string;
  subscriptionPlan: string;
  address?: string;
  phoneNumber?: string;
  password?: string;
}

interface AuthContextType {
  user: { uid: string; email?: string | null; displayName?: string | null } | null;
  profile: UserAccount | null;
  loading: boolean;
  refreshProfile: (uid?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginManual: (user: { uid: string; email: string; displayName: string }) => void;
  // Local Database actions
  localRegister: (fullName: string, phoneNumber: string, address: string, email: string, password: string) => Promise<UserAccount>;
  localLogin: (email: string, password: string) => Promise<UserAccount>;
  localUpdateProfile: (fullName: string, phoneNumber: string, address: string, email: string) => Promise<UserAccount>;
  localUpdateSubscription: (planName: string, paymentMethod?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
  loginManual: () => {},
  localRegister: async () => ({} as UserAccount),
  localLogin: async () => ({} as UserAccount),
  localUpdateProfile: async () => ({} as UserAccount),
  localUpdateSubscription: async () => {},
});

const LOCAL_USERS_KEY = 'cleansub_registered_users';
const LOCAL_SESSION_KEY = 'cleansub_session';

// Helper to get registered users
const getLocalUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

// Helper to save registered users
const saveLocalUsers = (users: UserAccount[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email?: string | null; displayName?: string | null } | null>(null);
  const [profile, setProfile] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const loginManual = (userData: { uid: string; email: string; displayName: string }) => {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userData));
    setUser(userData);
    refreshProfile(userData.uid);
  };

  const refreshProfile = async (currentUid?: string) => {
    const uid = currentUid || user?.uid;
    if (!uid) {
      setProfile(null);
      return;
    }

    try {
      const users = getLocalUsers();
      const foundUser = users.find(u => u.uid === uid);
      if (foundUser) {
        setProfile(foundUser);
        if (!user) {
          setUser({ uid: foundUser.uid, email: foundUser.email, displayName: foundUser.fullName });
        }
      } else {
        // Fallback user profile
        const fallbackUser: UserAccount = {
          uid: uid,
          fullName: user?.displayName || 'User CleanSub',
          email: user?.email || '',
          subscriptionPlan: 'none'
        };
        setProfile(fallbackUser);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const localRegister = async (fullName: string, phoneNumber: string, address: string, email: string, password: string): Promise<UserAccount> => {
    const users = getLocalUsers();
    const emailNorm = email.trim().toLowerCase();
    
    if (users.some(u => u.email.toLowerCase() === emailNorm)) {
      throw new Error('Email ini sudah terdaftar. Silakan login.');
    }

    const newUid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newUser: UserAccount = {
      uid: newUid,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      email: emailNorm,
      password: password,
      subscriptionPlan: 'none'
    };

    users.push(newUser);
    saveLocalUsers(users);

    return newUser;
  };

  const localLogin = async (email: string, password: string): Promise<UserAccount> => {
    const users = getLocalUsers();
    const emailNorm = email.trim().toLowerCase();
    
    const foundUser = users.find(u => u.email.toLowerCase() === emailNorm && u.password === password);
    if (!foundUser) {
      throw new Error('Email atau kata sandi salah.');
    }

    const sessionUser = { uid: foundUser.uid, email: foundUser.email, displayName: foundUser.fullName };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
    
    setUser(sessionUser);
    setProfile(foundUser);
    
    return foundUser;
  };

  const localUpdateProfile = async (fullName: string, phoneNumber: string, address: string, email: string): Promise<UserAccount> => {
    const currentUid = user?.uid;
    if (!currentUid) throw new Error('Silakan masuk terlebih dahulu.');

    const users = getLocalUsers();
    const index = users.findIndex(u => u.uid === currentUid);
    if (index === -1) {
      // Create profile dynamically and push to database if not exists (e.g. they had a partial session)
      const newUser: UserAccount = {
        uid: currentUid,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        email: email.trim().toLowerCase(),
        subscriptionPlan: 'none'
      };
      users.push(newUser);
      saveLocalUsers(users);
      
      const sessionUser = { uid: newUser.uid, email: newUser.email, displayName: newUser.fullName };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      setProfile(newUser);
      return newUser;
    }

    const updatedUser: UserAccount = {
      ...users[index],
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      email: email.trim().toLowerCase()
    };

    users[index] = updatedUser;
    saveLocalUsers(users);

    const sessionUser = { uid: updatedUser.uid, email: updatedUser.email, displayName: updatedUser.fullName };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionUser));
    
    setUser(sessionUser);
    setProfile(updatedUser);

    return updatedUser;
  };

  const localUpdateSubscription = async (planName: string, paymentMethod?: string): Promise<void> => {
    const currentUid = user?.uid;
    if (!currentUid) throw new Error('Silakan masuk terlebih dahulu.');

    const users = getLocalUsers();
    const index = users.findIndex(u => u.uid === currentUid);
    if (index === -1) {
      // Dynamically make user in database if missing
      const newUser: UserAccount = {
        uid: currentUid,
        fullName: user.displayName || 'User CleanSub',
        phoneNumber: '',
        address: '',
        email: user.email || '',
        subscriptionPlan: planName
      };
      users.push(newUser);
      saveLocalUsers(users);
      setProfile(newUser);
      return;
    }

    const updatedUser: UserAccount = {
      ...users[index],
      subscriptionPlan: planName
    };

    if (paymentMethod) {
      // Just visually track if needed, or save
      (updatedUser as any).paymentMethod = paymentMethod;
    }

    users[index] = updatedUser;
    saveLocalUsers(users);

    setProfile(updatedUser);
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        setUser(sessionData);
        // Fetch profile
        const users = getLocalUsers();
        const found = users.find(u => u.uid === sessionData.uid);
        if (found) {
          setProfile(found);
        } else {
          setProfile({
            uid: sessionData.uid,
            fullName: sessionData.displayName || 'User',
            email: sessionData.email || '',
            subscriptionPlan: 'none'
          });
        }
      } catch (e) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      refreshProfile, 
      logout, 
      loginManual,
      localRegister,
      localLogin,
      localUpdateProfile,
      localUpdateSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
