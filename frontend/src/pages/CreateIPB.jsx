import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, FileText, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateIPB = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [file2, setFile2] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        // textIPB is intentionally omitted as per recent consolidation/simplification logic

        if (file) {
            if (user?.role === 'TEKNIS') {
                formData.append('doc_teknis_1', file);
            } else {
                formData.append('doc_kebun', file);
            }
        }
        if (file2 && user?.role === 'TEKNIS') {
            formData.append('doc_teknis_2', file2);
        }

        try {
            await api.post('/api/ipbs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (error) {
            console.error('Error creating IPB:', error);
            alert('Gagal membuat IPB: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFileAction = (incomingFile, setFileFn) => {
        if (incomingFile) {
            if (incomingFile.type !== 'application/pdf') {
                alert('Hanya file PDF yang diperbolehkan');
                return;
            }
            if (incomingFile.size > 1024 * 1024) {
                alert('Ukuran file tidak boleh lebih dari 1MB');
                return;
            }
            setFileFn(incomingFile);
        }
    };

    const handleFileChange = (e, setFileFn) => {
        const selectedFile = e.target.files[0];
        handleFileAction(selectedFile, setFileFn);
    };

    const handleDrop = (e, setFileFn) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        handleFileAction(droppedFile, setFileFn);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const CompactFileUpload = ({ selectedFile, setFileFn, label, id }) => (
        <div className="flex-1">
            <label className="block text-slate-700 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">{label}</label>
            <div
                className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group h-[140px] ${selectedFile
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/10'
                    }`}
                onClick={() => !selectedFile && document.getElementById(`file-input-${id}`).click()}
                onDragOver={handleDragOver}
                onDrop={(e) => !selectedFile && handleDrop(e, setFileFn)}
            >
                {!selectedFile ? (
                    <>
                        <UploadCloud className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                        <p className="text-emerald-900 font-bold text-xs text-center">Klik atau seret PDF</p>
                        <p className="text-slate-400 text-[10px] mt-1">Maks. 1MB</p>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <FileText className="text-emerald-600" size={20} />
                        </div>
                        <p className="text-slate-800 font-bold text-[10px] truncate w-full text-center px-2">{selectedFile.name}</p>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFileFn(null);
                            }}
                            className="bg-rose-50 text-rose-500 p-1.5 rounded-md hover:bg-rose-100 transition-colors"
                        >
                            <Trash size={14} />
                        </button>
                    </div>
                )}
                <input
                    id={`file-input-${id}`}
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, setFileFn)}
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 flex items-center justify-center font-['Poppins',sans-serif]">
            <div className="w-full max-w-5xl">
                {/* Compact Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2 px-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">Buat IPB Baru</h1>
                        <p className="text-slate-500 text-sm font-medium">Lengkapi data dan dokumen di bawah ini.</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Left Column: Isu */}
                            <div className="flex flex-col justify-between">
                                <div>
                                    <label className="block text-slate-700 text-xs font-bold mb-3 ml-1 uppercase tracking-[0.1em]">Isu / Keterangan Masalah</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 focus:bg-white outline-none transition-all text-slate-800 text-base placeholder:text-slate-300 shadow-sm resize-none h-[180px]"
                                        placeholder="Tuliskan keterangan isu atau alasan pemindahan barang secara mendetail..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Right Column: Uploads */}
                            <div>
                                <div className={`flex flex-col sm:flex-row gap-4 ${user?.role === 'TEKNIS' ? '' : 'sm:max-w-[240px]'}`}>
                                    {user?.role !== 'ADMIN' && (
                                        <CompactFileUpload
                                            selectedFile={file}
                                            setFileFn={setFile}
                                            label={user?.role === 'TEKNIS' ? 'Dok. Teknis (4OPH)' : 'Dokumen Kebun'}
                                            id="main-doc"
                                        />
                                    )}

                                    {user?.role === 'TEKNIS' && (
                                        <CompactFileUpload
                                            selectedFile={file2}
                                            setFileFn={setFile2}
                                            label="Dok. Teknis (4AKN)"
                                            id="second-doc"
                                        />
                                    )}
                                </div>

                                {/* Tips Box */}
                                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 h-fit items-start">
                                    <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700 shrink-0">
                                        <FileText size={16} />
                                    </div>
                                    <div className="text-[11px] leading-relaxed text-amber-800">
                                        <p className="font-bold uppercase tracking-wider mb-1">Panduan Pengunggahan:</p>
                                        <ul className="list-disc ml-3 space-y-1 opacity-80">
                                            <li>Gunakan format file <strong>PDF</strong></li>
                                            <li>Ukuran berkas masing-masing maksimal <strong>1 MB</strong></li>
                                            <li>Pastikan dokumen terlihat jelas dan terbaca</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons: Unified Row */}
                        <div className="flex justify-end items-center gap-6 mt-10 border-t border-slate-50 pt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="text-slate-400 hover:text-slate-600 font-bold tracking-wide transition-colors uppercase text-xs"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-12 py-4 rounded-xl transition-all shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/20 active:transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        <span>Buat IPB</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Center */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 opacity-60">
                    <CheckCircle2 size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Validated by PTPN IV Regional IV System</p>
                </div>
            </div>
        </div>
    );
};

export default CreateIPB;
