'use client';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
    const params = useParams();
    const domain = params.domain as string;
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome to {domain}</h2>
            <p className="text-slate-600">Select an option from the sidebar to manage your school.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {[
                    { title: 'Total Teachers', count: '--', color: 'bg-indigo-500', link: 'teachers' },
                    { title: 'Total Classes', count: '--', color: 'bg-blue-500', link: 'classes' },
                    { title: 'Total Subjects', count: '--', color: 'bg-teal-500', link: 'subjects' },
                    { title: 'Timetable Slots', count: '--', color: 'bg-rose-500', link: 'timetable' },
                ].map((stat, i) => (
                    <a href={`/${domain}/dashboard/${stat.link}`} key={i} className="block group">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all group-hover:shadow-md group-hover:border-slate-300">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-sm`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.count}</p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
