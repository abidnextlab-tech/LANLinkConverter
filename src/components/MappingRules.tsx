import React, { useState } from 'react';
import { PresetMapping } from '../types';
import { Plus, Trash2, HelpCircle, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MappingRulesProps {
  mappings: PresetMapping[];
  onAddMapping: (mapping: Omit<PresetMapping, 'id'>) => void;
  onDeleteMapping: (id: string) => void;
  onResetToDefault: () => void;
}

export default function MappingRules({
  mappings,
  onAddMapping,
  onDeleteMapping,
  onResetToDefault,
}: MappingRulesProps) {
  const [name, setName] = useState('');
  const [windowsPrefix, setWindowsPrefix] = useState('');
  const [macPrefix, setMacPrefix] = useState('');
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !windowsPrefix.trim() || !macPrefix.trim()) {
      setError('All fields are required.');
      return;
    }

    // Ensure proper formats
    let winClean = windowsPrefix.trim();
    if (!winClean.startsWith('\\\\')) {
      setError('Windows prefix must start with dual backslashes \\\\');
      return;
    }

    let macClean = macPrefix.trim();
    if (!macClean.startsWith('/')) {
      setError('Mac prefix must start with a slash /');
      return;
    }

    // Pass standard values
    onAddMapping({
      name: name.trim(),
      windowsPrefix: winClean,
      macPrefix: macClean,
    });

    // Clear form
    setName('');
    setWindowsPrefix('');
    setMacPrefix('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Custom Storage Mapping Rules</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-50 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>
          <button
            type="button"
            onClick={onResetToDefault}
            className="p-1 px-2.5 text-xs font-semibold text-amber-600 hover:text-amber-700 rounded-md hover:bg-amber-50/60 flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset storage presets"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100"
          >
            <p className="font-semibold text-slate-800 mb-1">Platform Path Mappings:</p>
            <p className="mb-2 leading-relaxed text-slate-500">
              Corporate server folders or shares are often mounted differently on Mac and Windows due to OS directory standards.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-500">
              <li>
                <strong>Windows Prefix:</strong> The starting path used on Windows (e.g., <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">\\\\Tuhin-046-digit\\f</code>)
              </li>
              <li>
                <strong>Mac Prefix:</strong> The mount directory where Mac places that share locally (e.g., <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">/Volumes/tuhin-046-digit</code>)
              </li>
              <li>
                Pasted paths are converted instantly using these custom-tailored match formulas!
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules list */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto mb-6 pr-1">
        {mappings.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
            No custom mapping rules configured. Only standard fallback conversions are active.
          </div>
        ) : (
          mappings.map((mapping) => (
            <div
              key={mapping.id}
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl transition-all text-xs"
            >
              <div className="min-w-0 pr-2">
                <p className="font-bold text-slate-750 text-xs tracking-tight mb-1">{mapping.name}</p>
                <div className="flex flex-col gap-0.5 text-[11px] font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 w-8">Win:</span>
                    <span className="text-slate-700 truncate">{mapping.windowsPrefix}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 w-8">Mac:</span>
                    <span className="text-slate-700 truncate">{mapping.macPrefix}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteMapping(mapping.id)}
                className="p-1 px-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Form to add mapping */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-5">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase mb-3.5">Add Custom Volume Mapping</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Rule Name
            </label>
            <input
              type="text"
              placeholder="e.g. Office Video Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Windows Path Prefix
            </label>
            <input
              type="text"
              placeholder="e.g. \\ServerName\share"
              value={windowsPrefix}
              onChange={(e) => setWindowsPrefix(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono placeholder:font-sans"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Mac Local Mount Prefix
            </label>
            <input
              type="text"
              placeholder="e.g. /Volumes/mountname"
              value={macPrefix}
              onChange={(e) => setMacPrefix(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono placeholder:font-sans"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 mb-3 font-semibold">{error}</p>}

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Save Mapping Rule</span>
        </button>
      </form>
    </div>
  );
}
