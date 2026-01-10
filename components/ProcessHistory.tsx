import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProcesses, deleteProcess, SavedProcess } from '../localDatabase';
import { format } from 'date-fns';
import { Clock, Trash2, Eye, ArrowLeft } from 'lucide-react';

interface ProcessHistoryProps {
  onLoadProcess: (process: SavedProcess) => void;
  onBack: () => void;
}

export const ProcessHistory: React.FC<ProcessHistoryProps> = ({ onLoadProcess, onBack }) => {
  const { user } = useAuth();
  const [processes, setProcesses] = useState<SavedProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadProcesses();
    }
  }, [user]);

  const loadProcesses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userProcesses = await getUserProcesses(user.uid);
      setProcesses(userProcesses);
    } catch (err: any) {
      setError(err.message || 'Failed to load processes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProcess = async (processId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this process?')) return;
    
    try {
      await deleteProcess(user.uid, processId);
      setProcesses(processes.filter(p => p.id !== processId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete process');
    }
  };

  const handleLoadProcess = (process: SavedProcess) => {
    onLoadProcess(process);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your processes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Planner
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Your Process History</h1>
              <p className="text-slate-600 mt-1">View and manage your saved processes</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {processes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No saved processes yet</h2>
            <p className="text-slate-600 mb-6">Start planning and save your first process to see it here.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              Create Your First Process
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map((process) => (
              <div
                key={process.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                        {process.description}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Created {format(new Date(process.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  {process.quantification && (
                    <div className="mb-3">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Specifics:</span> {process.quantification}
                      </p>
                    </div>
                  )}

                  {process.environment && (
                    <div className="mb-3">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Environment:</span> {process.environment}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Strategies:</span> {process.strategies.length} available
                    </p>
                    {process.selectedStrategyId && (
                      <p className="text-sm text-indigo-600">
                        1 strategy selected
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadProcess(process)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteProcess(process.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {process.updatedAt !== process.createdAt && (
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Updated {format(new Date(process.updatedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
