import React from 'react';
import { Activity, Zap, ShieldCheck, Clock, Layers, Users } from 'lucide-react';
import { useBlockchain } from '../context/BlockchainContext';

export const NetworkStatsBar: React.FC = () => {
  const { networkMetrics, validators, blocks } = useBlockchain();
  const latestBlock = blocks[0];
  const activeValidatorsCount = validators.filter((v) => v.status === 'ACTIVE').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Block Height */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Block Height
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="font-mono text-lg font-bold text-slate-900 tracking-tight">
          #{networkMetrics.blockHeight.toLocaleString()}
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
          Root: {latestBlock?.hash.slice(0, 10)}...
        </div>
      </div>

      {/* Low-Latency TPS */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            Throughput (TPS)
          </span>
          <span className="text-[10px] text-cyan-700 font-mono font-medium bg-cyan-50 px-1 rounded border border-cyan-200">BFT 3.0</span>
        </div>
        <div className="font-mono text-lg font-bold text-cyan-700 tracking-tight">
          {networkMetrics.tps.toLocaleString()} <span className="text-xs text-slate-500 font-normal">tx/s</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Peak burst: 35,000 TPS
        </div>
      </div>

      {/* Validation Finality */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Sub-Second Finality
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-medium bg-emerald-50 px-1 rounded border border-emerald-200">Instant</span>
        </div>
        <div className="font-mono text-lg font-bold text-emerald-700 tracking-tight">
          {networkMetrics.avgLatencyMs} <span className="text-xs text-slate-500 font-normal">ms</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          p99 consensus latency
        </div>
      </div>

      {/* Energy Efficiency */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            Energy Efficiency
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-medium bg-emerald-50 px-1 rounded border border-emerald-200">Eco-PoS</span>
        </div>
        <div className="font-mono text-lg font-bold text-amber-700 tracking-tight">
          0.00012 <span className="text-xs text-slate-500 font-normal">kWh/tx</span>
        </div>
        <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
          -99.98% vs Legacy PoW
        </div>
      </div>

      {/* Blocked Cyber Threats */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            Threats Neutralized
          </span>
          <span className="text-[10px] text-rose-700 font-mono font-medium bg-rose-50 px-1 rounded border border-rose-200">Zero-Trust</span>
        </div>
        <div className="font-mono text-lg font-bold text-rose-600 tracking-tight">
          {networkMetrics.blockedAttacksCount} <span className="text-xs text-slate-500 font-normal">attacks</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          100% gateway rejection rate
        </div>
      </div>

      {/* Active Validators */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Validators Active
          </span>
          <span className="text-[10px] text-purple-700 font-mono font-medium bg-purple-50 px-1 rounded border border-purple-200">248 Mesh</span>
        </div>
        <div className="font-mono text-lg font-bold text-purple-700 tracking-tight">
          {activeValidatorsCount} / {validators.length} <span className="text-xs text-slate-500 font-normal">nodes</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {(networkMetrics.totalStakedAegis / 1000000).toFixed(1)}M AEGIS staked
        </div>
      </div>
    </div>
  );
};
