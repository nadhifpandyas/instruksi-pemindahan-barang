import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash } from 'lucide-react';

const CreateIPB = () => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [items, setItems] = useState([{ description: '', quantity: '', unit: '' }]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: '', unit: '' }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        if (file) {
            formData.append('doc_kebun', file);
        }
        formData.append('items', JSON.stringify(items));

        try {
            await axios.post('http://localhost:5000/api/ipbs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (error) {
            console.error('Error creating IPB:', error);
            alert('Failed to create IPB');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Create New IPB</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Title / Description of Instruction</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Upload Dokumen Kebun (PDF)</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            className="w-full p-2 border rounded"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-700 font-semibold">Items</label>
                            <button type="button" onClick={addItem} className="text-blue-600 flex items-center gap-1 hover:text-blue-800">
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="flex gap-4 mb-2 items-start">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    className="flex-grow p-2 border rounded"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    className="w-24 p-2 border rounded"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Unit"
                                    className="w-24 p-2 border rounded"
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                    required
                                />
                                {items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 mt-2">
                                        <Trash size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => navigate('/')} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
                            {loading ? 'Creating...' : 'Create IPB'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateIPB;
