import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, Trash } from 'lucide-react';

const Dashboard = () => {
    const [ipbs, setIpbs] = useState([]);
    const { user, logout } = useAuth();

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchIpbs();
    }, []);

    const fetchIpbs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ipbs');
            setIpbs(res.data);
        } catch (error) {
            console.error('Error fetching IPBs:', error);
        }
    };

    const handleDeleteIPB = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus IPB ini? Semua dokumen terkait juga akan dihapus.')) return;

        try {
            await axios.delete(`http://localhost:5000/api/ipbs/${id}`);
            alert('IPB berhasil dihapus');
            fetchIpbs();
        } catch (error) {
            console.error('Error deleting IPB:', error);
            alert('Gagal menghapus IPB: ' + (error.response?.data?.error || error.message));
        }
    };

    const months = [
        { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
        { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
        { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
        { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

    const filteredIpbs = ipbs.filter(ipb => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return ipb.title.toLowerCase().includes(query) || ipb.id.toString().includes(query);
        }
        const date = new Date(ipb.createdAt);
        return (date.getMonth() + 1) === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Top Navigation Bar */}
            <nav className="bg-emerald-800 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1 rounded-lg">
                            <img src="/logoptpn.png" alt="PTPN Logo" className="h-8 w-auto object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Dashboard IPB PTPN IV REGIONAL IV</h1>
                            <p className="text-xs text-emerald-200 font-medium">Sistem Pemindahan Barang</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold">{user?.username}</p>
                            <p className="text-xs text-emerald-200 uppercase tracking-wider">{user?.role}</p>
                        </div>
                        <button onClick={logout} className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                            Keluar
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Statistics & Actions Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan Isu atau ID..."
                            className="w-full pl-4 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Month/Year Filter */}
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1.5">
                            <select
                                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none px-3 py-1 cursor-pointer hover:text-emerald-700 transition"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <div className="w-px h-5 bg-slate-300 mx-1"></div>
                            <select
                                className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none px-3 py-1 cursor-pointer hover:text-emerald-700 transition"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Create Button */}
                        {(user?.role === 'KEBUN' || user?.role === 'TEKNIS') && (
                            <Link to="/create" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg inline-flex items-center gap-2 hover:bg-emerald-700 transition-all font-medium text-sm shadow-sm hover:shadow-md">
                                <Plus size={18} /> Buat IPB Baru
                            </Link>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-16">No</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Isu</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Tanggal</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Dok. Kebun</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Dok. Teknis (OPH)</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Dok. Teknis (AKN)</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Dok. IPB</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredIpbs.map((ipb, index) => (
                                    <tr key={ipb.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6 text-center text-sm text-slate-500 font-mono">{index + 1}</td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors mx-auto">{ipb.title}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 mx-auto">ID: #{ipb.id}</div>
                                        </td>
                                        <td className="py-4 px-6 text-center text-sm text-slate-600 whitespace-nowrap">
                                            {new Date(ipb.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Doc Helper Component */}
                                        {[ipb.docKebunPath, ipb.docTeknis1Path, ipb.docTeknis2Path, ipb.docIPBPath].map((path, idx) => (
                                            <td key={idx} className="py-4 px-6 text-center">
                                                {path ? (
                                                    <a href={`http://localhost:5000/${path}`} target="_blank" rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 hover:border-sky-200 transition-all text-xs font-medium truncate max-w-[140px]"
                                                        title={path.split('-').slice(1).join('-')}>
                                                        <FileText size={14} className="flex-shrink-0" />
                                                        <span className="truncate">{path.split('-').slice(1).join('-')}</span>
                                                    </a>
                                                ) : <span className="text-slate-300 text-xs italic">-</span>}
                                            </td>
                                        ))}

                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ipb.statusDetail === 'Dokumen sudah lengkap' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                ipb.statusDetail === 'Menunggu Approval' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                    ipb.statusDetail === 'Dokumen belum lengkap' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        ipb.statusDetail === 'Dokumen kosong' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                {ipb.statusDetail || '-'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 text-center">
                                            <div className="flex flex-col gap-2 items-center">
                                                <Link to={`/ipb/${ipb.id}`} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold hover:underline">
                                                    Lihat Detail
                                                </Link>
                                                {user?.role === 'ADMIN' && (
                                                    <button
                                                        onClick={() => handleDeleteIPB(ipb.id)}
                                                        className="text-rose-500 hover:text-rose-700 text-xs font-bold hover:underline text-left"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredIpbs.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-slate-400 bg-slate-50/50 italic">
                                            Tidak ada data IPB ditemukan untuk periode ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Sistem Informasi Perkebunan. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
