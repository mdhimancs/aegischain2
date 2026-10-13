import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Coins,
  Skull,
  AlertTriangle,
  Flame,
  Award,
  Globe,
  Plus,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';
import { Validator } from '../../types/blockchain';

export const ValidatorsTab: React.FC = () => {
  const {
    validators,
    simulateByzantineAttack,
    delegateStake,
    distributeEpochRewards,
    networkMetrics,
  } = useBlockchain();

  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(100000);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [isSlashing, setIsSlashing] = useState<boolean>(false);

  const handleSlashing = async (
    validatorId: string,
    attackType: 'DOUBLE_SIGN' | 'DOWNTIME' | 'MALICIOUS_PROPOSAL'
  ) => {
    setIsSlashing(true);
    await simulateByzantineAttack(validatorId, attackType);
    setIsSlashing(false);
  };

  const handleDelegate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedValidator || stakeAmount <= 0) return;
    delegateStake(selectedValidator.id, stakeAmount);
    setShowStakeModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Validator Integrity, Slashing & Staking Rewards
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated slashing protocol enforcing Byzantine honesty, stake burning on malicious behavior, and uptime reward distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => distributeEpochRewards()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
          >
            <Coins className="w-3.5 h-3.5" />
            Distribute Epoch Rewards
          </button>
        </div>
      </div>

      {/* Slashing Protocol Rule Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Double-Signing Slash</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Proposing 2 conflicting blocks burns <strong className="text-rose-700">25% of stake</strong> and triggers node tombstoning.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Extended Downtime Penalty</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Missing 12+ consecutive rounds triggers <strong className="text-amber-700">5% stake penalty</strong> and temporary ejection.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Uptime Reward Incentive</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Consistent 99.9%+ availability earns <strong className="text-emerald-700">8.4% APY</strong> from protocol block subsidies.
            </div>
          </div>
        </div>
      </div>

      {/* Validator Nodes Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Active Validator Mesh ({validators.length} Nodes)</h3>
          <span className="text-xs text-slate-500 font-mono">
            Total Stake: {(networkMetrics.totalStakedAegis / 1000000).toFixed(2)}M AEGIS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validators.map((val) => {
            const isJailed = val.status === 'JAILED';
            return (
              <div
                key={val.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isJailed
                    ? 'bg-rose-50/40 border-rose-200 text-slate-600 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">{val.moniker}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        val.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {val.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mb-2">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>{val.location}</span> • <span>{val.latencyMs}ms</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                    <div>
                      <div className="text-slate-400 text-[10px]">Staked Amount</div>
                      <div className="font-bold text-slate-900 text-xs">
                        {val.stakeAmount.toLocaleString()} AEGIS
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Uptime Rating</div>
                      <div className="font-bold text-emerald-700 text-xs">{val.uptimePercent}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Rewards Earned</div>
                      <div className="text-amber-700 font-bold text-xs">+{val.rewardsEarned.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Slashes Incurred</div>
                      <div className={val.totalSlashes > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                        {val.totalSlashes}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Actions: Delegate & Byzantine Attack Simulation */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedValidator(val);
                        setShowStakeModal(true);
                      }}
                      disabled={isJailed}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-200 transition"
                    >
                      Delegate Stake
                    </button>
                  </div>

                  {/* Byzantine Slashing Trigger Simulator */}
                  {!isJailed && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSlashing(val.id, 'DOUBLE_SIGN')}
                        disabled={isSlashing}
                        className="flex-1 py-1 rounded text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition"
                        title="Simulate double-signing to trigger 25% automated stake burning"
                      >
                        Simulate Double-Sign
                      </button>
                      <button
                        onClick={() => handleSlashing(val.id, 'DOWNTIME')}
                        disabled={isSlashing}
                        className="flex-1 py-1 rounded text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition"
                        title="Simulate node downtime penalty"
                      >
                        Simulate Downtime
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stake Delegation Modal */}
      {showStakeModal && selectedValidator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delegate Stake to {selectedValidator.moniker}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Earn estimated 8.4% APY while reinforcing network cybersecurity and consensus voting power.
            </p>

            <form onSubmit={handleDelegate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Stake Amount (AEGIS Tokens)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div>• Expected Annual Yield: ~{(stakeAmount * 0.084).toLocaleString()} AEGIS</div>
                <div>• Unbonding Period: Instant via Aegis Fast-Finality</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStakeModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                >
                  Confirm Delegation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
