import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Wrench,
  Play,
  Copy,
  Check,
  Upload,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { AuditContract } from '../../types/blockchain';

export const AuditTab: React.FC = () => {
  const { contracts, runSmartContractAudit, applyContractPatch, addNewContract } = useBlockchain();
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || '');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'CODE' | 'PATCH_DIFF'>('CODE');
  const [copied, setCopied] = useState<boolean>(false);

  // New contract modal/form state
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newFilename, setNewFilename] = useState<string>('CustomSecurityAudit.sol');
  const [newCode, setNewCode] = useState<string>(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CustomAuditTest {
    mapping(address => uint256) public userBalances;
    
    function withdraw(uint256 amount) external {
        require(userBalances[msg.sender] >= amount);
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok);
        userBalances[msg.sender] -= amount;
    }
}`);

  const activeContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const handleRunAudit = async () => {
    if (!activeContract) return;
    setIsAuditing(true);
    await runSmartContractAudit(activeContract.id);
    setIsAuditing(false);
  };

  const handleApplyPatch = async () => {
    if (!activeContract) return;
    await applyContractPatch(activeContract.id);
  };

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCustomContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    addNewContract(newTitle, newFilename, newCode);
    setShowNewModal(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Automated Smart Contract Security Auditor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Static AST analysis, dynamic symbolic taint verification, and automated cryptographic patch remediation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            Upload Contract
          </button>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'Auditing AST...' : 'Run Security Audit'}
          </button>
        </div>
      </div>

      {/* Contract Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {contracts.map((c) => {
          const isSelected = c.id === activeContract?.id;
          const score = c.securityScore ?? 0;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedContractId(c.id);
                setActiveView('CODE');
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>{c.filename}</span>
              {c.status === 'AUDITED' || c.status === 'PATCHED' ? (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                    score >= 90
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {score}/100
                </span>
              ) : (
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-600 border border-slate-200">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Code Editor on Left, Audit Results on Right */}
      {activeContract && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Code Viewer / Diff (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {activeContract.filename}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {activeContract.language}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveView('CODE')}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                      activeView === 'CODE'
                        ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Source Code
                  </button>
                  {activeContract.patchedCode && activeContract.status !== 'PATCHED' && (
                    <button
                      onClick={() => setActiveView('PATCH_DIFF')}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                        activeView === 'PATCH_DIFF'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Remediation Diff
                    </button>
                  )}
                </div>
              </div>

              {/* Code Display Area: High-contrast Dark-Slate IDE viewer */}
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-100 overflow-x-auto max-h-[460px] border border-slate-800 shadow-inner">
                {activeView === 'CODE' ? (
                  <pre className="leading-relaxed">
                    <code>{activeContract.code}</code>
                  </pre>
                ) : (
                  <div>
                    <div className="text-[11px] font-mono text-emerald-400 mb-2 pb-1 border-b border-slate-800">
                      // AUTOMATED SECURITY PATCH PROPOSAL (CHECKS-EFFECTS-INTERACTIONS + REENTRANCY GUARD)
                    </div>
                    <pre className="leading-relaxed text-emerald-300">
                      <code>{activeContract.patchedCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Status:{' '}
                <strong className={activeContract.status === 'PATCHED' ? 'text-emerald-700' : 'text-amber-700'}>
                  {activeContract.status}
                </strong>
              </span>

              {activeContract.issues.length > 0 && activeContract.status !== 'PATCHED' && (
                <button
                  onClick={handleApplyPatch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Apply Automated Security Patch
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Security Analysis & Vulnerabilities (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Scorecard */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Security Scorecard</h3>
                  <p className="text-xs text-slate-500">Automated formal verification engine</p>
                </div>

                <div
                  className={`text-2xl font-mono font-extrabold px-3 py-1 rounded-xl border ${
                    (activeContract.securityScore ?? 0) >= 90
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {activeContract.securityScore ?? '--'}/100
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (activeContract.securityScore ?? 0) >= 90 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${activeContract.securityScore ?? 0}%` }}
                />
              </div>

              {/* On-Chain Verification Hash */}
              {activeContract.auditHash && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-700">
                      <Hash className="w-3 h-3 text-emerald-600" /> On-Chain Attestation Hash
                    </span>
                    <button
                      onClick={() => handleCopyHash(activeContract.auditHash!)}
                      className="p-1 hover:text-emerald-700 text-slate-400 transition"
                      title="Copy Hash"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-emerald-700 truncate font-medium">
                    {activeContract.auditHash}
                  </div>
                </div>
              )}
            </div>

            {/* Issues Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Identified Vulnerabilities ({activeContract.issues.length})
                </h3>
                {activeContract.issues.length === 0 && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> All Checks Passed
                  </span>
                )}
              </div>

              {activeContract.issues.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-90" />
                  <p className="text-xs font-bold text-slate-900">Formally Verified & Secure</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No reentrancy, phishable tx.origin, unhandled calls, or signature replays found.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {activeContract.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {issue.severity}: {issue.swcId}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                          Line {issue.line}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mb-1">{issue.title}</h4>
                      <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-900">
                        <strong className="text-emerald-800">Fix Recommendation:</strong>{' '}
                        {issue.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Custom Contract Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload Contract for Security Audit</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit Solidity or Rust ink! bytecode/source to be analyzed by the Aegis AST static and dynamic verification engine.
            </p>

            <form onSubmit={handleCreateCustomContract} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contract Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Payment Escrow"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Filename</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PaymentEscrow.sol"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contract Source Code</label>
                <textarea
                  rows={8}
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  Upload & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
