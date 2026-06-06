'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';

interface MappingEntity {
    id: string;
    teacher: { id: string; name: string; colorCode: string };
    class: { id: string; name: string };
    subject: { id: string; name: string };
    periodsPerWeek: number;
}

export default function MappingManager() {
    const [mappings, setMappings] = useState<MappingEntity[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        teacherId: '',
        classId: '',
        subjectId: '',
        periodsPerWeek: '5'
    });

    const fetchData = async () => {
        try {
            const [mapRes, teachRes, classRes, subRes] = await Promise.all([
                api.get('/mappings'),
                api.get('/teachers'),
                api.get('/classes'),
                api.get('/subjects')
            ]);
            setMappings(mapRes.data.mappings);
            setTeachers(teachRes.data.teachers);
            setClasses(classRes.data.classes);
            setSubjects(subRes.data.subjects);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/mappings', {
                ...formData,
                periodsPerWeek: parseInt(formData.periodsPerWeek)
            });
            setFormData({ ...formData, classId: '', periodsPerWeek: '5' }); // Keep teacher/subject selected for faster entry
            const mapRes = await api.get('/mappings');
            setMappings(mapRes.data.mappings);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add mapping');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/mappings/${id}`);
            const mapRes = await api.get('/mappings');
            setMappings(mapRes.data.mappings);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Teacher Assignments (Mappings)</h2>
                    <p className="text-slate-500 text-sm">Assign teachers to subjects and classes with their required weekly periods.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">New Assignment</h3>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                        
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                                <select name="teacherId" value={formData.teacherId} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="" disabled>Select a teacher</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="" disabled>Select a subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                                <select name="classId" value={formData.classId} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                    <option value="" disabled>Select a class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Periods per Week</label>
                                <input type="number" name="periodsPerWeek" value={formData.periodsPerWeek} onChange={handleChange} required min="1" max="20" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Assigning...' : 'Assign Teacher'}
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
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Teacher</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Subject</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Class</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600">Periods/Wk</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mappings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No assignments found.</td>
                                    </tr>
                                ) : (
                                    mappings.map(m => (
                                        <tr key={m.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.teacher.colorCode }}></div>
                                                    <span className="font-medium text-slate-800">{m.teacher.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{m.subject.name}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{m.class.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{m.periodsPerWeek}</td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleDelete(m.id)}
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
