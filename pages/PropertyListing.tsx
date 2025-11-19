
import React, { useState } from 'react';
import { 
  List, 
  Grid, 
  Map as MapIcon, 
  MoreVertical, 
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpRight,
  TrendingUp,
  ArrowRight,
  MapPin
} from 'lucide-react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { PROPERTIES } from '../services/mockData';
import { Link } from 'react-router-dom';

const PropertyListing: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedType, setSelectedType] = useState<string>('All');

  const filteredProperties = selectedType === 'All' 
    ? PROPERTIES 
    : PROPERTIES.filter(p => p.type === selectedType);

  // Region Listing Mock Data
  const regionStats = [
    { label: 'Total properties', value: '72', sub: '2 properties added last month', trend: null },
    { label: 'Vacant properties', value: '12 available', sub: '2 properties rented out last month', trend: null },
    { label: 'Total occupancy rate', value: '76%', sub: 'Increased by 2% last month', trend: true },
    { label: 'Average rent yield', value: '5.2%', sub: 'Increased by 0.1% last month', trend: true },
  ];

  const regions = ['Bangkok - BKK', 'Bangkok - DMK', 'Phuket - HKT', 'Hat Yai - HDY', 'Chiang Mai - CNX', 'Chiang Rai - CEI'];
  const [selectedRegion, setSelectedRegion] = useState('Bangkok - BKK');

  const regionProperties = [
    { name: '612/21 Suvarnabhumi residence', district: 'Bang sao thong' },
    { name: '613/21 Airport side apartment', district: 'Samut Prakan' },
    { name: '632/21 Airport side apartment', district: 'Samut Prakan' },
    { name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong' },
    { name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong' },
    { name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong' },
  ];

  const opportunities = [
    {
      type: 'Rent increase',
      title: '+23% Rent Upside Identified',
      value: '24,600 THB/month',
      prevValue: '20,000',
      desc: 'Our AI has identified a strong rent growth signal driven by high occupancy and rising district demand.',
      location: '615/21 Sriracha View',
      subLocation: 'Bang Sao Thong District'
    },
    {
      type: 'Renovation ROI',
      title: 'Kitchen Upgrade ROI - Increase Rent Value',
      value: '+15-25%',
      desc: 'Renovating the kitchen could significantly lift both rental rates and long-term property value.',
      location: '632/21 Suvarnabhumi residence',
      subLocation: 'Bang Sao Thong District'
    },
    {
      type: 'Rent increase',
      title: '+10% Rent Upside Identified',
      value: '30,250 THB/month',
      prevValue: '27,500',
      desc: 'Our AI has identified a strong rent growth signal driven by high occupancy and rising district demand.',
      location: '632/32 Suvarnabhumi residence',
      subLocation: 'Bang Sao Thong District'
    }
  ];

  const threats = [
    {
      type: 'Risk alert',
      title: '2 months payment overdue.',
      value: 'Unpaid balance: 50,000 THB',
      desc: 'Tenant has missed rent for 2 months in a row.',
      location: '623/21 Urban Bang Phli',
      subLocation: 'Bang Sao Thong District',
      trend: 'neutral'
    },
    {
      type: 'Risk alert',
      title: 'Pricing Adjustment Recommended',
      value: '2% above market',
      desc: 'Unit 623/21 Urban Bang Phli appears to be slightly overpriced vs. similar listings in the area.',
      location: '623/21 Urban Bang Phli',
      subLocation: 'Bang Sao Thong District',
      trend: 'down'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header 
        title="Portfolio Overview" 
        subtitle="Browse and filter all properties in the portfolio"
      />

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* Controls & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search properties..." 
                className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
              <div className="relative">
                <select 
                    className="appearance-none bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">Property type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  <option>Region</option>
                  <option>Bangkok</option>
                  <option>Phuket</option>
                </select>
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-sm rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                  <option>Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Secondary Toolbar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <span>Showing <span className="font-bold text-slate-800">{filteredProperties.length}</span> properties</span>
              <AIAssistButton prompt="Filter these properties to show only those with occupancy below 80%." tooltip="Ask AI to filter" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                title="List View"
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button 
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
                title="Map View (Coming Soon)"
              >
                <MapIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid/List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {filteredProperties.map((property) => (
              <Link to={`/properties/${property.id}`} key={property.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                <div className="h-48 overflow-hidden relative">
                  <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm
                        ${property.status === 'Active' ? 'bg-white/90 text-green-700 backdrop-blur-sm' : 
                          'bg-white/90 text-yellow-700 backdrop-blur-sm'}`}>
                        {property.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{property.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {property.city}
                      </p>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-bold text-slate-800">฿{(property.value / 1000000).toFixed(1)}M</div>
                       <div className="text-[10px] text-slate-400 uppercase">Value</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-slate-100">
                     <div>
                        <span className="text-xs text-slate-400 block">Occupancy</span>
                        <span className={`font-bold ${property.occupancyRate >= 90 ? 'text-green-600' : 'text-slate-700'}`}>{property.occupancyRate}%</span>
                     </div>
                     <div>
                        <span className="text-xs text-slate-400 block">Monthly Rent</span>
                        <span className="font-medium text-slate-700">฿{property.monthlyRent.toLocaleString()}</span>
                     </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      View Details
                    </button>
                    <button className="text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Occupancy</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="p-4">
                      <Link to={`/properties/${property.id}`} className="block">
                        <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{property.name}</div>
                        <div className="text-xs text-slate-400">{property.address}</div>
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-600 flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      {property.city}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-800">฿{(property.value / 1000000).toFixed(1)}M</td>
                    <td className="p-4">
                      <span className={`text-sm font-semibold ${property.occupancyRate >= 90 ? 'text-green-600' : 'text-slate-700'}`}>
                        {property.occupancyRate}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${property.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                <ChevronLeft size={14} /> Prev
              </button>
              <div className="text-sm text-slate-500">
                Page <span className="font-bold text-slate-800">1</span> of <span className="font-bold text-slate-800">5</span>
              </div>
              <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PropertyListing;
