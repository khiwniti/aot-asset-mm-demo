import React from 'react';
import Header from '../components/Header';
import { Calendar } from 'lucide-react';

const CalendarView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Calendar" subtitle="Schedule, events, and important dates" />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center">
          <Calendar className="mx-auto mb-4 opacity-30" size={64} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Calendar View</h3>
          <p className="text-slate-500">
            This page will show a calendar with lease expirations, maintenance schedules, and important events.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CalendarView;
