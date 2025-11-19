import React from 'react';
import Header from '../components/Header';
import { Building2 } from 'lucide-react';

const Assets: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Assets" subtitle="Comprehensive asset management and documentation" />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center">
          <Building2 className="mx-auto mb-4 opacity-30" size={64} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Assets Management</h3>
          <p className="text-slate-500">
            This page will show comprehensive asset details, documentation, and management features.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Assets;
