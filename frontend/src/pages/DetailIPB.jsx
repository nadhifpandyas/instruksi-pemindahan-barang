import React, { useEffect, useState } from 'react';
import api, { API_URL } from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Download, Upload, Save, FileText, ArrowLeft, Trash } from 'lucide-react';

const DetailIPB = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ipb, setIpb] = useState(null);
    const [loading, setLoading] = useState(true);

    // Admin/Update States
    const [status, setStatus] = useState('');
    const [statusDetail, setStatusDetail] = useState('');
    const [title, setTitle] = useState('');
    const [docKebun, setDocKebun] = useState(null);
    const [docTeknis1, setDocTeknis1] = useState(null);
    const [docTeknis2, setDocTeknis2] = useState(null);

    const [deleteKebun, setDeleteKebun] = useState(false);
    const [deleteTeknis1, setDeleteTeknis1] = useState(false);
    const [deleteTeknis2, setDeleteTeknis2] = useState(false);
    const [docIPB, setDocIPB] = useState(null);
    const [deleteDocIPB, setDeleteDocIPB] = useState(false);

    // Import State - REMOVED


    useEffect(() => {
        fetchIPB();
    }, [id]);

    const fetchIPB = async () => {
        try {
            const res = await api.get(`/api/ipbs/${id}`);
            const data = res.data;
            setIpb(data);
            setTitle(data.title);
            setStatus(data.status);
            setStatusDetail(data.statusDetail || '');
            setLoading(false);
        } catch (error) {
            console.error('Error fetching IPB:', error);
            setLoading(false);
        }
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (status) formData.append('status', status);
        if (statusDetail !== undefined) formData.append('statusDetail', statusDetail);
        if (title !== ipb.title) formData.append('title', title);

        if (docKebun) formData.append('doc_kebun', docKebun);
        if (docTeknis1) formData.append('doc_teknis_1', docTeknis1);
        if (docTeknis2) formData.append('doc_teknis_2', docTeknis2);
        if (docIPB) formData.append('doc_ipb', docIPB);

        if (deleteKebun) formData.append('delete_doc_kebun', 'true');
        if (deleteTeknis1) formData.append('delete_doc_teknis_1', 'true');
        if (deleteTeknis2) formData.append('delete_doc_teknis_2', 'true');
        if (deleteDocIPB) formData.append('delete_doc_ipb', 'true');

        try {
            await api.put(`/api/ipbs/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('IPB berhasil diperbarui');
            setDocKebun(null);
            setDocTeknis1(null);
            setDocTeknis2(null);
            setDeleteKebun(false);
            setDeleteTeknis1(false);
            setDeleteTeknis2(false);
            setDocIPB(null);
            setDeleteDocIPB(false);
            fetchIPB();
        } catch (error) {
            console.error('Update error:', error);
            alert('Gagal memperbarui IPB');
        }
    };



    if (loading) return <div className="p-8">Memuat...</div>;
    if (!ipb) return <div className="p-8">IPB tidak ditemukan</div>;

    const isTeknis = user?.role === 'TEKNIS';
    const isKebun = user?.role === 'KEBUN';
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                    <ArrowLeft size={18} /> Kembali ke Dashboard
                </button>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div>
                            {isAdmin ? (
                                <input
                                    type="text"
                                    className="text-3xl font-bold text-gray-800 mb-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none w-full bg-transparent"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{ipb.title} (#{ipb.id})</h1>
                            )}

                            <p className="text-gray-600">Dibuat Oleh: {ipb.createdBy?.username}</p>
                        </div>
                    </div>



                    {/* Documents & Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Dokumen</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dokumen Kebun</label>
                                    {ipb.docKebunPath && !deleteKebun ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <a href={`${API_URL}/${ipb.docKebunPath}`} target="_blank" rel="noreferrer" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                <FileText size={16} /> Lihat PDF
                                            </a>
                                            {(isKebun || isAdmin) && (
                                                <button onClick={() => setDeleteKebun(true)} className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                    <Trash size={16} /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-1 mb-2">
                                            {deleteKebun ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 italic text-sm">Akan dihapus</span>
                                                    <button onClick={() => setDeleteKebun(false)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 transition-colors">Batal Hapus</button>
                                                </div>
                                            ) : <span className="text-gray-400 italic text-sm">Belum diunggah</span>}
                                        </div>
                                    )}
                                    {(isKebun || isAdmin) && (
                                        <input type="file" accept="application/pdf" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 1024 * 1024) {
                                                        alert('Ukuran file tidak boleh lebih dari 1MB');
                                                        e.target.value = null;
                                                        setDocKebun(null);
                                                    } else {
                                                        setDocKebun(file);
                                                    }
                                                }
                                            }} />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dokumen dari Bagian Teknis ke 4OPH</label>
                                    {ipb.docTeknis1Path && !deleteTeknis1 ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <a href={`http://localhost:5000/${ipb.docTeknis1Path}`} target="_blank" rel="noreferrer" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                <FileText size={16} /> Lihat PDF
                                            </a>
                                            {(isTeknis || isAdmin) && (
                                                <button onClick={() => setDeleteTeknis1(true)} className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                    <Trash size={16} /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-1 mb-2">
                                            {deleteTeknis1 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 italic text-sm">Akan dihapus</span>
                                                    <button onClick={() => setDeleteTeknis1(false)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 transition-colors">Batal Hapus</button>
                                                </div>
                                            ) : <span className="text-gray-400 italic text-sm">Belum diunggah</span>}
                                        </div>
                                    )}
                                    {(isTeknis || isAdmin) && (
                                        <input type="file" accept="application/pdf" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 1024 * 1024) {
                                                        alert('Ukuran file tidak boleh lebih dari 1MB');
                                                        e.target.value = null;
                                                        setDocTeknis1(null);
                                                    } else {
                                                        setDocTeknis1(file);
                                                    }
                                                }
                                            }} />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dokumen dari Bagian Teknis ke 4AKN</label>
                                    {ipb.docTeknis2Path && !deleteTeknis2 ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <a href={`http://localhost:5000/${ipb.docTeknis2Path}`} target="_blank" rel="noreferrer" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                <FileText size={16} /> Lihat PDF
                                            </a>
                                            {(isTeknis || isAdmin) && (
                                                <button onClick={() => setDeleteTeknis2(true)} className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                    <Trash size={16} /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-1 mb-2">
                                            {deleteTeknis2 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 italic text-sm">Akan dihapus</span>
                                                    <button onClick={() => setDeleteTeknis2(false)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 transition-colors">Batal Hapus</button>
                                                </div>
                                            ) : <span className="text-gray-400 italic text-sm">Belum diunggah</span>}
                                        </div>
                                    )}
                                    {(isTeknis || isAdmin) && (
                                        <input type="file" accept="application/pdf" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 1024 * 1024) {
                                                        alert('Ukuran file tidak boleh lebih dari 1MB');
                                                        e.target.value = null;
                                                        setDocTeknis2(null);
                                                    } else {
                                                        setDocTeknis2(file);
                                                    }
                                                }
                                            }} />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Dokumen IPB (4AKN / 4BSH)</label>
                                    {ipb.docIPBPath && !deleteDocIPB ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <a href={`http://localhost:5000/${ipb.docIPBPath}`} target="_blank" rel="noreferrer" className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                <FileText size={16} /> Lihat PDF
                                            </a>
                                            {isAdmin && (
                                                <button onClick={() => setDeleteDocIPB(true)} className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center gap-2 text-sm font-medium transition-colors">
                                                    <Trash size={16} /> Hapus
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-1 mb-2">
                                            {deleteDocIPB ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 italic text-sm">Akan dihapus</span>
                                                    <button onClick={() => setDeleteDocIPB(false)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300 transition-colors">Batal Hapus</button>
                                                </div>
                                            ) : <span className="text-gray-400 italic text-sm">Belum diunggah</span>}
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <input type="file" accept="application/pdf" className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 1024 * 1024) {
                                                        alert('Ukuran file tidak boleh lebih dari 1MB');
                                                        e.target.value = null;
                                                        setDocIPB(null);
                                                    } else {
                                                        setDocIPB(file);
                                                    }
                                                }
                                            }} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Admin / Detail</h2>
                            <div className="space-y-4">


                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status Keterangan</label>
                                    <div className={`p-2 border rounded mt-1 bg-gray-50 font-bold text-center ${statusDetail === 'Dokumen sudah lengkap' ? 'text-green-600' :
                                        statusDetail === 'Menunggu Approval' ? 'text-indigo-600' :
                                            statusDetail === 'Dokumen belum lengkap' ? 'text-yellow-600' :
                                                statusDetail === 'Dokumen kosong' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {statusDetail || '-'}
                                    </div>
                                </div>

                            </div>

                            {(isAdmin || isTeknis || isKebun) && (
                                <div className="mt-5">
                                    <button
                                        onClick={handleUpdate}
                                        className="w-full bg-emerald-600 text-white p-3.5 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                    >
                                        <Save size={18} /> Perbarui IPB
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default DetailIPB;
