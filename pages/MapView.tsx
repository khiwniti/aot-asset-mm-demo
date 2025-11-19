import React from 'react';
import Header from '../components/Header';
import { MapPin } from 'lucide-react';

const MapView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Map View" subtitle="Geographic visualization of portfolio properties" />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center">
          <MapPin className="mx-auto mb-4 opacity-30" size={64} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Map View</h3>
          <p className="text-slate-500">
            This page will display an interactive map showing all properties geographically.
          </p>
        </div>
      </main>
    </div>
  );
};

export default MapView;
