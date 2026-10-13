import React, { useState } from 'react';
import {
  Network,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Send,
  RefreshCw,
  ExternalLink,
  Shield,
  Hash,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

export const BridgeTab: React.FC = () => {
  const { transfers, executeBridgeTransfer, currentDid } = useBlockchain();

  const [sourceChain, setSourceChain] = useState<
    'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay'
  >('AegisChain L1');
  const [destChain, setDestChain] = useState<
    'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay'
  >('Ethereum L2');
  const [asset, setAsset] = useState<string>('AEGIS-USD (Security Escrow)');
  const [amount, setAmount] = useState<string>('50,000.00');
  const [recipient, setRecipient] = useState<string>(
    '0x32A44B9E0981cCa40182E098d70A110294bfa293'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const chains: ('AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay')[] = [
    'AegisChain L1',
    'Ethereum L2',
    'Solana',
    'Cosmos IBC',
    'Polkadot Relay',
  ];

  const handleSwapChains = () => {
    const temp = sourceChain;
    setSourceChain(destChain);
    setDestChain(temp);
  };

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim() || !recipient.trim()) return;
    setIsSubmitting(true);
    await executeBridgeTransfer(sourceChain, destChain, asset, amount, recipient);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cross-Chain Interoperability & State Sync Bridge
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trustless cross-platform asset transfers and cryptographic state synchronization across diverse distributed ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          Threshold Multi-Sig: 4/4 Relayer Quorum
        </div>
      </div>

      {/* Main Bridge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transfer Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
            Cross-Chain Relay Transfer
          </h3>

          <form onSubmit={handleSubmitTransfer} className="space-y-4">
            {/* Source & Destination Selector with Swap */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Chain</label>
                <select
                  value={sourceChain}
                  onChange={(e) => setSourceChain(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                >
                  {chains.map((c) => (
                    <option key={c} value={c} disabled={c === destChain}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center my-1">
                <button
                  type="button"
                  onClick={handleSwapChains}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition"
                  title="Swap source and destination"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Chain</label>
                <select
                  value={destChain}
                  onChange={(e) => setDestChain(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                >
                  {chains.map((c) => (
                    <option key={c} value={c} disabled={c === sourceChain}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Asset Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bridge Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="AEGIS-USD (Security Escrow)">AEGIS-USD (Security Escrow)</option>
                <option value="Zero-Knowledge Access Voucher">Zero-Knowledge Access Voucher</option>
                <option value="IBC Security Telemetry Oracle">IBC Security Telemetry Oracle</option>
                <option value="Raw Governance Voting Power">Raw Governance Voting Power</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Amount</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                placeholder="e.g. 50,000.00"
              />
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recipient Address on Destination
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                placeholder="0x... or cosmos1..."
              />
            </div>

            {/* Relayer Security Note */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              Transfers require <strong className="text-emerald-700">4 independent validator relayer signatures</strong> with
              Merkle state proof attestation before mint/unlock.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Relaying Cross-Chain Payload...' : 'Initiate Cryptographic Relay'}
            </button>
          </form>
        </div>

        {/* Right Column: State Sync & Relayer Topology (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Synchronized Chains Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Synchronized Multi-Chain State Ledgers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Ethereum L2 (Arbitrum / Optimism)', status: 'SYNCHRONIZED', latency: '42ms', root: '0x8892...11a0' },
                { name: 'Solana (Sealevel State)', status: 'SYNCHRONIZED', latency: '28ms', root: '0x12fa...44cc' },
                { name: 'Cosmos IBC Hub (Tendermint)', status: 'SYNCHRONIZED', latency: '35ms', root: '0x71c8...861b' },
                { name: 'Polkadot Relay Chain (Substrate)', status: 'SYNCHRONIZED', latency: '52ms', root: '0x992b...ab34' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Sync Latency: <span className="text-slate-800 font-semibold">{c.latency}</span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-700 truncate mt-1 font-medium">
                    State Root: {c.root}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Relayer Transfers Ledger */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Cross-Chain Bridge Ledger</h3>
              <span className="text-xs text-slate-500 font-mono">{transfers.length} transfers active</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {transfers.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{tx.asset}</span>
                      <span className="text-emerald-700 font-mono font-bold">({tx.amount})</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        tx.status === 'FINALIZED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : tx.status === 'RELAYED'
                          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {tx.status} ({tx.relayerSignaturesCount}/{tx.requiredSignatures} Sigs)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="font-mono text-slate-800 font-semibold">{tx.sourceChain}</span>
                    <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-slate-800 font-semibold">{tx.destChain}</span>
                    <span className="ml-auto text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 truncate pt-1 border-t border-slate-200">
                    Proof: {tx.stateRootProof}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
