import { create } from 'zustand';
import { Donation, User, Hotspot } from '@/types';
import { getDonations, getCurrentUser, setCurrentUser as saveUser, logout as clearUser } from '@/utils/localStorage';

interface AppState {
  // 사용자 관련
  user: User | null;
  isLoggedIn: boolean;
  login: (name: string) => void;
  logout: () => void;

  // 기부 관련
  donations: Donation[];
  addDonation: (donation: Donation) => void;
  loadDonations: () => void;

  // 선택된 핫스팟
  selectedHotspot: Hotspot | null;
  setSelectedHotspot: (hotspot: Hotspot | null) => void;

  // 모달 상태
  showDonateModal: boolean;
  showMyOceanModal: boolean;
  showRankingModal: boolean;
  setShowDonateModal: (show: boolean) => void;
  setShowMyOceanModal: (show: boolean) => void;
  setShowRankingModal: (show: boolean) => void;

  // 모바일 메뉴
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // 지도 레이어
  showFishingLayer: boolean;
  showDebrisLayer: boolean;
  toggleFishingLayer: () => void;
  toggleDebrisLayer: () => void;

  // 실시간 알림
  realtimeNotifications: Array<{ id: string; name: string; amount: number; region: string }>;
  addNotification: (notification: { name: string; amount: number; region: string }) => void;
  removeNotification: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // 초기 상태
  user: getCurrentUser(),
  isLoggedIn: !!getCurrentUser(),
  donations: getDonations(),
  selectedHotspot: null,
  showDonateModal: false,
  showMyOceanModal: false,
  showRankingModal: false,
  isMobileMenuOpen: false,
  showFishingLayer: true,
  showDebrisLayer: true,
  realtimeNotifications: [],

  // 사용자 액션
  login: (name: string) => {
    const user: User = {
      name,
      loginDate: new Date().toISOString(),
    };
    saveUser(user);
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    clearUser();
    set({ user: null, isLoggedIn: false });
  },

  // 기부 액션
  addDonation: (donation: Donation) => {
    set((state) => ({
      donations: [...state.donations, donation],
    }));
  },

  loadDonations: () => {
    set({ donations: getDonations() });
  },

  // 핫스팟 선택
  setSelectedHotspot: (hotspot: Hotspot | null) => {
    set({ selectedHotspot: hotspot });
  },

  // 모달 제어
  setShowDonateModal: (show: boolean) => {
    set({ showDonateModal: show });
  },

  setShowMyOceanModal: (show: boolean) => {
    set({ showMyOceanModal: show });
  },

  setShowRankingModal: (show: boolean) => {
    set({ showRankingModal: show });
  },

  // 모바일 메뉴 제어
  setIsMobileMenuOpen: (open: boolean) => {
    set({ isMobileMenuOpen: open });
  },

  // 레이어 토글
  toggleFishingLayer: () => {
    set((state) => ({ showFishingLayer: !state.showFishingLayer }));
  },

  toggleDebrisLayer: () => {
    set((state) => ({ showDebrisLayer: !state.showDebrisLayer }));
  },

  // 실시간 알림
  addNotification: (notification) => {
    const id = Date.now().toString();
    set((state) => ({
      realtimeNotifications: [...state.realtimeNotifications, { ...notification, id }],
    }));

    // 3초 후 자동 제거
    setTimeout(() => {
      get().removeNotification(id);
    }, 3000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      realtimeNotifications: state.realtimeNotifications.filter((n) => n.id !== id),
    }));
  },
}));
