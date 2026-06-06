import React from 'react';

interface Slot {
  id: string;
  dayOfWeek: string;
  periodNumber: number;
  class: { name: string };
  teacher: { name: string };
  subject: { name: string };
}

interface TimetableGridProps {
  slots: Slot[];
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const maxPeriods = 8; // assuming up to 8 periods per day

export default function TimetableGrid({ slots }: TimetableGridProps) {
  // Build a lookup for quick access
  const slotMap = new Map<string, Slot>();
  slots.forEach((s) => {
    slotMap.set(`${s.dayOfWeek}-${s.periodNumber}`, s);
  });

  return (
    <div className="overflow-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full table-auto bg-white/60 backdrop-blur-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">Period</th>
            {days.map((d) => (
              <th key={d} className="px-4 py-2 text-center text-sm font-medium text-slate-700">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(maxPeriods)].map((_, periodIdx) => {
            const period = periodIdx + 1;
            return (
              <tr key={period} className="border-t border-slate-200">
                <td className="px-4 py-2 font-semibold text-slate-800 text-center">{period}</td>
                {dayNames.map((dayName, dayIdx) => {
                  const slot = slotMap.get(`${dayName}-${period}`);
                  return (
                    <td
                      key={dayName}
                      className="px-2 py-2 text-center text-sm text-slate-800"
                    >
                      {slot ? (
                        <div className="bg-white/70 rounded-lg p-1 shadow">
                          <div className="font-medium">{slot.subject.name}</div>
                          <div className="text-xs text-slate-600">{slot.class.name}</div>
                          <div className="text-xs text-slate-500">{slot.teacher.name}</div>
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
  );
}
