import React from 'react';
import {
  Layers,
  ShieldAlert,
  ArrowRight,
  Activity,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Radio,
  Clock,
  Sparkles,
  Crosshair,
  Building2,
  Key,
  Flame,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

export const OverviewTab: React.FC<{ onNavigateTab: (tab: any) => void }> = ({ onNavigateTab }) => {
  const {
    blocks,
    transactions,
    threatLogs,
    consensusPhase,
    isConsensusRunning,
    setConsensusRunning,
    triggerBlockProduce,
    networkMetrics,
  } = useBlockchain();

  const phases = [
    { id: 'PROPOSE', label: '1. Propose', desc: 'Round leader broadcasts block candidate' },
    { id: 'PRE_VOTE', label: '2. Pre-Vote', desc: '>2/3 validator signature aggregation' },
    { id: 'PRE_COMMIT', label: '3. Pre-Commit', desc: 'Threshold BLS multi-sig quorum locked' },
    { id: 'COMMIT', label: '4. Finalize', desc: 'ZK state root minted with <400ms finality' },
  ];

  return (
    <div className="space-y-6">
      {/* Consensus Engine Interactive Visualizer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-bold text-slate-900">
                Low-Latency Aegis-BFT Consensus Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Avg Finality: {networkMetrics.avgLatencyMs}ms
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimized Byzantine Fault Tolerant protocol providing sub-second settlement for zero-trust cybersecurity operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConsensusRunning(!isConsensusRunning)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isConsensusRunning
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
              }`}
            >
              {isConsensusRunning ? 'Pause Auto-Tick' : 'Resume Auto-Tick'}
            </button>
            <button
              onClick={() => triggerBlockProduce()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              Trigger Consensus Now
            </button>
          </div>
        </div>

        {/* 4-Phase Visual Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
          {phases.map((phase) => {
            const isCurrent = consensusPhase === phase.id;
            return (
              <div
                key={phase.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold tracking-wider">{phase.label}</span>
                  {isCurrent ? (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-600 text-white">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">READY</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">{phase.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Real-time Architecture Capabilities Badges */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic State Finality via SHA-256 Merkle Roots</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Zero-Knowledge Proof Attestation</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-purple-600" />
            <span>Automated Slashing Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Cross-Chain State Relay Synced</span>
          </div>
        </div>
      </div>

      {/* Grid: Live Threat Mitigation Feed & Recent Verified Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Real-Time Cyber Threat Mitigation Stream */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Threat Mitigation & Defense Stream
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-rose-50 text-rose-700 border border-rose-200">
                {threatLogs.length} Events Logged
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Automated intrusion rejections, unauthorized access denials, and Byzantine slashing events enforced directly on-chain.
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {threatLogs.slice(0, 5).map((threat) => (
                <div
                  key={threat.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase bg-rose-50 text-rose-700 border border-rose-200">
                      {threat.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{threat.details}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Defended by: <strong className="text-emerald-700">{threat.blockedBy}</strong></span>
                    <span className="text-slate-500">Tx: {threat.txHash.slice(0, 12)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Zero-Trust perimeter enforcement active</span>
            <button
              onClick={() => onNavigateTab('did')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              Test Access Gateway <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Latest Verified Blocks & Ledger State */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Latest Verified Blocks</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Aegis-BFT Consensus
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Cryptographically linked blocks with SHA-256 Merkle root verification and zero-knowledge validity proofs.
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {blocks.slice(0, 6).map((block) => (
                <div
                  key={block.height}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5 hover:border-emerald-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Block #{block.height}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {block.finalityMs}ms finality
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                    <div>
                      <span className="text-slate-400">Proposer:</span>{' '}
                      <span className="text-slate-800 font-semibold">{block.proposer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Txs:</span>{' '}
                      <span className="text-slate-800 font-semibold">{block.transactionsCount}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    Hash: <span className="text-slate-700">{block.hash}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    Merkle Root: <span className="text-cyan-700 font-semibold">{block.merkleRoot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">Energy: 0.00012 kWh/tx</span>
            <button
              onClick={() => onNavigateTab('validators')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              View Validator Topology <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Module Shortcuts Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Real Websites & Case Studies */}
        <div
          onClick={() => onNavigateTab('case-studies')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="text-sm font-bold text-slate-900">
              Real Websites &amp; Case Studies
            </h4>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
              NATO/Estonia
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Real production deployments using blockchain for cybersecurity: Guardtime, PolySwarm, Forta, CertiK, and Remme.
          </p>
        </div>

        {/* Card 2: Cyber Range Attack Simulator */}
        <div
          onClick={() => onNavigateTab('threat-simulator')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <Crosshair className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition" />
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <h4 className="text-sm font-bold text-slate-900">
              Attack Simulator &amp; Cyber Range
            </h4>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
              INTERACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Simulate 5 weaponized attack vectors (SQL injection, token replay, Byzantine double-signing) against defensive consensus.
          </p>
        </div>

        {/* Card 3: Decentralized PKI & Key Revocation */}
        <div
          onClick={() => onNavigateTab('pki')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-cyan-300 hover:shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Key className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Decentralized PKI &amp; TLS Registry
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminates vulnerable centralized CAs. Verifies SSL/TLS &amp; SSH keys with sub-second on-chain revocation.
          </p>
        </div>

        {/* Card 4: Threat Intel Marketplace */}
        <div
          onClick={() => onNavigateTab('threat-intel')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Flame className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Threat Intel &amp; IOC Marketplace
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Crowdsourced zero-day telemetry with token staking and 1-click export to STIX 2.1 JSON and YARA rules.
          </p>
        </div>

        {/* Card 5: Automated Smart Contract Auditor */}
        <div
          onClick={() => onNavigateTab('audit')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Smart Contract Security Auditor
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            AST static &amp; dynamic taint scanner detecting SWC vulnerabilities with 1-click automated patch generator.
          </p>
        </div>

        {/* Card 6: Decentralized Identity & Access Control */}
        <div
          onClick={() => onNavigateTab('did')}
          className="group cursor-pointer p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-cyan-300 hover:shadow-xs transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Lock className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            W3C DID &amp; Zero-Trust Gateway
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Granular access control integrating legacy IT/OT infrastructure with cryptographic Verifiable Credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
