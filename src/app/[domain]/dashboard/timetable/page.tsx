"use client";
import { useState, useEffect } from 'react';
import api from '@/utils/api';

interface SlotData {
  id: string;
  dayOfWeek: string;
  periodNumber: number;
  class: { id: string; name: string };
  teacher: { name: string; colorCode?: string };
  subject: { name: string };
}

interface ClassOption {
  id: string;
  name: string;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const [allSlots, setAllSlots] = useState<SlotData[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        const classList = res.data.classes || [];
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch classes', err);
      }
    };
    fetchClasses();
  }, []);

  // Also try to load existing timetable on mount
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await api.get('/timetable/slots');
        if (res.data.slots && res.data.slots.length > 0) {
          setAllSlots(res.data.slots);
          setGenerated(true);
        }
      } catch (err) {
        // Ignore — maybe the endpoint doesn't exist yet
      }
    };
    fetchExisting();
  }, []);

  const generateTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/timetable/generate');
      setAllSlots(res.data.slots ?? []);
      setGenerated(true);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to generate timetable');
    } finally {
      setLoading(false);
    }
  };

  // Filter slots for selected class
  const filteredSlots = allSlots.filter(s => s.class?.id === selectedClassId);

  // Build slot lookup: "dayName-period" => slot
  const slotMap = new Map<string, SlotData>();
  filteredSlots.forEach(s => {
    slotMap.set(`${s.dayOfWeek}-${s.periodNumber}`, s);
  });

  // Determine max period from the slots
  const maxPeriod = allSlots.length > 0
    ? Math.max(...allSlots.map(s => s.periodNumber), 8)
    : 8;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Timetable Generator</h2>
        <button
          onClick={generateTimetable}
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate Timetable'}
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Class Selector */}
      {classes.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 font-medium"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {filteredSlots.length} slots assigned
          </span>
        </div>
      )}

      {/* Timetable Grid */}
      <div className="overflow-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full table-auto bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 w-20">Period</th>
              {days.map((d) => (
                <th key={d} className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(maxPeriod)].map((_, periodIdx) => {
              const period = periodIdx + 1;
              return (
                <tr key={period} className="border-t border-slate-200 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-bold text-slate-800 text-center">{period}</td>
                  {dayNames.map((dayName) => {
                    const slot = slotMap.get(`${dayName}-${period}`);
                    return (
                      <td key={dayName} className="px-2 py-2 text-center">
                        {slot ? (
                          <div
                            className="rounded-lg p-2 shadow-sm border"
                            style={{
                              backgroundColor: slot.teacher.colorCode
                                ? `${slot.teacher.colorCode}20`
                                : '#eef2ff',
                              borderColor: slot.teacher.colorCode || '#c7d2fe'
                            }}
                          >
                            <div className="font-semibold text-sm text-slate-800">{slot.subject.name}</div>
                            <div className="text-xs text-slate-600 mt-0.5">{slot.teacher.name}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {generated && allSlots.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-lg font-medium">No timetable generated.</p>
          <p className="text-sm mt-1">Make sure you have added Daily Structure (with CLASS type periods) and Mappings first.</p>
        </div>
      )}
    </div>
  );
}
