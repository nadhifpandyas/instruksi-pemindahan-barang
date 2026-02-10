import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText } from 'lucide-react';

const Dashboard = () => {
    const [ipbs, setIpbs] = useState([]);
    const { user, logout } = useAuth();

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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard IPB</h1>
                    <div className="flex gap-4">
                        <span className="self-center text-gray-600">Welcome, {user?.username} ({user?.role})</span>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
                    </div>
                </div>

                <div className="mb-6">
                    {['KEBUN', 'ADMIN'].includes(user?.role) && (
                        <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center gap-2 hover:bg-blue-700">
                            <Plus size={20} /> Create New IPB
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">ID</th>
                                <th className="py-3 px-4 text-left">Title</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Created By</th>
                                <th className="py-3 px-4 text-left">Date</th>
                                <th className="py-3 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ipbs.map((ipb) => (
                                <tr key={ipb.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">#{ipb.id}</td>
                                    <td className="py-3 px-4 font-medium">{ipb.title}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold
                                            ${ipb.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                                ipb.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {ipb.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{ipb.createdBy?.username}</td>
                                    <td className="py-3 px-4">{new Date(ipb.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <Link to={`/ipb/${ipb.id}`} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                                            <FileText size={16} /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {ipbs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">No IPBs found.</td>
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
