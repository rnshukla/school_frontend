'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';

interface TeacherEntity {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subjectSpecialization?: string;
    colorCode: string;
}

export default function TeachersManager() {
    const [teachers, setTeachers] = useState<TeacherEntity[]>([]);
    const [teacherCount, setTeacherCount] = useState(0);
    const [maxAllowed, setMaxAllowed] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subjectSpecialization: '',
        colorCode: '#6366f1'
    });

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data.teachers);
            setTeacherCount(res.data.teacherCount);
            setMaxAllowed(res.data.maxAllowed);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/teachers', formData);
            setFormData({ name: '', email: '', phone: '', subjectSpecialization: '', colorCode: '#6366f1' });
            fetchTeachers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add teacher');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this teacher? It will remove all their timetable slots.')) return;
        try {
            await api.delete(`/teachers/${id}`);
            fetchTeachers();
        } catch (err) {
            console.error(err);
        }
    };

    const limitReached = teacherCount >= maxAllowed;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Plan Usage Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Teacher Management</h2>
                        <p className="text-slate-500 text-sm">Manage your staff and view your plan limits.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Plan Usage</span>
                        <div className="text-2xl font-black text-indigo-600">
                            {teacherCount} <span className="text-slate-400 text-lg">/ {maxAllowed}</span>
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-2.5 rounded-full ${limitReached ? 'bg-red-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${Math.min((teacherCount / maxAllowed) * 100, 100)}%` }}
                    ></div>
                </div>
                {limitReached && (
                    <p className="text-red-500 text-sm font-medium mt-3">
                        You have reached your plan limit. Please upgrade your plan to add more teachers.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Teacher</h3>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={limitReached} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={limitReached} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={limitReached} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                                <input type="text" name="subjectSpecialization" value={formData.subjectSpecialization} onChange={handleChange} disabled={limitReached} placeholder="e.g. Science" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Grid Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" name="colorCode" value={formData.colorCode} onChange={handleChange} disabled={limitReached} className="h-10 w-14 rounded cursor-pointer disabled:opacity-50" />
                                    <span className="text-sm text-slate-500 font-mono">{formData.colorCode}</span>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading || limitReached}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {limitReached ? 'Limit Reached' : (loading ? 'Adding...' : 'Add Teacher')}
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
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Teacher Info</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Specialization</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-500">No teachers found. Add your first teacher.</td>
                                    </tr>
                                ) : (
                                    teachers.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: t.colorCode }}>
                                                        {t.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{t.name}</div>
                                                        <div className="text-xs text-slate-500">{t.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {t.subjectSpecialization || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleDelete(t.id)}
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
