import { useState } from 'react';
import { useStore } from '@/store/useStore';

const LoginButton = () => {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const user = useStore((state) => state.user);
  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);

  const handleLogin = () => {
    if (name.trim()) {
      login(name.trim());
      setName('');
      setShowInput(false);
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
    }
  };

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="btn bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm w-full"
      >
        로그아웃
      </button>
    );
  }

  if (showInput) {
    return (
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="이름 입력"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-primary"
          autoFocus
        />
        <button onClick={handleLogin} className="btn btn-primary text-sm px-3">
          확인
        </button>
        <button
          onClick={() => setShowInput(false)}
          className="btn bg-slate-200 text-slate-700 text-sm px-3"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setShowInput(true)} className="btn btn-primary text-sm w-full">
      🔐 로그인
    </button>
  );
};

export default LoginButton;
