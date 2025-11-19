import React from 'react';
import Header from '../components/Header';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Settings" subtitle="System preferences and configuration" />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center">
          <SettingsIcon className="mx-auto mb-4 opacity-30" size={64} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Settings</h3>
          <p className="text-slate-500">
            This page will contain system settings, user preferences, and configuration options.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
