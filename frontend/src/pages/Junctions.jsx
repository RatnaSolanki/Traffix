import { useState } from 'react';
import { MapPin } from 'lucide-react';
import JunctionCard from '../components/JunctionCard';
import Tabs from '../components/Tabs';
import { junctionsData } from '../data/mockData';

const filterTabs = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

export default function Junctions() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredJunctions =
    activeFilter === 'all'
      ? junctionsData
      : junctionsData.filter((j) => j.severity === activeFilter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Junctions</h1>
          <p className="text-sm text-traffix-muted mt-1">
            Monitor and manage traffic junctions across the city
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-traffix-muted">
          <MapPin className="w-4 h-4" />
          <span>{filteredJunctions.length} junctions</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={filterTabs} activeTab={activeFilter} onChange={setActiveFilter} />

      {/* Junctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredJunctions.map((junction) => (
          <JunctionCard key={junction.id} junction={junction} />
        ))}
      </div>

      {filteredJunctions.length === 0 && (
        <div className="card py-16 text-center">
          <MapPin className="w-12 h-12 text-traffix-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No junctions found</h3>
          <p className="text-sm text-traffix-muted">
            No junctions match the selected filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}

