'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';

interface SubjectEntity {
    id: string;
    name: string;
}

export default function SubjectsManager() {
    const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data.subjects);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError('');
        try {
            await api.post('/subjects', { name: name.trim() });
            setName('');
            fetchSubjects();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add subject');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subject? It will remove all associated timetable slots.')) return;
        try {
            await api.delete(`/subjects/${id}`);
            fetchSubjects();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Subject</h3>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                <form onSubmit={handleAdd} className="flex gap-4">
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Mathematics" 
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Subject'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Subject Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No subjects found. Add your first subject above.</td>
                            </tr>
                        ) : (
                            subjects.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
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
    );
}
