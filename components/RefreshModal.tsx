'use client';

import { useState } from 'react';

export interface ProjectSelection {
  byteLos: boolean;
  byte: boolean;
  productMasters: boolean;
  includeCompleted?: boolean;
}

interface RefreshModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: ProjectSelection) => Promise<void>;
  isRefreshing: boolean;
  importStats?: {
    ticketsImported: number;
    byProject: Record<string, number>;
  };
}

export default function RefreshModal({ isOpen, onClose, onConfirm, isRefreshing, importStats }: RefreshModalProps) {
  const [selection, setSelection] = useState<ProjectSelection>({
    byteLos: true,
    byte: true,
    productMasters: true,
    includeCompleted: false
  });

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm(selection);
  };

  const allSelected = selection.byteLos && selection.byte && selection.productMasters;
  const noneSelected = !selection.byteLos && !selection.byte && !selection.productMasters;

  const toggleAll = () => {
    const newValue = !allSelected;
    setSelection({
      byteLos: newValue,
      byte: newValue,
      productMasters: newValue
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Import from Azure DevOps</h2>
                <p className="text-sm text-gray-400">Select which projects to sync</p>
              </div>
            </div>
            {!isRefreshing && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Select All */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                disabled={isRefreshing}
                className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Select All Projects
                </div>
                <div className="text-xs text-gray-500">Import from all available sources</div>
              </div>
              <div className="text-xs font-mono text-gray-500">ALL</div>
            </label>
          </div>

          {/* Individual Projects */}
          <div className="space-y-3">
            {/* Byte LOS */}
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selection.byteLos}
                  onChange={(e) => setSelection({ ...selection, byteLos: e.target.checked })}
                  disabled={isRefreshing}
                  className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-teal-500 checked:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                    Byte LOS
                  </div>
                  <div className="text-xs text-gray-500">
                    Byte Active Work Items
                  </div>
                </div>
                <div className="text-xs font-mono px-2 py-1 bg-teal-500/20 text-teal-400 rounded">
                  LOS
                </div>
              </label>
            </div>

            {/* BYTE */}
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selection.byte}
                  onChange={(e) => setSelection({ ...selection, byte: e.target.checked })}
                  disabled={isRefreshing}
                  className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-blue-500 checked:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    BYTE
                  </div>
                  <div className="text-xs text-gray-500">
                    BYTE Dev Backlog 1.13.26
                  </div>
                </div>
                <div className="text-xs font-mono px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  BYTE
                </div>
              </label>
            </div>

            {/* Product Masters */}
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selection.productMasters}
                  onChange={(e) => setSelection({ ...selection, productMasters: e.target.checked })}
                  disabled={isRefreshing}
                  className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                    Product Masters
                  </div>
                  <div className="text-xs text-gray-500">
                    Operations Backlog All 1.14.26
                  </div>
                </div>
                <div className="text-xs font-mono px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                  PM
                </div>
              </label>
            </div>
          </div>

          {/* Include Completed Items Option */}
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selection.includeCompleted}
                onChange={(e) => setSelection({ ...selection, includeCompleted: e.target.checked })}
                disabled={isRefreshing}
                className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800 checked:bg-amber-500 checked:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Include Completed Items
                </div>
                <div className="text-xs text-gray-500">
                  Import Done/Cancelled/Closed items (~1,375 additional items)
                </div>
              </div>
              <div className="text-xs font-mono px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                HIST
              </div>
            </label>
          </div>

          {/* Warning if none selected */}
          {noneSelected && !isRefreshing && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Please select at least one project to import</span>
              </div>
            </div>
          )}

          {/* Import Progress */}
          {isRefreshing && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="flex-1 text-sm">
                  <div className="text-blue-400 font-medium mb-2">Importing from Azure DevOps...</div>
                  <div className="space-y-1 text-gray-400">
                    {selection.byteLos && <div>• Fetching Byte LOS work items...</div>}
                    {selection.byte && <div>• Fetching BYTE work items...</div>}
                    {selection.productMasters && <div>• Fetching Product Masters work items...</div>}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    This may take 10-30 seconds depending on the number of work items
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Success */}
          {!isRefreshing && importStats && importStats.ticketsImported > 0 && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 text-sm">
                  <div className="text-teal-400 font-medium mb-2">Import Successful!</div>
                  <div className="space-y-1 text-gray-300">
                    <div className="font-semibold">Total: {importStats.ticketsImported} tickets imported</div>
                    {Object.entries(importStats.byProject).map(([project, count]) => (
                      <div key={project} className="text-xs">• {project}: {count} tickets</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Importing data...
              </span>
            ) : (
              'This will replace existing data'
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isRefreshing || noneSelected}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isRefreshing || noneSelected
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {isRefreshing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </span>
              ) : (
                'Import Data'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
