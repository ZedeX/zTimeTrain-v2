import React, { useState } from 'react';
import { X, Train } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (userId: string) => void;
  defaultTab?: 'login' | 'register';
}

export function AuthModal({ onClose, onLogin, defaultTab = 'register' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      const endpoint = tab === 'register' ? '/api/register' : '/api/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(tab === 'register' ? '注册成功！' : '登录成功！');
        onLogin(data.userId);
        onClose();
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (err) {
      toast.error('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 text-center bg-blue-50 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-blue-100 rounded-full text-blue-600 transition-colors">
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
            <Train size={32} />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">
            {tab === 'register' ? '加入时间小火车' : '欢迎回来'}
          </h2>
          {tab === 'register' && (
            <p className="text-sm text-blue-600 mt-2">
              注册账号以保存您的进度、积分和成就！
            </p>
          )}
        </div>

        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('register')}
          >
            注册
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold transition-colors ${tab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('login')}
          >
            登录
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input 
              type="tel" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="请输入手机号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="请输入密码"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 mt-2 shadow-md"
          >
            {loading ? '处理中...' : (tab === 'register' ? '立即注册' : '登录')}
          </button>
        </form>
      </div>
    </div>
  );
}
