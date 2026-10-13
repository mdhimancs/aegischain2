import React, { useState } from 'react';
import {
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Server,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { PROTECTED_RESOURCES } from '../../utils/initialData';
import { ClearanceLevel, UserRole } from '../../types/blockchain';

export const DidTab: React.FC = () => {
  const {
    currentDid,
    dids,
    credentials,
    accessLogs,
    requestAccess,
    issueVerifiableCredential,
    createDid,
    switchActiveDid,
  } = useBlockchain();

  const [testingResourceId, setTestingResourceId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    resourceId: string;
    authorized: boolean;
    reason: string;
    latencyMs: number;
  } | null>(null);

  // Modal states
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [showCreateDidModal, setShowCreateDidModal] = useState<boolean>(false);

  // Form states for issuing credential
  const [targetDidUri, setTargetDidUri] = useState<string>(currentDid.didUri);
  const [targetRole, setTargetRole] = useState<UserRole>('SECOPS_ENGINEER');
  const [targetClearance, setTargetClearance] = useState<ClearanceLevel>('LEVEL_3_SECRET');
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([
    '/api/v2/financial-db',
    '/api/v2/k8s-secrets',
  ]);

  // Form states for creating new DID
  const [newDidRole, setNewDidRole] = useState<UserRole>('GUEST_ACTOR');
  const [newDidClearance, setNewDidClearance] = useState<ClearanceLevel>('LEVEL_1_PUBLIC');

  const activeCredentials = credentials.filter((c) => c.didUri === currentDid.didUri);

  const handleTestAccess = async (resourceId: string) => {
    setTestingResourceId(resourceId);
    setTestResult(null);
    const res = await requestAccess(resourceId);
    setTestResult({
      resourceId,
      authorized: res.authorized,
      reason: res.reason,
      latencyMs: res.latencyMs,
    });
    setTestingResourceId(null);
  };

  const handleIssueCredential = (e: React.FormEvent) => {
    e.preventDefault();
    issueVerifiableCredential(targetDidUri, targetRole, targetClearance, selectedEndpoints);
    setShowIssueModal(false);
  };

  const handleCreateDid = (e: React.FormEvent) => {
    e.preventDefault();
    createDid(newDidRole, newDidClearance);
    setShowCreateDidModal(false);
  };

  const toggleEndpointSelection = (endpoint: string) => {
    if (selectedEndpoints.includes(endpoint)) {
      setSelectedEndpoints(selectedEndpoints.filter((ep) => ep !== endpoint));
    } else {
      setSelectedEndpoints([...selectedEndpoints, endpoint]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Decentralized Identity (DID) & Zero-Trust Access Gateway
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            W3C Verifiable Credentials, role-based cryptographic access control, and legacy infrastructure adapters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateDidModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            Register New DID
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Issue Verifiable Credential
          </button>
        </div>
      </div>

      {/* Active Identity Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-xs">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Active Identity Document</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {currentDid.role}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {currentDid.clearanceLevel.replace('LEVEL_', 'CLEARANCE ')}
                </span>
              </div>
              <div className="font-mono text-xs text-emerald-700 mt-0.5 break-all font-medium">
                {currentDid.didUri}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Identity Switch:</span>
            <select
              value={currentDid.didUri}
              onChange={(e) => switchActiveDid(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
            >
              {dids.map((d) => (
                <option key={d.id} value={d.didUri}>
                  {d.role} - {d.clearanceLevel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credentials Attached */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Cryptographic Verifiable Credentials ({activeCredentials.length})
          </h4>

          {activeCredentials.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              No active Verifiable Credentials found for this DID. This identity operates as an uncredentialed actor.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900">{cred.claims.department}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {cred.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">
                      Issuer: <span className="font-mono text-slate-700 font-medium">{cred.issuer}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mb-1">Allowed Scope:</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {cred.claims.allowedEndpoints.map((ep) => (
                        <span
                          key={ep}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-700 border border-slate-200 rounded"
                        >
                          {ep}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate pt-2 border-t border-slate-200">
                    Sig: {cred.signature}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zero-Trust Gateway Simulator: Test Access to Critical Resources */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Simulated Enterprise Legacy Infrastructure Endpoints
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Request Access&quot; to test the Zero-Trust Gateway verification against your active DID and Verifiable Credentials.
            </p>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="space-y-3">
          {PROTECTED_RESOURCES.map((res) => {
            const isTesting = testingResourceId === res.id;
            const resResult = testResult?.resourceId === res.id ? testResult : null;

            return (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{res.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-white text-slate-700 border border-slate-200">
                      {res.endpoint}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        res.requiredClearance === 'LEVEL_4_TOP_SECRET'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : res.requiredClearance === 'LEVEL_3_SECRET'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}
                    >
                      Requires: {res.requiredClearance.replace('LEVEL_', 'L')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{res.description}</p>
                  <p className="text-[11px] text-slate-500">
                    Legacy Integration: <strong className="text-slate-800">{res.legacySystem}</strong>
                  </p>

                  {/* Feedback on test result */}
                  {resResult && (
                    <div
                      className={`p-2.5 rounded-lg text-xs mt-2 flex items-start gap-2 ${
                        resResult.authorized
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border border-rose-300 text-rose-900'
                      }`}
                    >
                      {resResult.authorized ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">
                          {resResult.authorized ? 'ACCESS GRANTED (200 OK)' : 'ACCESS DENIED (403 FORBIDDEN)'}{' '}
                          <span className="font-mono text-[10px]">({resResult.latencyMs}ms)</span>
                        </div>
                        <p className="text-[11px] opacity-90 mt-0.5">{resResult.reason}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() => handleTestAccess(res.id)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-xs"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying ZK...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        Request Access
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Access Request Log Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Immutable Access Control Audit Logs</h3>
          <span className="text-xs text-slate-500 font-mono">{accessLogs.length} attempts recorded</span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {accessLogs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    log.result === 'AUTHORIZED'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {log.result}
                </span>
                <span className="font-mono font-semibold text-slate-800">{log.targetResource}</span>
                <span className="text-slate-500 text-[11px]">via {log.didUri}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span>Latency: {log.latencyMs}ms</span>
                <span>ZK: {log.zkProofVerified ? 'VERIFIED' : 'FAILED'}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Issue Verifiable Credential */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Issue Cryptographic Verifiable Credential</h3>
            <p className="text-xs text-slate-500 mb-4">
              Mint a W3C-compliant credential signed by the Aegis Root Governance Authority with custom scope claims.
            </p>

            <form onSubmit={handleIssueCredential} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target DID</label>
                <select
                  value={targetDidUri}
                  onChange={(e) => setTargetDidUri(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {dids.map((d) => (
                    <option key={d.id} value={d.didUri}>
                      {d.role} - {d.didUri}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role Claim</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="TIER3_AUDITOR">TIER3_AUDITOR</option>
                    <option value="SECOPS_ENGINEER">SECOPS_ENGINEER</option>
                    <option value="SOC_ANALYST">SOC_ANALYST</option>
                    <option value="INFRA_GATEWAY">INFRA_GATEWAY</option>
                    <option value="GUEST_ACTOR">GUEST_ACTOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Clearance Level</label>
                  <select
                    value={targetClearance}
                    onChange={(e) => setTargetClearance(e.target.value as ClearanceLevel)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="LEVEL_1_PUBLIC">LEVEL 1 - Public</option>
                    <option value="LEVEL_2_CONFIDENTIAL">LEVEL 2 - Confidential</option>
                    <option value="LEVEL_3_SECRET">LEVEL 3 - Secret</option>
                    <option value="LEVEL_4_TOP_SECRET">LEVEL 4 - Top Secret</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Allowed Endpoints Scope
                </label>
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {PROTECTED_RESOURCES.map((res) => (
                    <label key={res.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEndpoints.includes(res.endpoint)}
                        onChange={() => toggleEndpointSelection(res.endpoint)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                      />
                      <span>{res.endpoint} ({res.name})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  Sign & Issue Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New DID */}
      {showCreateDidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New Decentralized Identity</h3>
            <p className="text-xs text-slate-500 mb-4">
              Generates a new cryptographic keypair and anchors a W3C DID Document onto AegisChain.
            </p>

            <form onSubmit={handleCreateDid} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Actor Role</label>
                <select
                  value={newDidRole}
                  onChange={(e) => setNewDidRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="SECOPS_ENGINEER">SECOPS_ENGINEER</option>
                  <option value="SOC_ANALYST">SOC_ANALYST</option>
                  <option value="TIER3_AUDITOR">TIER3_AUDITOR</option>
                  <option value="INFRA_GATEWAY">INFRA_GATEWAY</option>
                  <option value="GUEST_ACTOR">GUEST_ACTOR (Untrusted External)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Base Clearance Level</label>
                <select
                  value={newDidClearance}
                  onChange={(e) => setNewDidClearance(e.target.value as ClearanceLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="LEVEL_1_PUBLIC">LEVEL 1 - Public</option>
                  <option value="LEVEL_2_CONFIDENTIAL">LEVEL 2 - Confidential</option>
                  <option value="LEVEL_3_SECRET">LEVEL 3 - Secret</option>
                  <option value="LEVEL_4_TOP_SECRET">LEVEL 4 - Top Secret</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDidModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  Generate Keypair & Anchor DID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
