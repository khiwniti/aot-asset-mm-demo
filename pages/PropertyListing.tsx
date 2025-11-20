import { useState } from 'react';
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
import LeafletMap from '../components/LeafletMap';
import { Property } from '../types';

const PropertyListing = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeTab, setActiveTab] = useState('Property listing');
  const [selectedRegion, setSelectedRegion] = useState('Bangkok - BKK');

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

  const regionProperties = [
    { id: 1, name: '612/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6900, lng: 100.7501, price: '12,000' },
    { id: 2, name: '613/21 Airport side apartment', district: 'Samut Prakan', lat: 13.6950, lng: 100.7550, price: '15,000' },
    { id: 3, name: '632/21 Airport side apartment', district: 'Samut Prakan', lat: 13.6850, lng: 100.7450, price: '14,500' },
    { id: 4, name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6920, lng: 100.7520, price: '12,500' },
    { id: 5, name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6880, lng: 100.7480, price: '12,000' },
    { id: 6, name: '632/21 Suvarnabhumi residence', district: 'Bang sao thong', lat: 13.6930, lng: 100.7580, price: '13,000' },
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

  const renderPropertyView = () => {
    switch (viewMode) {
      case 'map':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] animate-in fade-in z-0 relative overflow-hidden">
            <LeafletMap
              properties={filteredProperties}
              center={[13.736717, 100.523186]}
              zoom={10}
              height="100%"
              showCluster={true}
              onMarkerClick={(property: Property) => {
                window.location.hash = `#/properties/${property.id}`;
              }}
            />
          </div>
        );
      case 'grid':
        return (
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
        );
      case 'list':
      default:
        return (
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header 
        title="Property Listing" 
        subtitle={activeTab === 'Region listing' ? 'Overview of district performance and opportunities.' : "Manage your portfolio, view details, and track occupancy."}
      />

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Controls & Filters */}
        <div className={`${activeTab === 'Region listing' ? 'mb-6' : 'bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
              {['Property listing', 'Region listing', 'Tenant list'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    // Reset view mode if switching away from Property listing
                    if (tab !== 'Property listing' && viewMode === 'map') setViewMode('list');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters */}
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
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Map View"
                >
                  <MapIcon size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENT RENDERER */}
        {activeTab === 'Property listing' ? renderPropertyView() : null}

        {/* Region Listing Content */}
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

             {/* Property List without Map */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-lg text-slate-800">District: Suvarnabhumi Airport | BKK</h3>
                   <AIAssistButton prompt="Analyze this district. What are the key insights?" />
                </div>
                
                <div className="space-y-2">
                   <h4 className="font-semibold text-slate-700 mb-3">Properties in this region ({regionProperties.length})</h4>
                   {regionProperties.map((prop, i) => (
                      <div key={i} className="flex justify-between items-center py-3 px-4 bg-slate-50 hover:bg-blue-50 rounded-lg cursor-pointer group transition-colors">
                         <div>
                            <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 block">{prop.name}</span>
                            <span className="text-xs text-slate-500">{prop.district}</span>
                         </div>
                         <span className="text-sm font-semibold text-slate-700">฿{prop.price}/month</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Insights Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 className="font-bold text-lg text-slate-800 mb-4">Potential Opportunities</h3>
                   <p className="text-sm text-slate-600">AI-powered insights will be displayed here.</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                   <h3 className="font-bold text-lg text-slate-800 mb-4">Potential Threats</h3>
                   <p className="text-sm text-slate-600">Risk analysis will be displayed here.</p>
                </div>
             </div>
          </div>
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