import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Download, Upload, Save, FileText, ArrowLeft } from 'lucide-react';

const DetailIPB = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ipb, setIpb] = useState(null);
    const [loading, setLoading] = useState(true);

    // Admin/Update States
    const [status, setStatus] = useState('');
    const [statusDetail, setStatusDetail] = useState('');
    const [textIPB, setTextIPB] = useState('');
    const [docTeknis1, setDocTeknis1] = useState(null);
    const [docTeknis2, setDocTeknis2] = useState(null);

    // Import State
    const [importFile, setImportFile] = useState(null);

    useEffect(() => {
        fetchIPB();
    }, [id]);

    const fetchIPB = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/ipbs/${id}`);
            const data = res.data;
            setIpb(data);
            setStatus(data.status);
            setStatusDetail(data.statusDetail || '');
            setTextIPB(data.textIPB || '');
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
        if (statusDetail) formData.append('statusDetail', statusDetail);
        if (textIPB) formData.append('textIPB', textIPB);
        if (docTeknis1) formData.append('doc_teknis_1', docTeknis1);
        if (docTeknis2) formData.append('doc_teknis_2', docTeknis2);

        try {
            await axios.put(`http://localhost:5000/api/ipbs/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('IPB Updated successfully');
            fetchIPB();
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update IPB');
        }
    };

    const handleImport = async () => {
        if (!importFile) return;
        const formData = new FormData();
        formData.append('file', importFile);
        try {
            await axios.post(`http://localhost:5000/api/ipbs/${id}/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Items imported successfully');
            fetchIPB();
            setImportFile(null);
        } catch (error) {
            console.error('Import error:', error);
            alert('Import failed');
        }
    };

    const handleExport = () => {
        window.open(`http://localhost:5000/api/ipbs/${id}/export?token=${localStorage.getItem('token')}`, '_blank');
        // Note: Token in URL is not best practice, usually verified by cookie or handled via blob download in frontend.
        // For simplicity, assuming middleware allows or we use axios blob.
    };

    const downloadExport = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/ipbs/${id}/export`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `IPB-${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!ipb) return <div className="p-8">IPB not found</div>;

    const isTeknisOrAdmin = ['TEKNIS', 'ADMIN'].includes(user?.role);
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} /> Kembali ke Dashboard
                </button>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{ipb.title} (#{ipb.id})</h1>
                        <p className="text-gray-600">Status: <span className="font-semibold">{ipb.status}</span></p>
                        <p className="text-gray-600">Created By: {ipb.createdBy?.username}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={downloadExport} className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                            <Download size={18} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Items Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold border-b pb-2">Items</h2>
                        <div className="flex gap-2 items-center">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                className="text-sm"
                                onChange={(e) => setImportFile(e.target.files[0])}
                            />
                            <button
                                onClick={handleImport}
                                disabled={!importFile}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:bg-blue-300"
                            >
                                Import Excel
                            </button>
                        </div>
                    </div>
                    <table className="min-w-full border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-2 border">Description</th>
                                <th className="p-2 border">Qty</th>
                                <th className="p-2 border">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ipb.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="p-2 border">{item.description}</td>
                                    <td className="p-2 border">{item.quantity}</td>
                                    <td className="p-2 border">{item.unit}</td>
                                </tr>
                            ))}
                            {ipb.items.length === 0 && <tr><td colSpan="3" className="p-4 text-center">No items</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Documents & Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Documents</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dokumen Kebun</label>
                                {ipb.docKebunPath ? (
                                    <a href={`http://localhost:5000/${ipb.docKebunPath}`} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1">
                                        <FileText size={16} /> View PDF
                                    </a>
                                ) : <span className="text-gray-400">Not uploaded</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dokumen Teknis 1</label>
                                {ipb.docTeknis1Path ? (
                                    <a href={`http://localhost:5000/${ipb.docTeknis1Path}`} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1">
                                        <FileText size={16} /> View PDF
                                    </a>
                                ) : <span className="text-gray-400">Not uploaded</span>}
                                {isTeknisOrAdmin && (
                                    <input type="file" accept="application/pdf" className="mt-1 block w-full text-sm" onChange={(e) => setDocTeknis1(e.target.files[0])} />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dokumen Teknis 2</label>
                                {ipb.docTeknis2Path ? (
                                    <a href={`http://localhost:5000/${ipb.docTeknis2Path}`} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1">
                                        <FileText size={16} /> View PDF
                                    </a>
                                ) : <span className="text-gray-400">Not uploaded</span>}
                                {isTeknisOrAdmin && (
                                    <input type="file" accept="application/pdf" className="mt-1 block w-full text-sm" onChange={(e) => setDocTeknis2(e.target.files[0])} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Admin / Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                {isAdmin ? (
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="PENDING_DOCS">PENDING_DOCS</option>
                                        <option value="REVIEW">REVIEW</option>
                                        <option value="REVISION">REVISION</option>
                                        <option value="APPROVED">APPROVED</option>
                                        <option value="DONE">DONE</option>
                                    </select>
                                ) : <span className="p-2 block">{status}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Keterangan</label>
                                {isAdmin ? (
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={statusDetail}
                                        onChange={(e) => setStatusDetail(e.target.value)}
                                    >
                                        <option value="">- Select -</option>
                                        <option value="Dokumen belum lengkap">Dokumen belum lengkap</option>
                                        <option value="Dokumen belum lengkap + No material barang belum ada">Dokumen belum lengkap + No material barang belum ada</option>
                                        <option value="SUDAH_TERBIT IPB (DONE)">SUDAH_TERBIT IPB (DONE)</option>
                                    </select>
                                ) : <span className="p-2 block">{statusDetail || '-'}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dokumen IPB (4AKN/4BSH)</label>
                                {isAdmin ? (
                                    <textarea
                                        className="w-full p-2 border rounded"
                                        rows="6"
                                        value={textIPB}
                                        onChange={(e) => setTextIPB(e.target.value)}
                                    ></textarea>
                                ) : <p className="p-2 border rounded bg-gray-50 whitespace-pre-wrap">{textIPB || '-'}</p>}
                            </div>

                            {(isAdmin || isTeknisOrAdmin) && (
                                <button
                                    onClick={handleUpdate}
                                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Update IPB
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailIPB;
