import { useState } from 'react';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import AlertsTable from '../components/AlertsTable';
import Tabs from '../components/Tabs';
import { alertsData as initialAlerts } from '../data/mockData';

const alertTabs = [
  { label: 'Active Alerts', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [activeTab, setActiveTab] = useState('active');

  const handleResolve = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: 'resolved' } : alert
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => alert.status === activeTab);

  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' && a.status === 'active'
  ).length;
  const warningCount = alerts.filter(
    (a) => (a.severity === 'high' || a.severity === 'medium') && a.status === 'active'
  ).length;
  const infoCount = alerts.filter(
    (a) => a.severity === 'low' && a.status === 'active'
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts Management</h1>
          <p className="text-sm text-traffix-muted mt-1">
            Monitor and respond to traffic system alerts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{criticalCount}</p>
              <p className="text-xs text-traffix-muted">Critical Alerts</p>
            </div>
          </div>
        </div>

        <div className="card border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{warningCount}</p>
              <p className="text-xs text-traffix-muted">Warnings</p>
            </div>
          </div>
        </div>

        <div className="card border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{infoCount}</p>
              <p className="text-xs text-traffix-muted">Info</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <Tabs tabs={alertTabs} activeTab={activeTab} onChange={setActiveTab} />
        <span className="text-sm text-traffix-muted">
          {filteredAlerts.length} {activeTab} alert{filteredAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Alerts Table */}
      <AlertsTable alerts={filteredAlerts} onResolve={handleResolve} />
    </div>
  );
}

