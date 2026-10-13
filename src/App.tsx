/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BlockchainProvider } from './context/BlockchainContext';
import { Header, TabType } from './components/Header';
import { NetworkStatsBar } from './components/NetworkStatsBar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { CaseStudiesTab } from './components/tabs/CaseStudiesTab';
import { ThreatSimulatorTab } from './components/tabs/ThreatSimulatorTab';
import { PkiRegistryTab } from './components/tabs/PkiRegistryTab';
import { ThreatIntelTab } from './components/tabs/ThreatIntelTab';
import { AuditTab } from './components/tabs/AuditTab';
import { DidTab } from './components/tabs/DidTab';
import { ZkProofTab } from './components/tabs/ZkProofTab';
import { BridgeTab } from './components/tabs/BridgeTab';
import { ValidatorsTab } from './components/tabs/ValidatorsTab';
import { GovernanceTab } from './components/tabs/GovernanceTab';
import { BackupsTab } from './components/tabs/BackupsTab';
import { ApiDocsTab } from './components/tabs/ApiDocsTab';
import { Shield, Lock, Cpu, Globe } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <NetworkStatsBar />

        {activeTab === 'overview' && <OverviewTab onNavigateTab={setActiveTab} />}
        {activeTab === 'case-studies' && <CaseStudiesTab />}
        {activeTab === 'threat-simulator' && <ThreatSimulatorTab />}
        {activeTab === 'pki' && <PkiRegistryTab />}
        {activeTab === 'threat-intel' && <ThreatIntelTab />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'did' && <DidTab />}
        {activeTab === 'zk' && <ZkProofTab />}
        {activeTab === 'bridge' && <BridgeTab />}
        {activeTab === 'validators' && <ValidatorsTab />}
        {activeTab === 'governance' && <GovernanceTab />}
        {activeTab === 'backups' && <BackupsTab />}
        {activeTab === 'api' && <ApiDocsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">AegisChain Security Protocol</span>
            <span>•</span>
            <span className="font-mono text-slate-500">v4.2.0-bft-prod</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> Zero-Trust Gatekeeper
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" /> &lt;400ms BFT Consensus
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Globe className="w-3.5 h-3.5 text-purple-600" /> Multi-Chain Relay Synced
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Energy Footprint: 0.00012 kWh/tx (Eco-Certified)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BlockchainProvider>
      <DashboardContent />
    </BlockchainProvider>
  );
}
