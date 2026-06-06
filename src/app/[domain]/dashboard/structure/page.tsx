'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';

interface DailyStructureEntity {
    id: string;
    sequenceNumber: number;
    label: string;
    type: 'CLASS' | 'BREAK' | 'LUNCH';
}

export default function DailyStructureManager() {
    const [structures, setStructures] = useState<DailyStructureEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        sequenceNumber: '',
        label: '',
        type: 'CLASS'
    });

    const fetchStructures = async () => {
        try {
            const res = await api.get('/daily-structures');
            setStructures(res.data.structures);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStructures();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/daily-structures', {
                ...formData,
                sequenceNumber: parseInt(formData.sequenceNumber)
            });
            setFormData({ sequenceNumber: '', label: '', type: 'CLASS' });
            fetchStructures();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add daily structure');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this period/break?')) return;
        try {
            await api.delete(`/daily-structures/${id}`);
            fetchStructures();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Daily Structure</h2>
                    <p className="text-slate-500 text-sm">Define the sequence of periods and breaks for a standard day.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add Period/Break</h3>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sequence Number</label>
                                <input type="number" name="sequenceNumber" value={formData.sequenceNumber} onChange={handleChange} required min="1" placeholder="e.g. 1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                                <input type="text" name="label" value={formData.label} onChange={handleChange} required placeholder="e.g. Period 1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="CLASS">Class</option>
                                    <option value="BREAK">Break</option>
                                    <option value="LUNCH">Lunch</option>
                                </select>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Adding...' : 'Add Structure'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Seq</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Label</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {structures.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No structures found. Define your first period.</td>
                                    </tr>
                                ) : (
                                    structures.map(s => (
                                        <tr key={s.id} className={`transition ${s.type !== 'CLASS' ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                                            <td className="px-6 py-4 font-bold text-slate-800">{s.sequenceNumber}</td>
                                            <td className="px-6 py-4 font-medium text-slate-700">{s.label}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${s.type === 'CLASS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {s.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleDelete(s.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
