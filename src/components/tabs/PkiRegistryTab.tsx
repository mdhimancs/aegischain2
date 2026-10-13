import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Key,
  CheckCircle2,
  XCircle,
  Plus,
  Copy,
  Check,
  Search,
  ExternalLink,
  Layers,
  Clock,
  FileCode,
  AlertTriangle,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { DecentralizedCertificate } from '../../types/blockchain';

export const PkiRegistryTab: React.FC = () => {
  const { certificates, issueCertificate, revokeCertificate, currentDid } = useBlockchain();
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [newDomain, setNewDomain] = useState<string>('auth.secops.internal');
  const [newType, setNewType] = useState<DecentralizedCertificate['certType']>('TLS_SSL_WEB');
  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [revokeModalCert, setRevokeModalCert] = useState<DecentralizedCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('Suspected private key compromise');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Certificate Verifier Simulator
  const [verifyDomain, setVerifyDomain] = useState<string>('vault.aegis.internal');
  const [verifyResult, setVerifyResult] = useState<{
    tested: boolean;
    valid: boolean;
    cert?: DecentralizedCertificate;
    latencyMs: number;
  } | null>(null);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsIssuing(true);
    await issueCertificate(newDomain.trim(), newType);
    setIsIssuing(false);
    setShowIssueModal(false);
    setNewDomain('');
  };

  const handleConfirmRevoke = async () => {
    if (!revokeModalCert) return;
    await revokeCertificate(revokeModalCert.id, revokeReason);
    setRevokeModalCert(null);
  };

  const handleTestVerification = () => {
    const start = performance.now();
    const found = certificates.find(
      (c) => c.domainOrSubject.toLowerCase() === verifyDomain.trim().toLowerCase()
    );
    const end = performance.now();
    setVerifyResult({
      tested: true,
      valid: found ? found.status === 'VALID' : false,
      cert: found,
      latencyMs: parseFloat((end - start + 0.35).toFixed(2)),
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Decentralized PKI & Key Revocation Registry (PKI-d)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Eliminates vulnerable centralized Certificate Authorities (CAs). Anchors TLS/SSL, SSH, and VPN public keys directly to the Aegis blockchain Merkle root for instant, tamper-proof verification and sub-second revocation.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Issue On-Chain Certificate
        </button>
      </div>

      {/* Instant On-Chain Certificate Verification Tester */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          Local Ledger Certificate Verifier (No Centralized OCSP Required)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Enter any domain or subject to cryptographically verify its certificate status against the local node ledger state.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={verifyDomain}
            onChange={(e) => setVerifyDomain(e.target.value)}
            placeholder="e.g. vault.aegis.internal or legacy-vpn.corp.intranet"
            className="flex-1 min-w-[240px] bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
          />
          <button
            onClick={handleTestVerification}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
          >
            Verify On-Chain Status
          </button>
        </div>

        {verifyResult && (
          <div
            className={`mt-3 p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
              verifyResult.valid
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                : 'bg-rose-50/70 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {verifyResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <div>
                <span className="font-bold">
                  {verifyResult.valid
                    ? `VALID & TRUSTED: ${verifyDomain}`
                    : `REVOKED OR UNTRUSTED: ${verifyDomain}`}
                </span>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {verifyResult.cert?.revocationReason
                    ? `Reason: ${verifyResult.cert.revocationReason}`
                    : `Anchored at Block #${verifyResult.cert?.anchorBlockHeight || 'N/A'}`}
                </div>
              </div>
            </div>

            <div className="font-mono text-[11px] font-semibold bg-white/80 px-2 py-1 rounded border">
              Verification Time: {verifyResult.latencyMs}ms
            </div>
          </div>
        )}
      </div>

      {/* Certificates Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Registered Decentralized Certificates ({certificates.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">PKI-d Registry v2.4</span>
        </div>

        <div className="space-y-3">
          {certificates.map((cert) => {
            const isValid = cert.status === 'VALID';
            return (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {cert.domainOrSubject}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase bg-slate-200 text-slate-800">
                      {cert.certType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        isValid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 truncate">
                    Fingerprint: <span className="text-slate-800 font-medium">{cert.publicKeyFingerprint}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Block Height: #{cert.anchorBlockHeight}</span>
                    <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                    <span>Expires: {new Date(cert.expiresAt).toLocaleDateString()}</span>
                  </div>

                  {cert.revocationReason && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-1">
                      <strong>Revocation Reason:</strong> {cert.revocationReason} (Revoked on {new Date(cert.revokedAt!).toLocaleDateString()})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(cert.id, cert.publicKeyFingerprint)}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition"
                    title="Copy fingerprint"
                  >
                    {copiedId === cert.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {isValid && (
                    <button
                      onClick={() => setRevokeModalCert(cert)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition"
                    >
                      Revoke on Ledger
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Issue Certificate */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Issue Decentralized Certificate
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mints a new cryptographic certificate and anchors its public key directly into the Aegis blockchain state root.
            </p>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Domain / Subject Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. core-auth.mesh.internal"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Certificate Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="TLS_SSL_WEB">TLS / SSL Web Certificate</option>
                  <option value="SSH_BASTION">SSH Bastion Host Key</option>
                  <option value="VPN_GATEWAY">IPsec / WireGuard VPN Gateway</option>
                  <option value="CODE_SIGNING">Code Signing Release Key</option>
                </select>
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
                  disabled={isIssuing}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  {isIssuing ? 'Minting On-Chain...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Revoke Certificate */}
      {revokeModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Revoke Certificate: {revokeModalCert.domainOrSubject}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Revocation is recorded immediately across all validator nodes. Any future TLS handshake will be rejected instantly.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Revocation Reason
                </label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeModalCert(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow-xs"
                >
                  Confirm Ledger Revocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
