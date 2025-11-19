
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
  ArrowRight
} from 'lucide-react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { PROPERTIES } from '../services/mockData';
import { Link } from 'react-router-dom';

const PropertyListing: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeTab, setActiveTab] = useState('Region listing');

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
        title="Property Listing" 
        subtitle={activeTab === 'Region listing' ? 'Overview of district performance and opportunities.' : "Manage your portfolio, view details, and track occupancy."}
      />

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Region Listing specific Layout */}
        {activeTab === 'Region listing' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* KPI Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {regionStats.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 relative group">
                     <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AIAssistButton prompt={`Explain the ${stat.label} metric for this region. Is ${stat.value} good compared to the market?`} />
                     </div>
                     <p className="text-sm font-bold text-slate-700 mb-2">{stat.label}</p>
                     <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                     <div className="flex items-center gap-1 text-xs">
                       {stat.trend === true && <ArrowUpRight size={14} className="text-green-500" />}
                       <span className={stat.trend === true ? 'text-green-600 font-medium' : 'text-slate-500'}>{stat.sub}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Controls & Filters */}
        <div className={`${activeTab === 'Region listing' ? 'mb-6' : 'bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
              {['Property listing', 'Region listing', 'Tenant list'].map((tab, i) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters (Only show for Property listing view as per design) */}
            {activeTab === 'Property listing' && (
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
            )}
          </div>
          
          {/* Secondary Toolbar for Property Listing */}
          {activeTab === 'Property listing' && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <span>Showing <span className="font-bold text-slate-800">{filteredProperties.length}</span> properties</span>
                <AIAssistButton prompt="Filter these properties to show only those with occupancy below 80%." tooltip="Ask AI to filter" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TAB CONTENT: Region Listing */}
        {activeTab === 'Region listing' && (
          <div className="space-y-8 animate-in fade-in">
             {/* Region Selection Pills */}
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {regions.map(region => (
                   <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                         selectedRegion === region 
                         ? 'bg-blue-600 text-white border-blue-600' 
                         : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                   >
                      {region}
                   </button>
                ))}
             </div>

             {/* Map & List Container */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg text-slate-800">District : Suvarnabhumi Airport | BKK</h3>
                   <AIAssistButton prompt="Analyze this district's map data. Where are the growth hotspots?" />
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                   {/* Map Visual (Left) */}
                   <div className="lg:flex-1 bg-blue-50/30 rounded-xl h-[500px] border border-blue-100 relative overflow-hidden group">
                      {/* Abstract Map SVG */}
                      <svg viewBox="0 0 800 500" className="w-full h-full">
                         <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                               <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                            </pattern>
                         </defs>
                         <rect width="100%" height="100%" fill="url(#grid)" />
                         
                         {/* Map shapes mimicking districts */}
                         <path d="M100,150 L250,100 L400,120 L450,250 L350,350 L150,400 L50,300 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" className="hover:fill-blue-50 transition-colors"/>
                         <path d="M400,120 L600,80 L750,200 L700,350 L450,250 Z" fill="white" stroke="#cbd5e1" strokeWidth="2" className="hover:fill-blue-50 transition-colors"/>
                         
                         {/* Highlighted District */}
                         <path d="M350,350 L450,250 L550,300 L500,450 L300,480 L200,400 Z" fill="#eff6ff" stroke="#3b82f6" strokeWidth="3" />
                         <text x="380" y="380" className="text-xs font-bold fill-blue-600">Suvarnabhumi</text>
                         
                         {/* Pins */}
                         <circle cx="400" cy="300" r="4" fill="#ef4444" />
                         <circle cx="420" cy="320" r="4" fill="#3b82f6" />
                         <circle cx="450" cy="280" r="4" fill="#3b82f6" />
                         
                         {/* Connecting lines example */}
                         <path d="M550,300 L650,350" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                      </svg>

                      {/* Legend Overlay */}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow border border-slate-200 text-xs space-y-2">
                         <div className="font-bold text-slate-800 mb-1 border-b border-slate-100 pb-1">เขตเทศบาล</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> เขตเทศบาลนคร</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-300 rounded-sm"></div> เขตเทศบาลเมือง</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 rounded-sm"></div> เขตเทศบาลตำบล</div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">●</div> ที่ตั้งสำนักงาน</div>
                      </div>
                   </div>

                   {/* Property List (Right Sidebar) */}
                   <div className="w-full lg:w-[380px] shrink-0 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="font-bold text-slate-800">All properties</h4>
                         <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                            <MapIcon size={16} />
                         </button>
                      </div>
                      <div className="relative mb-4">
                         <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                         <input 
                            type="text" 
                            placeholder="Search location" 
                            className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                         />
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2 mb-2">
                         <span>Name</span>
                         <span>District</span>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 max-h-[400px] space-y-1 custom-scrollbar">
                         {regionProperties.map((prop, i) => (
                            <div key={i} className="flex justify-between items-center py-3 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors border-b border-slate-50">
                               <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate max-w-[200px]">{prop.name}</span>
                               <span className="text-xs text-slate-500">{prop.district}</span>
                            </div>
                         ))}
                         {/* Duplicate for scroll effect */}
                         {regionProperties.map((prop, i) => (
                            <div key={`dup-${i}`} className="flex justify-between items-center py-3 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors border-b border-slate-50">
                               <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate max-w-[200px]">{prop.name.replace('6', '7')}</span>
                               <span className="text-xs text-slate-500">{prop.district}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* Insights Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Opportunities */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg text-slate-800">Potential opportunities</h3>
                         <AIAssistButton prompt="Analyze these opportunities. Which one offers the highest ROI?" />
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                         <TrendingUp size={16} />
                      </div>
                   </div>
                   <div className="space-y-6">
                      {opportunities.map((opp, i) => (
                         <div key={i} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2
                               ${opp.type === 'Rent increase' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                               {opp.type}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{opp.title}</h4>
                            <p className="text-xs text-slate-500 mb-3">{opp.desc}</p>
                            <div className="flex items-end justify-between">
                               <div>
                                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                     {opp.prevValue && <span className="text-slate-400 font-normal line-through decoration-slate-400">{opp.prevValue}</span>} 
                                     {opp.prevValue && <ArrowRight size={12} className="text-slate-400" />}
                                     {opp.value}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                     <MapIcon size={10} /> {opp.location}
                                  </div>
                                  <div className="text-[10px] text-slate-400 ml-3.5">{opp.subLocation}</div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Threats */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg text-slate-800">Potential threats</h3>
                         <AIAssistButton prompt="How should I mitigate these threats? Draft a response plan." />
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                         <TrendingUp size={16} />
                      </div>
                   </div>
                   <div className="space-y-6">
                      {threats.map((threat, i) => (
                         <div key={i} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 bg-red-100 text-red-700">
                               {threat.type}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{threat.title}</h4>
                            <p className="text-xs text-slate-500 mb-3">{threat.desc}</p>
                            <div className="flex items-end justify-between">
                               <div className="w-full">
                                  <div className={`text-xs font-bold ${threat.trend === 'down' ? 'text-red-600' : 'text-slate-800'} flex justify-between items-center`}>
                                     {threat.value}
                                     {threat.trend === 'down' && <TrendingUp size={12} className="rotate-180 text-red-500" />}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                     <MapIcon size={10} /> {threat.location}
                                  </div>
                                  <div className="text-[10px] text-slate-400 ml-3.5">{threat.subLocation}</div>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TAB CONTENT: Property Listing (Existing List/Grid) */}
        {activeTab === 'Property listing' && (
          viewMode === 'list' ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property Name</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Region</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Rent</th>
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
                      <td className="p-4 text-sm text-slate-600">{property.city}</td>
                      <td className="p-4 text-sm font-medium text-slate-800">฿{property.monthlyRent.toLocaleString()}</td>
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
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <div className="flex gap-1">
                     <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md text-sm">1</button>
                     <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md text-sm">2</button>
                     <button className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md text-sm">3</button>
                  </div>
                  <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                    Next <ChevronRight size={14} />
                  </button>
               </div>
            </div>
          ) : (
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
                        <p className="text-sm text-slate-500">{property.city}</p>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-bold text-slate-800">฿{property.monthlyRent.toLocaleString()}</div>
                         <div className="text-[10px] text-slate-400 uppercase">Per Month</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-slate-100">
                       <div>
                          <span className="text-xs text-slate-400 block">Total Value</span>
                          <span className="font-medium text-slate-700">฿{(property.value / 1000000).toFixed(1)}M</span>
                       </div>
                       <div>
                          <span className="text-xs text-slate-400 block">Occupancy</span>
                          <span className="font-medium text-slate-700">{property.occupancyRate}%</span>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* TAB CONTENT: Tenant List (Placeholder) */}
        {activeTab === 'Tenant list' && (
           <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-400 animate-in fade-in">
              <p>Tenant list view is currently under development.</p>
              <button className="mt-4 text-blue-600 font-medium text-sm hover:underline" onClick={() => setActiveTab('Property listing')}>Go back to properties</button>
           </div>
        )}
      </main>
    </div>
  );
};

export default PropertyListing;
