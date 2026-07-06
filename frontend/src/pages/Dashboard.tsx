import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Plus, Clock, Check, X } from 'lucide-react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const BRAND = '#714B67';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    localStorage.getItem('onboardingDismissed') === 'true'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, companyRes] = await Promise.all([
          api.get('/documents'),
          api.get('/company').catch(() => ({ data: null })),
        ]);
        setDocuments(docsRes.data);
        setCompany(companyRes.data);

        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (!hasSeenTour) {
          startTour();
        }
      } catch (error) {
        console.error('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: BRAND,
      overlayOpacity: 0.15,
      steps: [
        {
          element: '.create-btn',
          popover: {
            title: '🚀 Create Your First Document',
            description: 'Choose between AI Assistant or Manual Entry to generate professional documents in seconds.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '.stats-card',
          popover: {
            title: '📊 Quick Overview',
            description: 'Track your document library at a glance.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '.recent-docs',
          popover: {
            title: '📂 Recent History',
            description: 'Access, edit, and download your latest documents. Every change is tracked.',
            side: "top",
            align: 'start'
          }
        },
      ]
    });
    driverObj.drive();
    localStorage.setItem('hasSeenTour', 'true');
  };

  const docsByType: Record<string, number> = (documents as any[]).reduce((acc: any, d: any) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});

  const mostRecentDoc: any = (documents as any[]).sort((a: any, b: any) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  const hasLogo = !!company?.logoUrl;
  const hasDocument = (documents as any[]).length > 0;
  const hasInvited = localStorage.getItem('onboardingInviteSent') === 'true';
  const allOnboardingDone = hasLogo && hasDocument && hasInvited;
  const showOnboarding = !onboardingDismissed && !allOnboardingDone;

  const dismissOnboarding = () => {
    localStorage.setItem('onboardingDismissed', 'true');
    setOnboardingDismissed(true);
  };

  const chartData = Object.entries(docsByType).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count,
  }));

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }}></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showOnboarding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative">
          <button
            onClick={dismissOnboarding}
            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: BRAND }}></div>
            <h3 className="text-sm font-bold text-gray-900">Getting Started</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hasLogo ? '#22c55e' : `${BRAND}20` }}
              >
                {hasLogo && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm ${hasLogo ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                Add company logo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hasDocument ? '#22c55e' : `${BRAND}20` }}
              >
                {hasDocument && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm ${hasDocument ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                Create first document
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: hasInvited ? '#22c55e' : `${BRAND}20` }}
              >
                {hasInvited && <Check size={11} className="text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm ${hasInvited ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                Invite a team member
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Documents</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{documents.length}</h3>
              <p className="text-xs text-gray-400 mt-0.5">All time</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
              <FileText size={22} />
            </div>
          </div>
        </div>

        <Link
          to="/dashboard/documents/create"
          style={{ backgroundColor: BRAND }}
          className="p-5 rounded-xl shadow-lg text-white hover:opacity-90 transition-all flex items-center gap-3 create-btn"
        >
          <div className="bg-white/20 p-2 rounded-lg">
            <Plus size={18} strokeWidth={3} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">Create Document</p>
            <p className="text-xs text-white/70 mt-0.5">AI or Manual</p>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Activity</p>
              <p className="text-sm font-bold text-gray-900 mt-1 truncate max-w-[140px]">
                {mostRecentDoc ? mostRecentDoc.title : 'No documents yet'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {mostRecentDoc
                  ? new Date(mostRecentDoc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                  : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
              <Clock size={22} />
            </div>
          </div>
        </div>
      </div>

      {Object.keys(docsByType).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(docsByType).map(([type, count]) => (
            <div key={type} className="bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{type.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      )}

      {Object.keys(docsByType).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: BRAND }}></div>
            <h3 className="text-sm font-bold text-gray-900">Document Breakdown</h3>
          </div>
          <div style={{ maxHeight: 200 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  cursor={{ fill: `${BRAND}08` }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={BRAND} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden recent-docs">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: BRAND }}></div>
            <h3 className="text-sm font-bold text-gray-900">Recent Documents</h3>
          </div>
          <Link
            to="/dashboard/documents"
            className="text-xs font-semibold hover:underline"
            style={{ color: BRAND }}
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(documents as any[]).slice(0, 7).map((doc: any) => (
                <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-gray-900 max-w-[180px] truncate">{doc.title}</td>
                  <td className="px-5 py-3 text-gray-500">{doc.clientName}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-md text-xs font-semibold capitalize" style={{ backgroundColor: `${BRAND}12`, color: BRAND }}>
                      {doc.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(doc._creationTime || doc.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/dashboard/documents/${doc._id}`}
                      className="inline-flex items-center text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                      style={{ borderColor: BRAND, color: BRAND }}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-xl text-gray-200">
                        <FileText size={36} />
                      </div>
                      <p className="text-gray-400 text-sm">No documents yet. Create your first one!</p>
                      <Link
                        to="/dashboard/documents/create"
                        style={{ backgroundColor: BRAND }}
                        className="px-5 py-2 text-white rounded-lg text-sm font-semibold shadow"
                      >
                        Create Document
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
