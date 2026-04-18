import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Plus, Clock } from 'lucide-react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents');
        setDocuments(response.data);
        
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
    fetchDocuments();
  }, []);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: '#714B67',
      overlayOpacity: 0.15,
      steps: [
        { 
          element: '.create-btn', 
          popover: { 
            title: '🚀 Create Your First Document', 
            description: 'This is where the magic happens! Choose between our AI Assistant or Manual Entry to generate professional documents in seconds.', 
            side: "left", 
            align: 'start' 
          }
        },
        { 
          element: '.stats-card', 
          popover: { 
            title: '📊 Quick Overview', 
            description: 'Keep track of your entire document library at a glance. We isolate your data per company for total security.', 
            side: "bottom", 
            align: 'start' 
          }
        },
        { 
          element: '.recent-docs', 
          popover: { 
            title: '📂 Recent History', 
            description: 'Access, edit, and download your latest documents here. Every change is tracked with our version history system.', 
            side: "top", 
            align: 'start' 
          }
        },
      ]
    });
    driverObj.drive();
    localStorage.setItem('hasSeenTour', 'true');
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#714B67' }}></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Documents</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2">{documents.length}</h3>
            </div>
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(113, 75, 103, 0.1)', color: '#714B67' }}>
              <FileText size={32} />
            </div>
          </div>
        </div>
        
        <Link 
          to="/dashboard/documents/create"
          style={{ backgroundColor: '#714B67' }}
          className="p-8 rounded-[32px] shadow-2xl shadow-primary/20 text-white hover:opacity-90 transition-all flex items-center justify-center space-x-4 create-btn"
        >
          <div className="bg-white/20 p-2 rounded-xl text-white">
            <Plus size={24} strokeWidth={4} />
          </div>
          <span className="text-xl font-black uppercase tracking-tight">Create New Document</span>
        </Link>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden recent-docs">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-3">
             <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#714B67' }}></div>
             <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Documents</h3>
          </div>
          <Link 
            to="/dashboard/documents" 
            className="font-black text-sm uppercase tracking-widest hover:underline"
            style={{ color: '#714B67' }}
          >
            View All Documents
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-10 py-6">Title</th>
                <th className="px-10 py-6">Client</th>
                <th className="px-10 py-6">Type</th>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.slice(0, 5).map((doc: any) => (
                <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-8 font-black text-gray-900">{doc.title}</td>
                  <td className="px-10 py-8 text-gray-600 font-bold">{doc.clientName}</td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter" style={{ backgroundColor: 'rgba(113, 75, 103, 0.1)', color: '#714B67' }}>
                      {doc.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-gray-400 font-bold text-sm">
                    {new Date(doc.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Link 
                      to={`/dashboard/documents/${doc._id}`}
                      className="inline-flex items-center space-x-2 font-black transition-colors px-6 py-3 rounded-xl border-2 hover:bg-gray-50"
                      style={{ borderColor: '#714B67', color: '#714B67' }}
                    >
                      <span>OPEN</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center space-y-6">
                       <div className="p-8 bg-gray-50 rounded-full text-gray-200">
                          <FileText size={64} />
                       </div>
                       <p className="text-gray-400 font-bold text-lg max-w-xs">No documents found. Start your journey by creating one!</p>
                       <Link 
                        to="/dashboard/documents/create"
                        style={{ backgroundColor: '#714B67' }}
                        className="px-8 py-4 text-white rounded-2xl font-black shadow-lg"
                       >
                         CREATE FIRST DOCUMENT
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
