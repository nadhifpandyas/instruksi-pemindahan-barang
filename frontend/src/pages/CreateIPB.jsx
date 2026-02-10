import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateIPB = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [textIPB, setTextIPB] = useState('');

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('textIPB', textIPB);
        if (file) {
            formData.append('doc_kebun', file);
        }

        try {
            await axios.post('http://localhost:5000/api/ipbs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (error) {
            console.error('Error creating IPB:', error);
            alert('Gagal membuat IPB');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Buat IPB Baru</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Isu</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {user?.role !== 'ADMIN' && (
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Unggah Dokumen Kebun (PDF) <span className="text-gray-400 text-sm">(Opsional)</span></label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="w-full p-2 border rounded"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
                            {loading ? 'Membuat...' : 'Buat IPB'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIPB;
