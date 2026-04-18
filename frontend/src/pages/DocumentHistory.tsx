import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Clock, Eye, RotateCcw, ArrowLeft } from 'lucide-react';

const DocumentHistory = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/documents/${id}/history`);
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionData: any) => {
    try {
      await api.put(`/documents/${id}`, { data: versionData });
      toast.success('Version restored!');
      window.location.href = `/documents/${id}`;
    } catch (error) {
      toast.error('Failed to restore version');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/documents/${id}`} className="flex items-center text-gray-600 hover:text-primary transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Document
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Version History</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {history.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No previous versions found.
            </div>
          )}
          {history.map((version: any, idx: number) => (
            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    Version {history.length - idx}
                  </p>
                  <p className="text-sm text-gray-500">
                    Saved on {new Date(version.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {version.pdfUrl && (
                  <a 
                    href={version.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="View PDF"
                  >
                    <Eye size={20} />
                  </a>
                )}
                <button
                  onClick={() => handleRestore(version.data)}
                  className="flex items-center space-x-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                >
                  <RotateCcw size={18} />
                  <span>Restore</span>
                </button>
              </div>
            </div>
          )).reverse()}
        </div>
      </div>
    </div>
  );
};

export default DocumentHistory;
