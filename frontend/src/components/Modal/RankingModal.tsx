import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getTopDonors } from '@/utils/localStorage';
import { formatAmount } from '@/utils/donation';

const RankingModal = () => {
  const showRankingModal = useStore((state) => state.showRankingModal);
  const setShowRankingModal = useStore((state) => state.setShowRankingModal);

  if (!showRankingModal) return null;

  const topDonors = getTopDonors(10);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}위`;
  };

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={() => setShowRankingModal(false)}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="modal-container"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">🏆 기부 랭킹</h2>
                <p className="text-sm text-slate-600 mt-1">바다를 지킨 영웅들</p>
              </div>
              <button
                onClick={() => setShowRankingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* 랭킹 리스트 */}
            {topDonors.length === 0 ? (
              <div className="card bg-slate-50 text-center py-12">
                <p className="text-slate-500">아직 기부 내역이 없습니다.</p>
                <p className="text-sm text-slate-400 mt-2">첫 번째 기부자가 되어주세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topDonors.map((donor, index) => (
                  <motion.div
                    key={donor.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card ${
                      index < 3
                        ? 'bg-gradient-to-r from-ocean-primary to-ocean-secondary text-white'
                        : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-2xl font-bold ${
                            index >= 3 ? 'text-slate-400' : ''
                          }`}
                        >
                          {getMedalEmoji(donor.rank)}
                        </div>
                        <div>
                          <div className={`font-bold ${index >= 3 ? 'text-slate-800' : ''}`}>
                            {donor.name}
                          </div>
                          <div
                            className={`text-xs ${
                              index >= 3 ? 'text-slate-500' : 'opacity-90'
                            }`}
                          >
                            {donor.donationCount}회 기부
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-right font-bold ${
                          index >= 3 ? 'text-ocean-primary' : ''
                        }`}
                      >
                        {formatAmount(donor.amount)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 총 기부 통계 */}
            {topDonors.length > 0 && (
              <div className="mt-6 card bg-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">전체 기부 금액</span>
                  <span className="text-lg font-bold text-ocean-primary">
                    {formatAmount(topDonors.reduce((sum, d) => sum + d.amount, 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RankingModal;
