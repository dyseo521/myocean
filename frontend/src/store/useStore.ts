'use client'

import { create } from 'zustand';
import { Donation, User, Hotspot } from '@/types';
import { getDonations, getCurrentUser, setCurrentUser as saveUser, logout as clearUser } from '@/utils/localStorage';

interface AppState {
  // 사용자 관련
  user: User | null;
  isLoggedIn: boolean;
  login: (name: string) => void;
  logout: () => void;

  // 모드 관련
  mode: 'funding' | 'collection';
  setMode: (mode: 'funding' | 'collection') => void;

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
  showCollectionModal: boolean;
  showSonarTrackingModal: boolean;
  showDetectionSuccessModal: boolean;
  setShowDonateModal: (show: boolean) => void;
  setShowMyOceanModal: (show: boolean) => void;
  setShowRankingModal: (show: boolean) => void;
  setShowCollectionModal: (show: boolean) => void;
  setShowSonarTrackingModal: (show: boolean) => void;
  setShowDetectionSuccessModal: (show: boolean) => void;

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

  // 지도 위치 선택 모드
  isSelectingLocation: boolean;
  selectedDonationLocation: { lat: number; lng: number } | null;
  setIsSelectingLocation: (selecting: boolean) => void;
  setSelectedDonationLocation: (location: { lat: number; lng: number } | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // 초기 상태 - SSR 호환을 위해 null/빈 배열로 시작
  user: null,
  isLoggedIn: false,
  mode: 'funding',
  donations: [],
  selectedHotspot: null,
  showDonateModal: false,
  showMyOceanModal: false,
  showRankingModal: false,
  showCollectionModal: false,
  showSonarTrackingModal: false,
  showDetectionSuccessModal: false,
  isMobileMenuOpen: false,
  showFishingLayer: true,
  showDebrisLayer: true,
  realtimeNotifications: [],
  isSelectingLocation: false,
  selectedDonationLocation: null,

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

  // 모드 액션
  setMode: (mode: 'funding' | 'collection') => {
    set({ mode });
  },

  // 기부 액션
  addDonation: (donation: Donation) => {
    set((state) => ({
      donations: [...state.donations, donation],
    }));
  },

  loadDonations: () => {
    const donations = getDonations();
    const user = getCurrentUser();
    console.log(`[useStore] loadDonations 실행 - ${donations.length}개 로드됨`);
    if (donations.length > 0) {
      console.log('[useStore] 첫 번째 기부 데이터:', donations[0]);
    }
    set({
      donations,
      user,
      isLoggedIn: !!user
    });
  },

  // 핫스팟 선택
  setSelectedHotspot: (hotspot: Hotspot | null) => {
    set({ selectedHotspot: hotspot });
  },

  // 모달 제어 (하나만 열리도록)
  setShowDonateModal: (show: boolean) => {
    set({
      showDonateModal: show,
      showMyOceanModal: false,
      showRankingModal: false,
    });
  },

  setShowMyOceanModal: (show: boolean) => {
    set({
      showMyOceanModal: show,
      showDonateModal: false,
      showRankingModal: false,
      // 나의 바다 열 때 알림 모두 제거
      realtimeNotifications: show ? [] : get().realtimeNotifications,
    });
  },

  setShowRankingModal: (show: boolean) => {
    set({
      showRankingModal: show,
      showDonateModal: false,
      showMyOceanModal: false,
    });
  },

  setShowCollectionModal: (show: boolean) => {
    set({ showCollectionModal: show });
  },

  setShowSonarTrackingModal: (show: boolean) => {
    set({ showSonarTrackingModal: show });
  },

  setShowDetectionSuccessModal: (show: boolean) => {
    set({ showDetectionSuccessModal: show });
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
    // 자동 제거 안 함 - 나의 바다 열 때까지 유지
  },

  removeNotification: (id: string) => {
    set((state) => ({
      realtimeNotifications: state.realtimeNotifications.filter((n) => n.id !== id),
    }));
  },

  // 지도 위치 선택
  setIsSelectingLocation: (selecting: boolean) => {
    set({ isSelectingLocation: selecting });
  },

  setSelectedDonationLocation: (location: { lat: number; lng: number } | null) => {
    set({ selectedDonationLocation: location });
  },
}));
