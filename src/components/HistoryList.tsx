import React from 'react';
import { ConversionHistoryItem, PathType } from '../types';
import { Copy, Trash2, Check, Clock, Laptop, Monitor } from 'lucide-react';
import { useState } from 'react';

interface HistoryListProps {
  history: ConversionHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (input: string) => void;
}

export default function HistoryList({
  history,
  onClearHistory,
  onSelectHistoryItem,
}: HistoryListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const getFormatBadge = (type: PathType) => {
    switch (type) {
      case 'windows':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
            <Monitor className="w-2.5 h-2.5" />
            Windows UNC
          </span>
        );
      case 'mac_local':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Laptop className="w-2.5 h-2.5" />
            Mac local
          </span>
        );
      case 'mac_smb':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
            <Laptop className="w-2.5 h-2.5" />
            Mac SMB URI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-100">
            Raw Text
          </span>
        );
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Recent Conversions</h2>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs font-semibold text-rose-500 hover:text-rose-650 transition-colors flex items-center gap-1 hover:bg-rose-50 px-2.5 py-1 rounded-md cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 max-h-[300px] overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50 transition-all text-xs gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {getFormatBadge(item.detectedType)}
                <span className="text-[10px] text-slate-400 font-medium font-mono">
                  {item.timestamp}
                </span>
                <button
                  onClick={() => onSelectHistoryItem(item.input)}
                  className="text-xs text-indigo-650 hover:text-indigo-700 hover:underline cursor-pointer font-semibold ml-auto sm:ml-0"
                >
                  Reload Path
                </button>
              </div>
              <p
                className="font-mono text-xs text-slate-600 truncate cursor-pointer hover:text-slate-900"
                onClick={() => onSelectHistoryItem(item.input)}
                title="Click to reload this path in the converter"
              >
                {item.input}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-end sm:self-center transition-all">
              <button
                onClick={() => handleCopy(`${item.id}-win`, item.windowsPath)}
                className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-white rounded-md flex items-center gap-1 border border-transparent shadow-3xs transition-all cursor-pointer"
                title="Copy Windows Link"
              >
                {copiedId === `${item.id}-win` ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-indigo-600" />
                )}
                <span>Win</span>
              </button>
              
              <button
                onClick={() => handleCopy(`${item.id}-mac`, item.macLocalPath)}
                className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-white rounded-md flex items-center gap-1 border border-transparent shadow-3xs transition-all cursor-pointer"
                title="Copy Mac Volume Link"
              >
                {copiedId === `${item.id}-mac` ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-indigo-600" />
                )}
                <span>Mac Vol</span>
              </button>

              <button
                onClick={() => handleCopy(`${item.id}-smb`, item.macSmbPath)}
                className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-white rounded-md flex items-center gap-1 border border-transparent shadow-3xs transition-all cursor-pointer"
                title="Copy Mac SMB SMB:// Link"
              >
                {copiedId === `${item.id}-smb` ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-indigo-600" />
                )}
                <span>Mac SMB</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
