import { Donation, User } from '@/types';

const DONATIONS_KEY = 'myocean_donations';
const USER_KEY = 'myocean_user';

// 기부 데이터 관련
export const getDonations = (): Donation[] => {
  const stored = localStorage.getItem(DONATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveDonation = (donation: Donation): void => {
  const donations = getDonations();
  donations.push(donation);
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
};

export const updateDonationProgress = (donationId: string, progress: number): void => {
  const donations = getDonations();
  const updated = donations.map(d =>
    d.id === donationId ? { ...d, cleanupProgress: Math.min(100, progress) } : d
  );
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(updated));
};

export const getUserDonations = (userName: string): Donation[] => {
  return getDonations().filter(d => d.name === userName);
};

// 사용자 데이터 관련
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
};

// 통계 계산
export const getTotalDonationAmount = (): number => {
  return getDonations().reduce((sum, d) => sum + d.amount, 0);
};

export const getDonationsByRegion = (regionName: string): Donation[] => {
  return getDonations().filter(d => d.regionName === regionName);
};

// 랭킹 계산
export const getTopDonors = (limit: number = 10) => {
  const donations = getDonations();
  const donorMap = new Map<string, { amount: number; count: number }>();

  donations.forEach(d => {
    const existing = donorMap.get(d.name) || { amount: 0, count: 0 };
    donorMap.set(d.name, {
      amount: existing.amount + d.amount,
      count: existing.count + 1,
    });
  });

  return Array.from(donorMap.entries())
    .map(([name, data], index) => ({
      rank: index + 1,
      name,
      amount: data.amount,
      donationCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};
