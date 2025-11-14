import { useStore } from '@/store/useStore';
import { getUserDonations } from '@/utils/localStorage';

const MyOceanButton = () => {
  const user = useStore((state) => state.user);
  const setShowMyOceanModal = useStore((state) => state.setShowMyOceanModal);

  if (!user) return null;

  const myDonations = getUserDonations(user.name);
  const totalAmount = myDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <button
      onClick={() => setShowMyOceanModal(true)}
      className="btn btn-secondary text-sm w-full shadow-lg"
    >
      <div className="flex flex-col items-center">
        <span>🌊 나의 바다</span>
        {totalAmount > 0 && (
          <span className="text-xs opacity-90">
            총 {(totalAmount / 10000).toLocaleString()}만원
          </span>
        )}
      </div>
    </button>
  );
};

export default MyOceanButton;
