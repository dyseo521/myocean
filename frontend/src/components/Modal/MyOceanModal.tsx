import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getUserDonations } from '@/utils/localStorage';
import { formatAmount, getProgressColor, simulateCleanupProgress } from '@/utils/donation';
import { format } from 'date-fns';

const MyOceanModal = () => {
  const showMyOceanModal = useStore((state) => state.showMyOceanModal);
  const setShowMyOceanModal = useStore((state) => state.setShowMyOceanModal);
  const user = useStore((state) => state.user);

  if (!showMyOceanModal || !user) return null;

  const myDonations = getUserDonations(user.name);
  const totalAmount = myDonations.reduce((sum, d) => sum + d.amount, 0);
  const completedCount = myDonations.filter(d => simulateCleanupProgress(d.date) >= 100).length;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={() => setShowMyOceanModal(false)}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        >
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl p-5 md:p-6 w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* 헤더 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gradient-ocean">🌊 나의 바다</h2>
                <p className="text-sm text-slate-600 mt-1">{user.name}님의 기부 현황</p>
              </div>
              <button
                onClick={() => setShowMyOceanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl w-10 h-10 flex items-center justify-center -mr-2 -mt-2"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
              <div className="card bg-gradient-to-br from-ocean-primary to-ocean-secondary text-white p-3 md:p-4">
                <div className="text-xs opacity-90">총 기부 금액</div>
                <div className="text-base md:text-xl font-bold mt-1">{(totalAmount / 10000).toLocaleString()}만원</div>
              </div>
              <div className="card bg-gradient-to-br from-ocean-secondary to-ocean-success text-white p-3 md:p-4">
                <div className="text-xs opacity-90">기부 영역</div>
                <div className="text-base md:text-xl font-bold mt-1">{myDonations.length}곳</div>
              </div>
              <div className="card bg-gradient-to-br from-ocean-success to-emerald-600 text-white p-3 md:p-4">
                <div className="text-xs opacity-90">정화 완료</div>
                <div className="text-base md:text-xl font-bold mt-1">{completedCount}곳</div>
              </div>
            </div>

            {/* 기부 내역 */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">기부 내역</h3>
              {myDonations.length === 0 ? (
                <div className="card bg-slate-50 text-center py-12">
                  <p className="text-slate-500">아직 기부 내역이 없습니다.</p>
                  <p className="text-sm text-slate-400 mt-2">지금 바로 기부하여 바다를 지켜주세요!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myDonations.map((donation) => {
                    const progress = simulateCleanupProgress(donation.date);
                    return (
                      <div key={donation.id} className="card hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-slate-800">{donation.regionName}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {format(new Date(donation.date), 'yyyy년 M월 d일')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-ocean-primary">{formatAmount(donation.amount)}</div>
                            <div className="text-xs text-slate-500">{donation.area}km²</div>
                          </div>
                        </div>

                        {/* 정화 진행률 */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">정화 진행률</span>
                            <span className={`font-bold ${getProgressColor(progress)}`}>
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${progress}%` }}
                              className={`h-full transition-all duration-500 ${
                                progress >= 100
                                  ? 'bg-ocean-success'
                                  : progress >= 50
                                  ? 'bg-ocean-warning'
                                  : 'bg-ocean-danger'
                              }`}
                            />
                          </div>
                          {progress >= 100 && (
                            <div className="text-xs text-ocean-success font-medium mt-1">
                              ✅ 정화 완료!
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MyOceanModal;
