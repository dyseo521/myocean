import { useStore } from '@/store/useStore';

const DonateButton = () => {
  const user = useStore((state) => state.user);
  const setShowDonateModal = useStore((state) => state.setShowDonateModal);

  const handleClick = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowDonateModal(true);
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-primary text-sm w-full shadow-lg"
      disabled={!user}
    >
      💝 기부하기
    </button>
  );
};

export default DonateButton;
