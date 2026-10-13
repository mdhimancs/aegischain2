import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Terminal,
  Crosshair,
  Skull,
  Lock,
  RotateCcw,
  Hash,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { AttackVectorSimulation, AttackExecutionResult } from '../../types/blockchain';

export const ThreatSimulatorTab: React.FC = () => {
  const { attackSimulations, executeAttackSimulation, attackHistory, networkMetrics } = useBlockchain();
  const [selectedSimId, setSelectedSimId] = useState<string>(attackSimulations[0]?.id || '');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<AttackExecutionResult | null>(null);

  const activeSimulation =
    attackSimulations.find((s) => s.id === selectedSimId) || attackSimulations[0];

  const handleRunSimulation = async () => {
    if (!activeSimulation) return;
    setIsExecuting(true);
    try {
      const result = await executeAttackSimulation(activeSimulation.id);
      setLastResult(result);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Interactive Cyber Range & SOC Attack Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Test AegisChain&apos;s real-time defensive consensus against weaponized attack vectors. Observe automated zero-trust rejections, Merkle state integrity verification, and validator slashing in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Defended Attacks</div>
            <div className="text-base font-mono font-bold text-emerald-700">
              {networkMetrics.blockedAttacksCount} Mitigated
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Integrity Rating</div>
            <div className="text-base font-mono font-bold text-cyan-700">100.0%</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Attack Vectors on Left, Live Simulator & Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attack Vector Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Attack Vector
          </h3>

          {attackSimulations.map((sim) => {
            const isSelected = sim.id === activeSimulation?.id;
            return (
              <div
                key={sim.id}
                onClick={() => {
                  setSelectedSimId(sim.id);
                  setLastResult(null);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-rose-50/50 border-rose-300 shadow-xs ring-1 ring-rose-200'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-rose-600" />
                    {sim.title}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                      sim.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {sim.severity}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                  {sim.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-200/80 text-slate-500">
                  <span>Target: <strong className="text-slate-700">{sim.targetService}</strong></span>
                  <span className="text-emerald-700 font-semibold">Simulate →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Execution Console & Incident Report (7 cols) */}
        {activeSimulation && (
          <div className="lg:col-span-7 space-y-4">
            {/* Simulation Detail & Payload Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-rose-600" />
                    {activeSimulation.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Target: <strong className="text-slate-800">{activeSimulation.targetService}</strong>
                  </div>
                </div>

                <button
                  onClick={handleRunSimulation}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition shadow-xs"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                  {isExecuting ? 'Injecting Attack Vector...' : 'Execute Attack Simulation'}
                </button>
              </div>

              {/* Injected Attack Payload Viewer */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Simulated Exploit Payload:</span>
                  <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Hostile Inbound Traffic
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-rose-400 overflow-x-auto shadow-inner">
                  <code>{activeSimulation.payloadSummary}</code>
                </div>
              </div>

              {/* Legacy Vulnerability vs Blockchain Defense */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-rose-800 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Why Legacy Fails:
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {activeSimulation.legacyVulnerability}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    AegisChain Defensive Mechanism:
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {activeSimulation.blockchainDefenseMechanism}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Attack Execution Result Card */}
            {lastResult && (
              <div className="bg-white border border-emerald-300 rounded-2xl p-5 shadow-xs space-y-3 ring-1 ring-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-800 text-sm">
                      Attack Successfully Neutralized On-Chain
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-800">
                    BLOCKED
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  {lastResult.defenseAction}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Incident Receipt</div>
                    <div className="font-bold text-slate-900 mt-0.5">{lastResult.incidentReceipt}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Block Anchor</div>
                    <div className="font-bold text-slate-900 mt-0.5">#{lastResult.blockHeight}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-500 uppercase">Proof Hash</div>
                    <div className="font-bold text-cyan-700 truncate mt-0.5">{lastResult.proofHash.slice(0, 16)}...</div>
                  </div>
                </div>

                {lastResult.slashedValidator && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                    <span>Automated Slashing: <strong>{lastResult.slashedValidator}</strong> jailed &amp; 25% stake burned</span>
                    <span className="font-mono font-bold">-490,000 AEGIS</span>
                  </div>
                )}
              </div>
            )}

            {/* Historical Incident Ledger */}
            {attackHistory.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Recent Incident Reports in this Session ({attackHistory.length})
                </h4>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {attackHistory.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-slate-800 font-bold">{h.incidentReceipt}</span>
                      <span className="text-emerald-700 font-semibold">{h.mitigationStage}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
