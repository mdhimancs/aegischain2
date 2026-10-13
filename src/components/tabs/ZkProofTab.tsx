import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Cpu,
  Key,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Play,
  Layers,
  Fingerprint,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { ZkProofRecord } from '../../types/blockchain';

export const ZkProofTab: React.FC = () => {
  const { zkProofs, generateAndVerifyZk } = useBlockchain();

  const [statement, setStatement] = useState<string>(
    'Zero-Knowledge Membership in Tier-3 SecOps Whitelist without revealing DID or identity hash'
  );
  const [proofType, setProofType] = useState<'Groth16-zkSNARK' | 'PLONK' | 'STARK-Halo2'>(
    'Groth16-zkSNARK'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [latestVerified, setLatestVerified] = useState<ZkProofRecord | null>(null);

  const sampleStatements = [
    {
      title: 'Confidential Identity Proof',
      desc: 'Prove possession of Tier-3 clearance without disclosing DID identity hash',
      type: 'Groth16-zkSNARK' as const,
    },
    {
      title: 'Validator Stake Range Proof',
      desc: 'Prove node holds >1,000,000 AEGIS stake for consensus without revealing balance',
      type: 'PLONK' as const,
    },
    {
      title: 'Cross-Chain Merkle Inclusion',
      desc: 'Prove inclusion in remote chain state root without exposing foreign ledger transactions',
      type: 'STARK-Halo2' as const,
    },
  ];

  const handleGenerateAndVerify = async () => {
    setIsGenerating(true);
    const res = await generateAndVerifyZk(statement, proofType);
    setLatestVerified(res);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Zero-Knowledge Proof (ZKP) Verification Sandbox
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic non-interactive zero-knowledge proofs (zk-SNARKs & PLONK) providing confidential access control and instant finality.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <Zap className="w-3.5 h-3.5" />
          Average Verification: 3.8ms
        </div>
      </div>

      {/* Main Interactive Prover / Verifier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prover Sandbox (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Construct & Verify ZK Statement
              </h3>
              <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                BN254 Elliptic Curve
              </span>
            </div>

            {/* Quick statement presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Proof Statement Presets:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {sampleStatements.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStatement(sample.desc);
                      setProofType(sample.type);
                    }}
                    className={`text-left p-2.5 rounded-xl border text-xs transition ${
                      statement === sample.desc
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{sample.title}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{sample.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Statement Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Verification Statement
              </label>
              <input
                type="text"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>

            {/* Circuit Scheme Selection */}
            <div className="grid grid-cols-3 gap-2">
              {(['Groth16-zkSNARK', 'PLONK', 'STARK-Halo2'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setProofType(scheme)}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-semibold text-center transition ${
                    proofType === scheme
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>

            {/* Math constraints breakdown */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
              <div className="text-slate-800 font-bold">// Circuit Arithmetization Matrix</div>
              <div>• R1CS Constraints: 43,280 equations</div>
              <div>• Commitment Scheme: Kate-Zaverucha-Goldberg (KZG) / Pedersen</div>
              <div>• Zero-Knowledge Property: Perfect statistical hiding + computational soundness</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Trustless sub-second validation</span>
            <button
              onClick={handleGenerateAndVerify}
              disabled={isGenerating || !statement.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-xs"
            >
              <Play className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Computing Witness & Verifying...' : 'Generate & Verify ZK Proof'}
            </button>
          </div>
        </div>

        {/* Right Column: Cryptographic Output & Active Proof (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Proof Finality Verifier
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                On-Chain Evaluator
              </span>
            </div>

            {latestVerified ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Cryptographic Proof Validated
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    Bilinear pairing equation $e(\pi_A, \pi_B) = e(\alpha, \beta) \cdot e(\pi_C, \gamma)$ satisfied in{' '}
                    <strong>{latestVerified.verificationTimeMs}ms</strong>.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">Proof Hash</div>
                    <div className="text-slate-900 truncate text-[11px] mt-0.5 font-medium">{latestVerified.proofHash}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">Pedersen Commitment</div>
                    <div className="text-cyan-700 truncate text-[11px] mt-0.5 font-medium">
                      {latestVerified.pedersenCommitment}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px] uppercase font-semibold">Public Signals Vector</div>
                    <div className="text-slate-700 text-[11px] mt-0.5">
                      [{latestVerified.publicSignals.join(', ')}]
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                <Fingerprint className="w-10 h-10 text-emerald-600/70 mx-auto mb-2" />
                Select or configure a statement and click &quot;Generate & Verify ZK Proof&quot; to inspect real cryptographic attestation.
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Proof Size</div>
                <div className="text-base font-mono font-bold text-slate-900 mt-0.5">128 bytes</div>
                <div className="text-[10px] text-emerald-700 font-medium">Constant Groth16</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Verifier Gas</div>
                <div className="text-base font-mono font-bold text-slate-900 mt-0.5">~18,500 gas</div>
                <div className="text-[10px] text-cyan-700 font-medium">Ultra-efficient</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical ZK Proof Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Immutable Zero-Knowledge Proof Registry</h3>
          <span className="text-xs text-slate-500 font-mono">{zkProofs.length} proofs recorded</span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {zkProofs.map((zk) => (
            <div
              key={zk.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {zk.proofType}
                  </span>
                  <span className="font-bold text-slate-900">{zk.statement}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  Hash: {zk.proofHash}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 shrink-0">
                <span className="text-emerald-700 font-bold">{zk.verificationTimeMs}ms</span>
                <span className="text-slate-500">
                  {new Date(zk.verifiedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
