import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { User, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Kombinasi pengguna dan kata sandi salah');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-['Poppins',sans-serif]">
            {/* Sisi Kiri (60% width) - Drone Shot Aerial Perkebunan */}
            <div className="hidden md:flex md:w-[60%] relative bg-emerald-950 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[15000ms] ease-linear hover:scale-110"
                    style={{
                        backgroundImage: `url('/kebun.jpg')`,
                    }}
                ></div>

                {/* Dark Gradient Overlay (Bawah ke Atas) */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent"></div>

                {/* Slogan / Visi Premium */}
                <div className="absolute bottom-20 left-20 right-20 z-20">
                    <div className="w-24 h-1 bg-emerald-400 mb-8 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 drop-shadow-2xl">
                        Mengelola Alam,<br />
                        <span className="text-emerald-300">Menjaga Masa Depan.</span>
                    </h1>
                    <p className="text-emerald-50/90 text-xl max-w-lg font-light leading-relaxed tracking-wide drop-shadow-lg">
                        Berdedikasi untuk membangun keunggulan operasional yang berkelanjutan di sektor perkebunan dunia.
                    </p>
                </div>
            </div>

            {/* Sisi Kanan (40% width) - Premium Form Area */}
            <div className="w-full md:w-[40%] bg-[#FDFBF7] flex flex-col relative overflow-hidden">

                {/* Decorative Leaf Watermarks (SVG) */}
                <div className="absolute top-[-50px] left-[-50px] text-emerald-900/5 rotate-[-45deg] pointer-events-none">
                    <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L9.29,18H13C19,18 21,12 21,8V3H17V8Z" />
                    </svg>
                </div>
                <div className="absolute bottom-[-100px] right-[-50px] text-emerald-900/5 rotate-[135deg] pointer-events-none">
                    <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L9.29,18H13C19,18 21,12 21,8V3H17V8Z" />
                    </svg>
                </div>

                {/* Header Branding (Top Right Mobile / Desktop) */}
                <div className="p-10 md:p-14 flex justify-between items-center md:justify-end ">
                    <img src="/logoptpn.png" alt="PTPN Logo" className="h-16 md:h-20 object-contain drop-shadow-sm" />
                </div>

                {/* Form Centered Vertically */}
                <div className="flex-1 flex items-center justify-center px-10 md:px-16 lg:px-24 relative z-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-12">
                            <h2 className="text-4xl font-bold text-emerald-900 mb-3 tracking-tight">Selamat Datang</h2>
                            <p className="text-slate-500 text-lg">Silakan masuk ke akun Anda</p>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-xl mb-8 flex items-center gap-3 text-sm shadow-sm animate-shake">
                                <AlertCircle size={20} className="shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="text-left">
                                <label className="block text-slate-700 text-sm font-bold mb-2 ml-1">Nama Pengguna</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all text-slate-800 placeholder:text-slate-300 shadow-sm hover:shadow-md"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="text-left">
                                <label className="block text-slate-700 text-sm font-bold mb-2 ml-1">Kata Sandi</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all text-slate-800 placeholder:text-slate-300 shadow-sm hover:shadow-md"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-700 hover:from-emerald-500 hover:via-emerald-700 hover:to-emerald-800 text-white font-bold py-4.5 rounded-2xl transition-all shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 active:transform active:scale-[0.98] mt-6 flex justify-center items-center gap-2"
                            >
                                <span>Masuk ke Dashboard</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Premium */}
                <div className="p-10">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center opacity-60">
                        &copy; {new Date().getFullYear()} PT Perkebunan Nusantara IV.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
