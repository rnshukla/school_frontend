'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planId = searchParams.get('planId');

    const [formData, setFormData] = useState({
        subdomain: '',
        schoolName: '',
        contactPerson: '',
        contactNo: '',
        state: '',
        city: '',
        username: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    useEffect(() => {
        if (!planId) {
            router.push('/');
        }
    }, [planId, router]);

    const handleSubdomainCheck = async (value: string) => {
        const val = value.trim().toLowerCase();
        setFormData({ ...formData, subdomain: val });
        
        if (val.length < 3) {
            setSubdomainStatus('idle');
            return;
        }

        setSubdomainStatus('checking');
        try {
            const res = await api.get(`/auth/check-subdomain/${val}`);
            if (res.data.available) {
                setSubdomainStatus('available');
            } else {
                setSubdomainStatus('taken');
            }
        } catch (err) {
            setSubdomainStatus('idle');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'subdomain') {
            handleSubdomainCheck(value);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (subdomainStatus === 'taken') {
            setError('Please choose an available subdomain.');
            return;
        }
        
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/auth/register-school', {
                ...formData,
                planId
            });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!planId) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-4 py-12">
            <div className="relative z-10 w-full max-w-2xl">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Setup Your School</h1>
                        <p className="text-gray-400 mt-2 text-sm">Fill in the details to complete your plan purchase and set up your workspace.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm text-center font-medium">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Subdomain Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Workspace URL</label>
                            <div className="flex items-center">
                                <span className="px-4 py-3 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-gray-400">
                                    https://
                                </span>
                                <input
                                    name="subdomain"
                                    type="text"
                                    value={formData.subdomain}
                                    onChange={handleChange}
                                    className="flex-1 w-full px-3 py-3 border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="your-school"
                                    required
                                    pattern="[a-zA-Z0-9-]+"
                                    title="Only letters, numbers, and hyphens are allowed"
                                />
                                <span className="px-4 py-3 bg-white/5 border border-white/10 border-l-0 rounded-r-xl text-gray-400">
                                    .skoelx.com
                                </span>
                            </div>
                            <div className="mt-1 h-5">
                                {subdomainStatus === 'checking' && <span className="text-xs text-yellow-500">Checking availability...</span>}
                                {subdomainStatus === 'available' && <span className="text-xs text-green-500">Subdomain is available!</span>}
                                {subdomainStatus === 'taken' && <span className="text-xs text-red-500">Subdomain is already taken.</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">School Name</label>
                                <input
                                    name="schoolName"
                                    type="text"
                                    value={formData.schoolName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Person</label>
                                <input
                                    name="contactPerson"
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact No.</label>
                                <input
                                    name="contactNo"
                                    type="tel"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">State</label>
                                <input
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
                                <input
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <hr className="border-white/10 my-6" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Email (Username)</label>
                                <input
                                    name="username"
                                    type="email"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || subdomainStatus === 'taken'}
                                className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
