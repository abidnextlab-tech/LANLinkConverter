import React, { useState } from 'react';
import { PresetMapping } from '../types';
import { convertTextBlob } from '../utils/lanConverter';
import { Copy, Check, Sparkles, MessageSquare } from 'lucide-react';

interface TextScannerProps {
  mappings: PresetMapping[];
}

export default function TextScanner({ mappings }: TextScannerProps) {
  const [inputText, setInputText] = useState('');
  const [targetPlatform, setTargetPlatform] = useState<'windows' | 'mac_local' | 'mac_smb'>('mac_local');
  const [copied, setCopied] = useState(false);

  const convertedText = convertTextBlob(inputText, mappings, targetPlatform);

  const handleCopy = async () => {
    if (!convertedText) return;
    try {
      await navigator.clipboard.writeText(convertedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-slate-700" />
        <h2 className="text-base font-bold text-slate-800 tracking-tight">Bulk Message Link Swiss-Knife</h2>
      </div>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Paste a complete Slack, Teams, WhatsApp message, or email containing one or more LAN host links. Select your target format to batch-convert all embedded links instantly, preserving the text context.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Original Co-Worker Message
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste raw text, e.g.:
Please review the charging profiles here:
\\\\Tuhin-046-digit\\f\\Apple Gadgets\\Organic\\Video\\2026\\May 2026

Let me know if any adjustment is needed!`}
            className="w-full h-44 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans transition-all resize-none shadow-3xs placeholder:text-slate-400/70"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Bulk Translated Result
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setTargetPlatform('mac_local')}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-wide font-bold rounded-md transition-all cursor-pointer ${
                  targetPlatform === 'mac_local'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mac Local
              </button>
              <button
                type="button"
                onClick={() => setTargetPlatform('mac_smb')}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-wide font-bold rounded-md transition-all cursor-pointer ${
                  targetPlatform === 'mac_smb'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mac SMB
              </button>
              <button
                type="button"
                onClick={() => setTargetPlatform('windows')}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-wide font-bold rounded-md transition-all cursor-pointer ${
                  targetPlatform === 'windows'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Windows UNC
              </button>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              readOnly
              value={convertedText}
              placeholder="Your translated batch message with proper regional link syntax will reflect here..."
              className="w-full h-44 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-slate-700 shadow-3xs resize-none select-text focus:outline-none placeholder:text-slate-400/70"
            />
            {convertedText && (
              <button
                type="button"
                onClick={handleCopy}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Message'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {inputText && !convertedText && (
        <span className="text-[11px] text-slate-400 mt-2 block italic">
          No LAN link structure found in the current text block.
        </span>
      )}
    </div>
  );
}
