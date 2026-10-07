import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Clock, Eye, RotateCcw, ArrowLeft, Trash2 } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

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

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleRestore = async (versionData: any) => {
    try {
      await api.put(`/documents/${id}`, { data: versionData });
      toast.success('Version restored!');
      window.location.href = `/dashboard/documents/${id}`;
    } catch (error) {
      toast.error('Failed to restore version');
    }
  };

  const handleDeleteVersion = async () => {
    if (deleteIndex === null) return;
    setDeleting(true);
    try {
      await api.delete(`/documents/${id}/history/${deleteIndex}`);
      toast.success('History version deleted');
      setDeleteIndex(null);
      fetchHistory();
    } catch (error) {
      toast.error('Failed to delete history version');
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (version: any) => {
    if (version?.pdfUrl) {
      window.open(version.pdfUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No PDF available for this version.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: 'Documents', href: '/dashboard/documents' }, { label: 'Version History' }]} />
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/documents/${id}`} className="flex items-center text-gray-600 hover:text-primary transition-colors">
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleView(version)}
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                  title="View PDF"
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => handleRestore(version.data)}
                  className="flex items-center space-x-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                >
                  <RotateCcw size={18} />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setDeleteIndex(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete version"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )).reverse()}
        </div>
      </div>

      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-xl">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Delete Version</p>
                <p className="text-xs text-gray-400">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this history version?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteIndex(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVersion}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentHistory;
