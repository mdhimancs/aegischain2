import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Download,
  Plus,
  Coins,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  FileText,
  Share2,
  Cpu,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { ThreatIntelItem } from '../../types/blockchain';

export const ThreatIntelTab: React.FC = () => {
  const { threatIntelList, submitThreatIntel, currentDid } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Form states
  const [iocType, setIocType] = useState<ThreatIntelItem['iocType']>('MALICIOUS_IP');
  const [iocValue, setIocValue] = useState<string>('203.0.113.88');
  const [threatActor, setThreatActor] = useState<string>('Scattered Spider Telemetry');
  const [tagsString, setTagsString] = useState<string>('Brute-Force, Replay, Tor');
  const [stakeAmount, setStakeAmount] = useState<number>(50000);

  const filtered = threatIntelList.filter((item) => {
    const matchesType = selectedType === 'ALL' || item.iocType === selectedType;
    const matchesSearch =
      item.iocValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iocValue.trim() || !threatActor.trim()) return;
    const tags = tagsString.split(',').map((t) => t.trim()).filter(Boolean);
    await submitThreatIntel(iocType, iocValue.trim(), threatActor.trim(), tags, stakeAmount);
    setShowSubmitModal(false);
  };

  // Export functions
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(threatIntelList, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `aegis-threat-intel-stix-${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const handleExportYara = () => {
    const yaraRules = threatIntelList
      .filter((i) => i.iocType === 'MALWARE_SIGNATURE' || i.iocType === 'CONTRACT_EXPLOIT_HASH')
      .map((i, idx) => `rule Aegis_Threat_${idx + 1} {
    meta:
        description = "${i.threatActor}"
        staked_by = "${i.reportedByDid}"
        reputation = "${i.reputationScore}"
    strings:
        $hash = "${i.iocValue}"
    condition:
        $hash
}`)
      .join('\n\n');

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(yaraRules || '// No hash IOCs available');
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `aegis-intel-rules-${Date.now()}.yar`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Decentralized Threat Intelligence Marketplace (Polyswarm &amp; Forta Model)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Security researchers stake AEGIS tokens to register high-fidelity Indicators of Compromise (IOCs). Automated consensus rewards accurate telemetry and slashes false positives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportYara}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title="Download YARA signature format"
          >
            <Download className="w-3.5 h-3.5" />
            Export YARA
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
            title="Download STIX 2.1 JSON format"
          >
            <Download className="w-3.5 h-3.5" />
            Export STIX 2.1
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit IOC with Staking
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'MALICIOUS_IP', 'CONTRACT_EXPLOIT_HASH', 'PHISHING_DID', 'MALWARE_SIGNATURE'] as const).map(
            (t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedType === t
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {t.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IOC, malware hash, actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* IOC Threat Ledger */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            On-Chain Verified Indicators of Compromise ({filtered.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">Consensus Confidence: 99.4%</span>
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    {item.iocType.replace(/_/g, ' ')}
                  </span>
                  <span className="font-bold text-slate-900 text-xs font-mono break-all">
                    {item.iocValue}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-700 font-semibold">
                  Threat Actor: <span className="text-rose-700">{item.threatActor}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  Reported by: <span className="text-slate-700">{item.reportedByDid}</span>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 text-right shrink-0">
                <div className="text-xs font-mono font-bold text-emerald-700">
                  {item.reputationScore}% Accuracy
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Staked: <strong>{item.stakedAegis.toLocaleString()} AEGIS</strong>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Submit IOC */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Submit Threat Telemetry with Token Stake
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Stake AEGIS tokens as a guarantee of telemetry veracity. If confirmed by node consensus, you receive protocol reward distributions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">IOC Category</label>
                <select
                  value={iocType}
                  onChange={(e) => setIocType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="MALICIOUS_IP">Malicious IP Address</option>
                  <option value="CONTRACT_EXPLOIT_HASH">Contract Exploit Bytecode Hash</option>
                  <option value="PHISHING_DID">Phishing Decentralized Identity</option>
                  <option value="MALWARE_SIGNATURE">Malware Payload Hash (SHA256)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">IOC Value</label>
                <input
                  type="text"
                  required
                  value={iocValue}
                  onChange={(e) => setIocValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Threat Actor / Campaign</label>
                <input
                  type="text"
                  required
                  value={threatActor}
                  onChange={(e) => setThreatActor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Stake Amount (AEGIS Tokens)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  Confirm &amp; Stake Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
