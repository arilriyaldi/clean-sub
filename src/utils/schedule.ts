/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PickupInstance {
  date: Date;
  timeRange: string;
  address: string;
  planName: string;
  isDemo: boolean;
}

export function getUpcomingPickups(plan: string, address?: string, count = 10): PickupInstance[] {
  const result: PickupInstance[] = [];
  const start = new Date();
  
  const isDemo = plan === 'none';
  const activePlan = isDemo ? 'Standard' : plan;
  const targetAddress = address || 'Alamat Belum Diisi (Masukkan saat pendaftaran)';

  const isPickupDate = (date: Date) => {
    const day = date.getDay(); // 0 is Sunday, 1 is Monday...
    if (activePlan === 'Premium') return true;
    if (activePlan === 'Standard') {
      return [1, 3, 6].includes(day); // Mon, Wed, Sat
    }
    if (activePlan === 'Basic') {
      return [2, 5].includes(day); // Tue, Fri
    }
    return false;
  };

  let current = new Date(start);
  // If today is past the pickup time or we just want to start freshly, we can roll with current day.
  let daysChecked = 0;
  while (result.length < count && daysChecked < 60) {
    if (isPickupDate(current)) {
      result.push({
        date: new Date(current),
        timeRange: '08:00 - 10:00 WIB',
        address: targetAddress,
        planName: activePlan,
        isDemo
      });
    }
    current.setDate(current.getDate() + 1);
    daysChecked++;
  }

  return result;
}

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDate(date: Date): { dayName: string; dateStr: string } {
  const dayName = INDONESIAN_DAYS[date.getDay()];
  const dateStr = `${date.getDate()} ${INDONESIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return { dayName, dateStr };
}
