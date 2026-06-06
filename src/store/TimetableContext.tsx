'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type ClassItem = { id: string; name: string; section: string; room: string };
export type Teacher = { id: string; name: string; expertise: string; maxHours: number };
export type Subject = { id: string; name: string; code: string; type: 'Core' | 'Elective' };
export type Mapping = { id: string; classId: string; subjectId: string; teacherId: string; periods: number };

export type TimetableSlot = {
  subjectId: string;
  teacherId: string;
  isLunch?: boolean;
};
export type TimetableDay = Record<number, TimetableSlot | null>;
export type ClassTimetable = Record<string, TimetableDay>;
export type TimetableStateData = Record<string, ClassTimetable>;

type State = {
  classes: ClassItem[];
  teachers: Teacher[];
  subjects: Subject[];
  mappings: Mapping[];
  timetables: TimetableStateData;
  timetablesGenerated: number;
};

const initialClasses: ClassItem[] = [
  { id: 'c1', name: '6', section: 'A', room: '101' },
  { id: 'c2', name: '6', section: 'B', room: '102' },
  { id: 'c3', name: '7', section: 'A', room: '103' },
  { id: 'c4', name: '8', section: 'A', room: '104' },
  { id: 'c5', name: '9', section: 'A', room: '105' },
  { id: 'c6', name: '9', section: 'B', room: '106' },
  { id: 'c7', name: '10', section: 'A', room: '107' },
  { id: 'c8', name: '10', section: 'B', room: '108' },
];

const initialTeachers: Teacher[] = [
  { id: 't1', name: 'Mr. Sharma', expertise: 'Mathematics', maxHours: 30 },
  { id: 't2', name: 'Ms. Verma', expertise: 'Science', maxHours: 28 },
  { id: 't3', name: 'Mr. Khan', expertise: 'English', maxHours: 25 },
  { id: 't4', name: 'Ms. Gupta', expertise: 'Hindi', maxHours: 25 },
  { id: 't5', name: 'Mr. Tiwari', expertise: 'Social Studies', maxHours: 24 },
  { id: 't6', name: 'Ms. Rao', expertise: 'Computer Science', maxHours: 20 },
  { id: 't7', name: 'Mr. Mishra', expertise: 'Physical Education', maxHours: 20 },
  { id: 't8', name: 'Ms. Joshi', expertise: 'Art & Craft', maxHours: 15 },
];

const initialSubjects: Subject[] = [
  { id: 's1', name: 'Mathematics', code: 'MATH', type: 'Core' },
  { id: 's2', name: 'Science', code: 'SCI', type: 'Core' },
  { id: 's3', name: 'English', code: 'ENG', type: 'Core' },
  { id: 's4', name: 'Hindi', code: 'HIN', type: 'Core' },
  { id: 's5', name: 'Social Studies', code: 'SST', type: 'Core' },
  { id: 's6', name: 'Computer Science', code: 'CS', type: 'Elective' },
  { id: 's7', name: 'Physical Education', code: 'PE', type: 'Elective' },
  { id: 's8', name: 'Art & Craft', code: 'ART', type: 'Elective' },
];

const initialMappings: Mapping[] = [
  { id: 'm1', classId: 'c7', subjectId: 's1', teacherId: 't1', periods: 6 },
  { id: 'm2', classId: 'c7', subjectId: 's2', teacherId: 't2', periods: 5 },
  { id: 'm3', classId: 'c7', subjectId: 's3', teacherId: 't3', periods: 5 },
  { id: 'm4', classId: 'c7', subjectId: 's4', teacherId: 't4', periods: 4 },
  { id: 'm5', classId: 'c7', subjectId: 's5', teacherId: 't5', periods: 4 },
  { id: 'm6', classId: 'c7', subjectId: 's6', teacherId: 't6', periods: 3 },
  { id: 'm7', classId: 'c7', subjectId: 's7', teacherId: 't7', periods: 2 },
  { id: 'm8', classId: 'c7', subjectId: 's8', teacherId: 't8', periods: 1 },
];

const initialState: State = {
  classes: initialClasses,
  teachers: initialTeachers,
  subjects: initialSubjects,
  mappings: initialMappings,
  timetables: {},
  timetablesGenerated: 0,
};

type Action =
  | { type: 'ADD_CLASS'; payload: ClassItem }
  | { type: 'DELETE_CLASS'; payload: string }
  | { type: 'ADD_TEACHER'; payload: Teacher }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'ADD_MAPPING'; payload: Mapping }
  | { type: 'SET_TIMETABLES'; payload: TimetableStateData }
  | { type: 'UPDATE_TIMETABLE_CELL'; payload: { classId: string; day: string; period: number; slot: TimetableSlot | null } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CLASS': return { ...state, classes: [...state.classes, action.payload] };
    case 'DELETE_CLASS': return { ...state, classes: state.classes.filter(c => c.id !== action.payload) };
    case 'ADD_TEACHER': return { ...state, teachers: [...state.teachers, action.payload] };
    case 'ADD_SUBJECT': return { ...state, subjects: [...state.subjects, action.payload] };
    case 'ADD_MAPPING': return { ...state, mappings: [...state.mappings, action.payload] };
    case 'SET_TIMETABLES': return { ...state, timetables: action.payload, timetablesGenerated: state.timetablesGenerated + 1 };
    case 'UPDATE_TIMETABLE_CELL': {
      const { classId, day, period, slot } = action.payload;
      const classTt = state.timetables[classId] || {};
      const dayTt = classTt[day] || {};
      return {
        ...state,
        timetables: {
          ...state.timetables,
          [classId]: {
            ...classTt,
            [day]: { ...dayTt, [period]: slot }
          }
        }
      };
    }
    default: return state;
  }
}

const TimetableContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TimetableContext.Provider value={{ state, dispatch }}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) throw new Error('useTimetable must be used within TimetableProvider');
  return context;
}
