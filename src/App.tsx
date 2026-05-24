import React, { useState } from 'react';
import { PresetMapping, PathType } from './types';
import { convertLanPath } from './utils/lanConverter';
import {
  Monitor,
  Laptop,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  Server,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default mappings matching the user's workspace example exactly!
const DEFAULT_MAPPINGS: PresetMapping[] = [
  {
    id: 'default-1',
    name: "Tuhin's Windows Server Share",
    windowsPrefix: '\\\\Tuhin-046-digit\\f',
    macPrefix: '/Volumes/tuhin-046-digit'
  },
  {
    id: 'default-2',
    name: 'Office Synology NAS',
    windowsPrefix: '\\\\192.168.1.150\\documents',
    macPrefix: '/Volumes/documents'
  },
  {
    id: 'default-3',
    name: 'Editorial Media RAID',
    windowsPrefix: '\\\\RAID-SERVER\\Video-Arch',
    macPrefix: '/Volumes/Video-Arch'
  }
];

const SAMPLE_PATH = '\\\\Tuhin-046-digit\\f\\Apple Gadgets\\Organic\\Video\\2026\\May 2026\\14 May\\Mamun\\Choose Your Charging Power';

export default function App() {
  // --- STATES ---
  const [mappings] = useState<PresetMapping[]>(() => {
    const saved = localStorage.getItem('lan_mappings');
    return saved ? JSON.parse(saved) : DEFAULT_MAPPINGS;
  });

  const [inputPath, setInputPath] = useState('');
  const [activeOS, setActiveOS] = useState<'mac' | 'windows'>(() => {
    if (typeof window !== 'undefined') {
      const platform = window.navigator.platform.toLowerCase();
      if (platform.includes('win')) return 'windows';
    }
    return 'mac';
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);

  // --- PATH CALCULATIONS ---
  const conversionResult = convertLanPath(inputPath, mappings);
  const isWindowsInput = conversionResult.detectedType === 'windows';
  const isMacInput = conversionResult.detectedType === 'mac_local' || conversionResult.detectedType === 'mac_smb';

  // --- INTELLIGENT ROUTING LOGIC ---
  // If macOS Mode is active:
  // - If the user pastes a Windows link, output macOS paths.
  // - If the user pastes a Mac link, output Windows path (assuming they are working with Mac and want Windows counterpart).
  // If Windows Mode is active:
  // - If the user pastes a Mac link, output Windows path.
  // - If the user pastes a Windows link, output macOS paths.
  let showWindowsOutput = false;
  let showMacOutput = false;

  if (activeOS === 'mac') {
    if (isWindowsInput) {
      showMacOutput = true;
    } else if (isMacInput) {
      showWindowsOutput = true;
    } else {
      showMacOutput = true; // standard default
    }
  } else {
    // Windows Mode
    if (isMacInput) {
      showWindowsOutput = true;
    } else if (isWindowsInput) {
      showMacOutput = true;
    } else {
      showWindowsOutput = true; // standard default
    }
  }

  // --- UTILS ---
  const handleCopy = async (fieldId: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const loadSample = () => {
    setInputPath(SAMPLE_PATH);
  };

  // Format label helper
  const getDetectedFormatLabel = (type: PathType) => {
    switch (type) {
      case 'windows':
        return (
          <span className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50/80 px-3 py-1.5 rounded-full font-bold border border-indigo-200 shadow-3xs">
            <Monitor className="w-3.5 h-3.5 text-indigo-500" />
            Detected Format: Windows UNC
          </span>
        );
      case 'mac_local':
        return (
          <span className="flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50/80 px-3 py-1.5 rounded-full font-bold border border-sky-200 shadow-3xs">
            <Laptop className="w-3.5 h-3.5 text-sky-500" />
            Detected Format: macOS Local Vol (/Volumes)
          </span>
        );
      case 'mac_smb':
        return (
          <span className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50/80 px-3 py-1.5 rounded-full font-bold border border-purple-200 shadow-3xs">
            <Server className="w-3.5 h-3.5 text-purple-500" />
            Detected Format: macOS SMB (smb://)
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full font-semibold border border-slate-200">
            Waiting for path paste...
          </span>
        );
    }
  };

  return (
    <div id="lan-link-converter-app" className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      {/* Top Header Grid/Bar */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-3xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">LAN Link Converter</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Sleek Cross-Platform Bridge</p>
          </div>
        </div>

        {/* Operating system target mode toggles MATCHING CSS Selector 2 structure EXACTLY! */}
        <div>
          <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all" id="os-selector">
            <button
              onClick={() => setActiveOS('mac')}
              className={`px-4.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeOS === 'mac'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>macOS Mode</span>
            </button>
            <button
              onClick={() => setActiveOS('windows')}
              className={`px-4.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                activeOS === 'windows'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6">
          
          {/* Div 1: Convert LAN Path Input Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 relative transition-all hover:border-slate-300/80">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">Convert LAN Path</h2>
                <p className="text-xs text-slate-400 font-semibold">Paste any network path link here to instantly convert</p>
              </div>
              <button
                onClick={() => setShowHowTo(!showHowTo)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Operating Guide</span>
              </button>
            </div>

            <div className="relative mb-4">
              <textarea
                rows={3}
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="Paste Windows path (\\\\server\\share\\...) or macOS volume/SMB path here..."
                className="w-full text-[14px] sm:text-[14px] px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono transition-all pr-12 shadow-3xs resize-none leading-relaxed"
              />
              {inputPath && (
                <button
                  type="button"
                  onClick={() => setInputPath('')}
                  className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  title="Clear link input"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Helper Badge bar & Load lab sample */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {getDetectedFormatLabel(conversionResult.detectedType)}
              </div>
              <button
                onClick={loadSample}
                className="whitespace-nowrap px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200/80 transition-all cursor-pointer active:scale-95 shadow-3xs"
              >
                Load Lab Sample Path
              </button>
            </div>

            {/* Guide Info block */}
            <AnimatePresence>
              {showHowTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-indigo-50/20 rounded-xl border border-indigo-100/50 p-4 mt-4 text-xs text-slate-600"
                >
                  <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    Intelligent Converter Mechanics
                  </p>
                  <p className="leading-relaxed mb-3">
                    The converter detects what you paste based on your current OS Mode. Standardize Windows paths to macOS schemes or vice-versa on the fly!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                    <div>
                      <p className="font-bold text-indigo-800 mb-1 flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-indigo-700" /> Windows UNC Path Format
                      </p>
                      <span className="text-slate-500">
                        UNC shares look like <code className="bg-slate-100 p-0.5 rounded font-mono">\\\\Server\\share\\subfolder</code>. Custom prefix mappings will transform them intelligently.
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-emerald-700" /> macOS Path Schemes
                      </p>
                      <span className="text-slate-500">
                        Local Volumes start with <code className="bg-slate-100 p-0.5 rounded font-mono">/Volumes/share/...</code>. Universal network URIs map with <code className="bg-slate-100 p-0.5 rounded font-mono">smb://...</code>.
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Div 2: Output Path Divs Card (MATCHING SELECTOR 1 EXACTLY!) */}
          <div className="bg-white border-2 border-indigo-50 rounded-2xl shadow-md p-6 sm:p-8 relative hover:border-indigo-100 transition-all duration-300">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>Generated Output Link(s)</span>
                {inputPath && (
                  <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 animate-pulse tracking-wider">
                    Auto-Configured
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {inputPath 
                  ? "Pasted string analyzed! Generating the target counterpart links for your local platform below:"
                  : "Output sharing paths will formulate here automatically upon input entry."
                }
              </p>
            </div>

            {/* Empty state or converted values */}
            {!inputPath ? (
              <div className="border border-dashed border-slate-200 rounded-xl py-11 px-4 text-center bg-slate-50/50">
                <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto">
                  Paste a link inside the 'Convert LAN Path' field above to generate your cross-platform network links.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* 1. Show Windows Output Path if configured */}
                {showWindowsOutput && (
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs hover:border-slate-300 transition-all duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Monitor className="w-3.5 h-3.5 text-slate-400" />
                        Windows UNC Share Destination Path
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-indigo-500 text-white rounded font-bold uppercase tracking-normal select-none">
                        Win Format
                      </span>
                    </div>
                    <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-3.5 justify-between items-center gap-3 shadow-inner">
                      <code className="text-xs text-slate-205 font-mono select-all break-all pr-4 font-semibold text-slate-200">
                        {conversionResult.windowsPath}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy('windows', conversionResult.windowsPath)}
                        className="text-xs p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold shrink-0 transition-all cursor-pointer active:scale-90 flex items-center justify-center border border-slate-700/50"
                        title="Copy to Clipboard"
                      >
                        {copiedField === 'windows' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Show macOS Output Paths if configured */}
                {showMacOutput && (
                  <div className="space-y-4 animate-fade-in">
                    {/* macOS Volume Link */}
                    <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs hover:border-slate-300 transition-all duration-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          macOS Local Volume Link (/Volumes/...)
                        </span>
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-white rounded font-bold uppercase tracking-normal select-none">
                          Mac Local
                        </span>
                      </div>
                      <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-3.5 justify-between items-center gap-3 shadow-inner">
                        <code className="text-xs text-slate-205 font-mono select-all break-all pr-4 font-semibold text-slate-200">
                          {conversionResult.macLocalPath}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy('mac_local', conversionResult.macLocalPath)}
                          className="text-xs p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold shrink-0 transition-all cursor-pointer active:scale-90 flex items-center justify-center border border-slate-700/50"
                          title="Copy to Clipboard"
                        >
                          {copiedField === 'mac_local' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* macOS SMB Network Link */}
                    <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs hover:border-slate-300 transition-all duration-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Server className="w-3.5 h-3.5 text-slate-400" />
                          macOS Universal Network Link (smb://...)
                        </span>
                        <span className="px-2 py-0.5 text-[10px] bg-purple-500 text-white rounded font-bold uppercase tracking-normal select-none">
                          Universal Link
                        </span>
                      </div>
                      <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-3.5 justify-between items-center gap-3 shadow-inner">
                        <code className="text-xs text-slate-205 font-mono select-all break-all pr-4 font-semibold text-slate-200">
                          {conversionResult.macSmbPath}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy('mac_smb', conversionResult.macSmbPath)}
                          className="text-xs p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold shrink-0 transition-all cursor-pointer active:scale-90 flex items-center justify-center border border-slate-700/50"
                          title="Copy to Clipboard"
                        >
                          {copiedField === 'mac_smb' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </main>

      {/* Elegant minimalist status footer */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-10 py-5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-medium gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Active Server Hub: TUHIN-046-DIGIT</span>
          </div>
          <span className="hidden md:inline text-slate-200">|</span>
          <span>Core Mount Point: <span className="text-slate-650 font-bold font-mono text-slate-600">f</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span>Version 2.4.0 (Windows / MacOS Universal Client)</span>
          <span className="text-indigo-600 cursor-pointer hover:underline font-bold" onClick={() => setShowHowTo(!showHowTo)}>Documentation</span>
        </div>
      </footer>
    </div>
  );
}
