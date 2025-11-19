import React from 'react';
import Header from '../components/Header';
import { TrendingUp } from 'lucide-react';

const Valuation: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Valuation" subtitle="Property valuations, market analysis, and ROI tracking" />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center">
          <TrendingUp className="mx-auto mb-4 opacity-30" size={64} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Property Valuation</h3>
          <p className="text-slate-500">
            This page will display property valuations, market trends, and ROI analysis.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Valuation;
