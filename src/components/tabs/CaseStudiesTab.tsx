import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Search,
  Scale,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { RealWorldCaseStudy } from '../../types/blockchain';

export const CaseStudiesTab: React.FC = () => {
  const { caseStudies } = useBlockchain();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCase, setActiveCase] = useState<RealWorldCaseStudy | null>(caseStudies[0] || null);

  const categories = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'GOVERNMENT_DEFENSE', label: 'Gov & Defense' },
    { id: 'THREAT_INTEL', label: 'Threat Intel & Forensics' },
    { id: 'DECENTRALIZED_PKI', label: 'Decentralized PKI' },
    { id: 'SMART_CONTRACT_AUDIT', label: 'Automated Auditing' },
    { id: 'BUG_BOUNTY_SECURITY', label: 'Bug Bounties & Escrow' },
  ];

  const filtered = caseStudies.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cyberProblem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.blockchainSolution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Real-World Cybersecurity Blockchains & Industry Deployments
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Explore how production platforms, sovereign governments (Estonia, NATO, US DoD), and cybersecurity companies use decentralized ledgers to eliminate single points of failure, prevent log tampering, and detect zero-day malware.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>7 Verified Production Case Studies</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search websites, NATO, PKI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Projects List on Left, Deep Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((item) => {
            const isSelected = activeCase?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveCase(item)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {item.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">{item.organization}</div>
                  </div>

                  <a
                    href={item.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition"
                    title={`Visit ${item.websiteUrl}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                  {item.cyberProblem}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                  <span className="font-mono text-emerald-700 font-semibold">{item.keyBenefit}</span>
                  <span className="text-slate-400 font-medium">Click to inspect →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: In-Depth Architectural Breakdown (7 cols) */}
        {activeCase && (
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Case Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{activeCase.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeCase.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{activeCase.organization}</div>
              </div>

              <a
                href={activeCase.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* The Cybersecurity Problem vs The Blockchain Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Legacy Vulnerability
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeCase.cyberProblem}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Blockchain Defense Solution
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeCase.blockchainSolution}
                </p>
              </div>
            </div>

            {/* Production Architecture & Real-World Clients */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Consensus & Architecture:</span>
                <div className="font-mono text-slate-900 font-semibold mt-0.5">
                  {activeCase.consensusOrArchitecture}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Real-World Production Deployment:</span>
                <div className="text-slate-800 font-medium mt-0.5 leading-relaxed">
                  {activeCase.productionDeployment}
                </div>
              </div>

              {/* Notable Enterprise Clients */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Notable Organizations & Sovereign Clients:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeCase.realWorldClients.map((client, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specific Attack Vectors Prevented */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Specific Cyber Attack Vectors Prevented:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCase.attackVectorsPrevented.map((atk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{atk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Takeaway Callout */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-start gap-3 shadow-sm">
              <Scale className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-300">Why Blockchain for Cybersecurity?</div>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Unlike traditional firewalls that rely on human trust and centralized server perimeters, blockchain transforms cybersecurity into <strong>cryptographic mathematical certainty</strong>: logs cannot be altered even by root admins, keys cannot be forged by compromised CAs, and zero-day threat consensus happens globally in sub-seconds.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
