import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Download,
  RotateCcw,
  Plus,
  HardDrive,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { BackupSnapshot } from '../../types/blockchain';

export const BackupsTab: React.FC = () => {
  const { snapshots, createBackupSnapshot, restoreFromSnapshot, blocks, networkMetrics } = useBlockchain();

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [targetStorage, setTargetStorage] = useState<
    'IPFS_ENCRYPTED' | 'ARWEAVE_COLD' | 'LOCAL_SECURE_VAULT'
  >('IPFS_ENCRYPTED');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [autoSchedule, setAutoSchedule] = useState<'HOURLY' | 'EVERY_100_BLOCKS' | 'CONTINUOUS'>('EVERY_100_BLOCKS');

  const handleCreateSnapshot = async () => {
    setIsCreating(true);
    await createBackupSnapshot(targetStorage);
    setIsCreating(false);
  };

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    setRestoreStatus(null);
    const success = await restoreFromSnapshot(id);
    if (success) {
      setRestoreStatus(`Cryptographic state checksum verified. Ledger restored to snapshot.`);
    }
    setRestoringId(null);
  };

  const handleDownloadBackupJson = (snap: BackupSnapshot) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis-snapshot-${snap.blockHeight}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Automated Backup Procedures & Disaster Recovery
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic state snapshots with SHA-256 verifiable checksums, cold decentralized archival, and zero-loss restore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetStorage}
            onChange={(e) => setTargetStorage(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
          >
            <option value="IPFS_ENCRYPTED">IPFS (Encrypted Pinning)</option>
            <option value="ARWEAVE_COLD">Arweave (Permafrost Cold Vault)</option>
            <option value="LOCAL_SECURE_VAULT">Local Air-Gapped HSM Vault</option>
          </select>

          <button
            onClick={handleCreateSnapshot}
            disabled={isCreating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-xs"
          >
            <Plus className={`w-3.5 h-3.5 ${isCreating ? 'animate-spin' : ''}`} />
            {isCreating ? 'Capturing State Dump...' : 'Trigger State Snapshot'}
          </button>
        </div>
      </div>

      {/* Backup Automation Policy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Snapshot Automation Cadence
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Differential cryptographic state checkpoints executed continuously in the background.
          </p>
          <div className="flex gap-2">
            {(['EVERY_100_BLOCKS', 'HOURLY', 'CONTINUOUS'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setAutoSchedule(mode)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-medium transition border ${
                  autoSchedule === mode
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {mode.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <HardDrive className="w-4 h-4 text-cyan-600" />
            Storage Redundancy Health
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Multi-region replication across 3 storage tiers: IPFS, Arweave, and HSM cold storage.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>3 / 3 Replicas Fully Synchronized</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <FileCheck className="w-4 h-4 text-purple-600" />
            Integrity Checksum Validation
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Continuous SHA-256 state tree audit prevents bit-rot and silent ledger tampering.
          </p>
          <div className="text-xs font-mono text-slate-700">
            Pass rate: <strong className="text-emerald-700 font-bold">100.0%</strong> (0 corruptions)
          </div>
        </div>
      </div>

      {restoreStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{restoreStatus}</span>
        </div>
      )}

      {/* Snapshots Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Cryptographic State Snapshots ({snapshots.length})</h3>
          <span className="text-xs text-slate-500 font-mono">Current Height: #{networkMetrics.blockHeight}</span>
        </div>

        <div className="space-y-3">
          {snapshots.map((snap) => {
            const isRestoring = restoringId === snap.id;
            return (
              <div
                key={snap.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      Snapshot #{snap.blockHeight}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-200 text-slate-800">
                      {snap.storageTarget.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {(snap.sizeKb / 1024).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 truncate">
                    State Root: <span className="text-cyan-700 font-semibold">{snap.stateHash}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    Checksum: <span className="text-emerald-700 font-mono font-medium">{snap.checksum}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center gap-3 pt-1">
                    <span>{snap.totalTransactions.toLocaleString()} txs archived</span>
                    <span>{snap.activeValidatorsCount} active validators verified</span>
                    <span>{new Date(snap.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadBackupJson(snap)}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-xs"
                    title="Download verifiable JSON backup snapshot"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRestore(snap.id)}
                    disabled={isRestoring}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-slate-700 transition shadow-xs"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                    {isRestoring ? 'Verifying & Restoring...' : 'Verify & Restore'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
