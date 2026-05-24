import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Terminal, Laptop, Monitor, ArrowRight, ShieldCheck, Cpu, HelpCircle, FileCode, Check, Copy } from 'lucide-react';

interface MacAppPackagingGuideProps {
  onClose?: () => void;
}

type SelectedPlatform = 'windows' | 'mac';

export const MacAppPackagingGuide: React.FC<MacAppPackagingGuideProps> = ({ onClose }) => {
  const [platform, setPlatform] = useState<SelectedPlatform>('windows');
  const [copiedCmd, setCopiedCmd] = useState(false);

  const commandMac = "chmod +x package-mac.sh && ./package-mac.sh";
  const commandWin = "package-win.bat";
  const commandText = platform === 'mac' ? commandMac : commandWin;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(commandText);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-6 mb-6">
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Compile Deskop Application Packages</h2>
            <p className="text-xs text-slate-400 font-medium">Turn this web applet into a native standalone local software utility</p>
          </div>
        </div>
        
        {/* Platform switcher tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => { setPlatform('windows'); setCopiedCmd(false); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              platform === 'windows'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows (.EXE)</span>
          </button>
          <button
            onClick={() => { setPlatform('mac'); setCopiedCmd(false); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              platform === 'mac'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>macOS (.DMG)</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer hidden md:inline-block"
          >
            Hide panel
          </button>
        )}
      </div>

      {/* Standard Setup Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm mb-6">
        {/* Step 1 */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-widest">Download Source</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export this complete app as a standard workspace archive:
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              In Google AI Studio (top-right gear), click <strong>"Export as ZIP / GitHub"</strong> to download a snapshot of the workspace configuration.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Requires Browser Export</span>
            <Download className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-widest">
                {platform === 'mac' ? 'Open terminal' : 'Open CMD / PowerShell'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unzip the folder on your local computer, open your standard {platform === 'mac' ? 'Terminal' : 'Command Prompt (cmd)'}, and navigate into the folder:
            </p>
            <div className="bg-slate-950 text-slate-200 font-mono text-[10px] p-2 rounded border border-slate-800 mt-2.5">
              {platform === 'mac' ? 'cd ~/Downloads/lan-link-converter-*' : 'cd /d %USERPROFILE%\\Downloads\\lan-link-converter-*'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>Operating System Context</span>
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <h3 className="font-bold text-xs text-indigo-600 uppercase tracking-widest">Compile App Package</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Execute our embedded local compiler script. It will automate the entire process back-to-front.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleCopyCommand}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedCmd ? "Command Copied!" : "Copy Installer Script"}
            </button>
          </div>
        </div>
      </div>

      {/* Code command window */}
      <div className="relative mb-6">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Run this single command inside the extracted folder:
        </label>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between font-mono text-xs text-slate-200 shadow-sm overflow-x-auto">
          <code className="text-indigo-400 select-all pr-4">{commandText}</code>
          <button
            onClick={handleCopyCommand}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2.5 py-1.5 rounded transition-colors cursor-pointer shrink-0"
          >
            {copiedCmd ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Diagnostic & Capability Box */}
      <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5 animate-pulse">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {platform === 'mac' ? 'Native Apple Platform Packaging Suite:' : 'Windows Cross-Platform Packaging Suite:'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              {platform === 'mac' ? (
                <span>
                  The automated builder script installs local desktop bundling utilities (Electron), compiles the production static files index, builds native macOS binaries supporting both <strong>Apple Silicon (M1/M2/M3)</strong> and <strong>Intel core</strong> processors, and packs it cleanly into an installable <strong>DMG disk image with Applications folder drag-and-drop support</strong>.
                </span>
              ) : (
                <span>
                  The automated batch script compiles production static web files, structures local desktop handlers, and builds <strong>BOTH</strong> a fully installable, permanent <strong>Windows Installer Setup (.exe)</strong> and a corresponding <strong>macOS Installable Disk Image (.dmg)</strong> directly on your Windows PC! Get the setup executable running natively on Windows while generating native Apple disk images for your team.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
