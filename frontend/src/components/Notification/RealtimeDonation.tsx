'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { formatAmount } from '@/utils/donation';

const RealtimeDonation = () => {
  const notifications = useStore((state) => state.realtimeNotifications);

  return (
    <div className="fixed bottom-24 md:bottom-4 right-4 z-40 space-y-2 max-w-xs">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-white rounded-lg shadow-2xl p-4 border-l-4 border-ocean-primary"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚓</div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 text-sm">
                  {notification.name}님이 기부했습니다!
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {notification.region} · {formatAmount(notification.amount)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeDonation;
