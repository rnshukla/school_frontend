'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Link from 'next/link';

interface Plan {
    id: string;
    name: string;
    maxTeachers: number;
    price: number;
    isActive: boolean;
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/plans');
                setPlans(response.data.plans);
            } catch (error) {
                console.error('Failed to fetch plans', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handlePurchase = (plan: Plan) => {
        // In a real app, integrate payment here.
        // For now, after "successful payment", redirect to register page with planId
        router.push(`/register?planId=${plan.id}`);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white pb-20">
            {/* Header */}
            <header className="flex justify-between items-center py-6 px-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Skoelx</span>
                </div>
                <nav>
                    <Link href="/login" className="px-5 py-2.5 text-sm font-medium hover:text-indigo-400 transition-colors">
                        Admin Login
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-24">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Smart Timetables for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Modern Schools
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400">
                        Choose the perfect plan based on your school's size. Manage teachers, resolve conflicts instantly, and automate your entire scheduling process.
                    </p>
                </div>

                {/* Pricing Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {plans.map((plan, index) => (
                            <div 
                                key={plan.id}
                                className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                                    index === 1 
                                    ? 'bg-slate-800/80 border-indigo-500 shadow-indigo-500/20 transform md:-translate-y-4' 
                                    : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                                }`}
                            >
                                {index === 1 && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold">₹{plan.price}</span>
                                    <span className="text-slate-400">/lifetime</span>
                                </div>
                                
                                <ul className="space-y-4 mb-8 text-slate-300">
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Up to <strong className="text-white ml-1">{plan.maxTeachers} Teachers</strong>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Automated Timetable Generation
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Conflict Detection
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Custom Subdomain Login
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handlePurchase(plan)}
                                    className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
                                        index === 1
                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                                    }`}
                                >
                                    Purchase Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
