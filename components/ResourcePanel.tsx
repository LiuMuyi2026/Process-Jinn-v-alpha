import React from 'react';
import { Resource } from '../types';
import { Box, Loader2, X, CheckCircle2, Circle } from './Icons';
import { StepRenderer } from './StepRenderer';

interface ResourcePanelProps {
  resource: Resource | null;
  onResourceClick: (name: string) => void;
  onClose: () => void;
  onToggleStepComplete: (resourceId: string, stepId: string) => void;
  labels: {
    acquisitionPlan: string;
    generating: string;
  }
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resource, onResourceClick, onClose, onToggleStepComplete, labels }) => {
  if (!resource) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden h-fit sticky top-24 animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="bg-indigo-50 p-5 border-b border-indigo-100 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 shadow-sm flex items-center justify-center flex-shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-lg text-slate-900 leading-tight truncate">{resource.name}</h2>
            <p className="text-xs font-medium text-indigo-600 mt-1 uppercase tracking-wide">{labels.acquisitionPlan}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-indigo-100/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-0 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        {resource.loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">{labels.generating}</span>
          </div>
        ) : (
          resource.acquisitionSteps && resource.acquisitionSteps.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {resource.acquisitionSteps.map((step) => (
                <button 
                  key={step.id} 
                  onClick={() => onToggleStepComplete(resource.id, step.id)}
                  className="flex gap-4 w-full text-left p-5 hover:bg-slate-50 transition-colors group"
                >
                  <div className={`mt-0.5 flex-shrink-0 transition-colors duration-300 ${step.isCompleted ? 'text-green-500' : 'text-slate-300 group-hover:text-indigo-400'}`}>
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className={`text-sm leading-relaxed transition-all duration-300 ${step.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>
                    <StepRenderer text={step.instruction} onResourceClick={onResourceClick} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
               <p className="text-sm text-slate-500 italic">No specific steps found.</p>
            </div>
          )
        )}
      </div>
      
      {/* Footer / Status bar could go here if needed */}
      {!resource.loading && resource.acquisitionSteps && (
         <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-400">
               {resource.acquisitionSteps.filter(s => s.isCompleted).length} / {resource.acquisitionSteps.length} Completed
            </span>
         </div>
      )}
    </div>
  );
};
