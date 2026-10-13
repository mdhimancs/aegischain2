import React, { useState } from 'react';
import {
  Vote,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Plus,
  Clock,
  Shield,
  FileText,
  Users,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { GovernanceProposal } from '../../types/blockchain';

export const GovernanceTab: React.FC = () => {
  const { proposals, voteOnProposal, createProposal, currentDid } = useBlockchain();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<GovernanceProposal['category']>('SECURITY_PATCH');
  const [newDescription, setNewDescription] = useState<string>('');

  const handleVote = (proposalId: string, vote: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    voteOnProposal(proposalId, vote);
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    createProposal(newTitle, newCategory, newDescription);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Governance Dashboard & Protocol Upgrades DAO
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stakeholder voting for consensus parameters, zero-knowledge verification upgrades, and automated slashing thresholds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Create AIP Proposal
        </button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
          const forPercent = totalVotes > 0 ? ((proposal.votesFor / totalVotes) * 100).toFixed(1) : '0';
          const againstPercent = totalVotes > 0 ? ((proposal.votesAgainst / totalVotes) * 100).toFixed(1) : '0';

          return (
            <div
              key={proposal.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
                    #{proposal.proposalNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${
                      proposal.category === 'SECURITY_PATCH'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : proposal.category === 'CONSENSUS_PARAM'
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {proposal.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${
                      proposal.status === 'ACTIVE'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : proposal.status === 'PASSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {proposal.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {proposal.status === 'ACTIVE'
                    ? `Ends in ~${proposal.endsInBlocks} blocks`
                    : 'Voting Concluded'}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{proposal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{proposal.description}</p>
                <div className="text-[11px] font-mono text-slate-500 mt-2">
                  Proposer: <span className="text-slate-800 font-medium">{proposal.proposer}</span>
                </div>
              </div>

              {/* Voting Progress Bars */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-700 font-bold">FOR: {forPercent}% ({proposal.votesFor.toLocaleString()} AEGIS)</span>
                  <span className="text-rose-700 font-bold">AGAINST: {againstPercent}% ({proposal.votesAgainst.toLocaleString()} AEGIS)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${forPercent}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${againstPercent}%` }}
                  />
                </div>
              </div>

              {/* Voting Actions */}
              {proposal.status === 'ACTIVE' && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">
                    Cast Stakeholder Vote (using active DID):
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(proposal.id, 'FOR')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        proposal.userVoted === 'FOR'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Vote FOR
                    </button>

                    <button
                      onClick={() => handleVote(proposal.id, 'AGAINST')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        proposal.userVoted === 'AGAINST'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Vote AGAINST
                    </button>

                    <button
                      onClick={() => handleVote(proposal.id, 'ABSTAIN')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        proposal.userVoted === 'ABSTAIN'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      Abstain
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Create Proposal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Aegis Improvement Proposal (AIP)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit a formal protocol modification for decentralized stakeholder quorum vote.
            </p>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIP-49: Upgrade Slashing Tolerance for L2 Bridge"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="SECURITY_PATCH">Security Patch</option>
                  <option value="CONSENSUS_PARAM">Consensus Parameter Tuning</option>
                  <option value="SLASHING_RULE">Slashing Rule Amendment</option>
                  <option value="BRIDGE_CONNECTOR">Bridge Connector Expansion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Proposal Rationale & Specification</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain security implications, technical design, and expected parameters..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  Broadcast Proposal to DAO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
