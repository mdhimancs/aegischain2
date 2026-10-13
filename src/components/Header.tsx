import React from 'react';
import {
  Shield,
  ShieldAlert,
  Cpu,
  Terminal,
  Key,
  Network,
  Lock,
  Volume2,
  VolumeX,
  RefreshCw,
  FileText,
  Vote,
  Database,
  Globe,
  Crosshair,
  Flame,
} from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';

export type TabType =
  | 'overview'
  | 'case-studies'
  | 'threat-simulator'
  | 'pki'
  | 'threat-intel'
  | 'audit'
  | 'did'
  | 'zk'
  | 'bridge'
  | 'validators'
  | 'governance'
  | 'backups'
  | 'api';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentDid,
    dids,
    switchActiveDid,
    audioEnabled,
    toggleAudio,
    isConsensusRunning,
    setConsensusRunning,
    triggerBlockProduce,
    consensusPhase,
    networkMetrics,
  } = useBlockchain();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Network & Threat Telemetry', icon: <Cpu className="w-4 h-4" /> },
    {
      id: 'case-studies',
      label: 'Real Websites & Case Studies',
      icon: <Globe className="w-4 h-4 text-emerald-600" />,
      badge: 'Estonia / NATO',
    },
    {
      id: 'threat-simulator',
      label: 'Attack Simulator & Cyber Range',
      icon: <Crosshair className="w-4 h-4 text-rose-600" />,
      badge: 'LIVE',
    },
    { id: 'pki', label: 'Decentralized PKI & TLS Registry', icon: <Key className="w-4 h-4 text-cyan-600" /> },
    { id: 'threat-intel', label: 'Threat Intel & IOC Market', icon: <Flame className="w-4 h-4 text-amber-600" /> },
    { id: 'audit', label: 'Smart Contract Auditor', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'did', label: 'Decentralized Identity (DID)', icon: <Key className="w-4 h-4" /> },
    { id: 'zk', label: 'ZK-SNARK Verifier', icon: <Lock className="w-4 h-4" /> },
    { id: 'bridge', label: 'Cross-Chain Bridge', icon: <Network className="w-4 h-4" /> },
    { id: 'validators', label: 'Validators & Slashing', icon: <Shield className="w-4 h-4" /> },
    { id: 'governance', label: 'Governance DAO', icon: <Vote className="w-4 h-4" /> },
    { id: 'backups', label: 'Automated Backups', icon: <Database className="w-4 h-4" /> },
    { id: 'api', label: 'Developer API & RPC', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Top Protocol Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-500/20 text-white">
            <Shield className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                AEGIS<span className="text-emerald-600">CHAIN</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                L1 SEC-MESH
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Quantum-Resistant Blockchain Cybersecurity & Zero-Trust Protocol
            </p>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Consensus Mode Ticker */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">BFT Phase:</span>
            <span className={`font-mono font-bold ${
              consensusPhase === 'COMMIT' ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {consensusPhase}
            </span>
            <button
              onClick={() => triggerBlockProduce()}
              title="Manually trigger sub-second consensus cycle"
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-emerald-600 rounded transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Identity Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Key className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500 hidden md:inline font-medium">Actor:</span>
            <select
              value={currentDid.didUri}
              onChange={(e) => switchActiveDid(e.target.value)}
              className="bg-transparent font-mono text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {dids.map((d) => (
                <option key={d.id} value={d.didUri} className="bg-white text-slate-900">
                  {d.role} ({d.clearanceLevel.replace('LEVEL_', 'L')})
                </option>
              ))}
            </select>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-lg border transition text-xs flex items-center gap-1 ${
              audioEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title={audioEnabled ? 'Mute cyber audio' : 'Enable cyber synthesized audio'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
