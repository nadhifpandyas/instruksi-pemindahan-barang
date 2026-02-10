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
        const date = new Date(ipb.createdAt);
        return (date.getMonth() + 1) === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-[95%] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dasbor IPB</h1>
                    <div className="flex gap-4">
                        <span className="self-center text-gray-600">Selamat Datang, {user?.username} ({user?.role})</span>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Keluar</button>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
                    {['KEBUN', 'ADMIN'].includes(user?.role) && (
                        <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center gap-2 hover:bg-blue-700 h-10">
                            <Plus size={20} /> Buat IPB Baru
                        </Link>
                    )}

                    <div className="flex gap-4 bg-white p-2 rounded shadow-sm border">
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Bulan</label>
                            <select
                                className="bg-transparent text-sm font-medium focus:outline-none px-1"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div className="w-[1px] bg-gray-200 self-stretch"></div>
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Tahun</label>
                            <select
                                className="bg-transparent text-sm font-medium focus:outline-none px-1"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr className="text-xs">
                                <th className="py-3 px-4 text-left w-16">No</th>
                                <th className="py-3 px-4 text-left">Isu</th>
                                <th className="py-3 px-4 text-left w-24">Status</th>
                                <th className="py-3 px-4 text-left w-32">Dibuat Oleh</th>
                                <th className="py-3 px-4 text-left w-24">Tanggal</th>
                                <th className="py-3 px-4 text-left w-40">Dok. Kebun</th>
                                <th className="py-3 px-4 text-left w-40">Dok. Teknis 4OPH</th>
                                <th className="py-3 px-4 text-left w-40">Dok. Teknis 4AKN</th>
                                <th className="py-3 px-4 text-left">Keterangan IPB</th>
                                <th className="py-3 px-4 text-left">Status Keterangan</th>
                                <th className="py-3 px-4 text-left w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredIpbs.map((ipb, index) => (
                                <tr key={ipb.id} className="hover:bg-gray-50 text-xs">
                                    <td className="py-3 px-4 font-mono text-gray-500 text-[10px]">{index + 1}</td>
                                    <td className="py-3 px-4 font-medium text-[11px] min-w-[150px]">{ipb.title}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[9px] font-bold inline-block w-full
                                            ${ipb.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                                ipb.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {ipb.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-[10px]">{ipb.createdBy?.username}</td>
                                    <td className="py-3 px-4 text-[10px] whitespace-nowrap">{new Date(ipb.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        {ipb.docKebunPath ? (
                                            <a href={`http://localhost:5000/${ipb.docKebunPath}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[10px]">
                                                <FileText size={10} /> {ipb.docKebunPath.split('-').slice(1).join('-')}
                                            </a>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        {ipb.docTeknis1Path ? (
                                            <a href={`http://localhost:5000/${ipb.docTeknis1Path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[10px]">
                                                <FileText size={10} /> {ipb.docTeknis1Path.split('-').slice(1).join('-')}
                                            </a>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        {ipb.docTeknis2Path ? (
                                            <a href={`http://localhost:5000/${ipb.docTeknis2Path}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[10px]">
                                                <FileText size={10} /> {ipb.docTeknis2Path.split('-').slice(1).join('-')}
                                            </a>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="min-w-[120px] text-gray-600 italic text-[10px]">
                                            {ipb.textIPB || '-'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-[10px] text-gray-700 font-medium">
                                            {ipb.statusDetail || '-'}
                                        </div>
                                    </td>
                                    <Link to={`/ipb/${ipb.id}`} className="bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded transition-colors w-full">
                                        <FileText size={12} /> Lihat Detail
                                    </Link>
                                    {user?.role === 'ADMIN' && (
                                        <button
                                            onClick={() => handleDeleteIPB(ipb.id)}
                                            className="bg-red-600 text-white hover:bg-red-700 inline-flex items-center justify-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded transition-colors w-full"
                                        >
                                            <Trash size={12} /> Hapus
                                        </button>
                                    )}
                                </tr>
                            ))}
                            {filteredIpbs.length === 0 && (
                                <tr>
                                    <td colSpan="11" className="py-8 text-center text-gray-500">Tidak ada IPB ditemukan untuk periode ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
