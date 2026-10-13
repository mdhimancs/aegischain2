import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Block,
  Transaction,
  ThreatLog,
  Validator,
  DIDDocument,
  VerifiableCredential,
  AccessRequestLog,
  AuditContract,
  AuditIssue,
  CrossChainTransfer,
  ZkProofRecord,
  GovernanceProposal,
  BackupSnapshot,
  ClearanceLevel,
  UserRole,
  RealWorldCaseStudy,
  AttackVectorSimulation,
  AttackExecutionResult,
  DecentralizedCertificate,
  ThreatIntelItem,
} from '../types/blockchain';
import {
  INITIAL_CONTRACTS,
  INITIAL_VALIDATORS,
  INITIAL_DIDS,
  INITIAL_CREDENTIALS,
  PROTECTED_RESOURCES,
  INITIAL_PROPOSALS,
  INITIAL_TRANSFERS,
  INITIAL_ZK_PROOFS,
  INITIAL_SNAPSHOTS,
  INITIAL_THREAT_LOGS,
  REAL_WORLD_CASE_STUDIES,
  ATTACK_VECTOR_SIMULATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_THREAT_INTEL,
} from '../utils/initialData';
import { sha256, computeMerkleRoot, generateRandomHex, generateDID, verifyZkProof, cyberAudio } from '../utils/crypto';

interface NetworkMetrics {
  tps: number;
  blockHeight: number;
  avgLatencyMs: number;
  energyKWhPerTx: number;
  totalEnergySavedPercent: number;
  blockedAttacksCount: number;
  networkIntegrityPercent: number;
  totalStakedAegis: number;
}

interface BlockchainContextType {
  blocks: Block[];
  transactions: Transaction[];
  threatLogs: ThreatLog[];
  validators: Validator[];
  dids: DIDDocument[];
  credentials: VerifiableCredential[];
  accessLogs: AccessRequestLog[];
  contracts: AuditContract[];
  transfers: CrossChainTransfer[];
  zkProofs: ZkProofRecord[];
  proposals: GovernanceProposal[];
  snapshots: BackupSnapshot[];
  currentDid: DIDDocument;
  networkMetrics: NetworkMetrics;
  isConsensusRunning: boolean;
  consensusPhase: 'PROPOSE' | 'PRE_VOTE' | 'PRE_COMMIT' | 'COMMIT';
  audioEnabled: boolean;

  // New Cybersecurity Features
  caseStudies: RealWorldCaseStudy[];
  attackSimulations: AttackVectorSimulation[];
  attackHistory: AttackExecutionResult[];
  certificates: DecentralizedCertificate[];
  threatIntelList: ThreatIntelItem[];
  
  // Actions
  toggleAudio: () => void;
  setConsensusRunning: (running: boolean) => void;
  switchActiveDid: (didUri: string) => void;
  triggerBlockProduce: () => Promise<void>;
  runSmartContractAudit: (contractId: string) => Promise<void>;
  applyContractPatch: (contractId: string) => Promise<void>;
  addNewContract: (title: string, filename: string, code: string) => void;
  requestAccess: (resourceId: string) => Promise<{ authorized: boolean; reason: string; latencyMs: number }>;
  issueVerifiableCredential: (
    didUri: string,
    role: UserRole,
    clearance: ClearanceLevel,
    allowedEndpoints: string[]
  ) => void;
  createDid: (role: UserRole, clearance: ClearanceLevel) => DIDDocument;
  generateAndVerifyZk: (statement: string, proofType: 'Groth16-zkSNARK' | 'PLONK' | 'STARK-Halo2') => Promise<ZkProofRecord>;
  executeBridgeTransfer: (
    source: 'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay',
    dest: 'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay',
    asset: string,
    amount: string,
    recipient: string
  ) => Promise<void>;
  simulateByzantineAttack: (validatorId: string, attackType: 'DOUBLE_SIGN' | 'DOWNTIME' | 'MALICIOUS_PROPOSAL') => Promise<void>;
  delegateStake: (validatorId: string, amount: number) => void;
  distributeEpochRewards: () => void;
  voteOnProposal: (proposalId: string, vote: 'FOR' | 'AGAINST' | 'ABSTAIN') => void;
  createProposal: (title: string, category: GovernanceProposal['category'], description: string) => void;
  createBackupSnapshot: (storageTarget: 'IPFS_ENCRYPTED' | 'ARWEAVE_COLD' | 'LOCAL_SECURE_VAULT') => Promise<BackupSnapshot>;
  restoreFromSnapshot: (snapshotId: string) => Promise<boolean>;

  // Attack range & PKI & Threat Intel actions
  executeAttackSimulation: (simulationId: string) => Promise<AttackExecutionResult>;
  issueCertificate: (domainOrSubject: string, certType: DecentralizedCertificate['certType']) => Promise<DecentralizedCertificate>;
  revokeCertificate: (certId: string, reason: string) => Promise<void>;
  submitThreatIntel: (iocType: ThreatIntelItem['iocType'], iocValue: string, threatActor: string, tags: string[], stake: number) => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      height: 184920,
      timestamp: Date.now() - 400,
      previousHash: '0x8f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
      hash: '0x71c8a3d98e3992d9c34c8913b1f8e19d70ac861ba78b209148bc8921fa0021c9',
      merkleRoot: '0x3a8f29e623190bbac8709321e908d5b4c012389145b23d90ab421a8123fa9901',
      proposer: 'Aegis-Alpha-Sentry',
      transactionsCount: 142,
      finalityMs: 382,
      status: 'COMMITTED',
      zkProofHash: '0x048f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
      energyKWh: 0.00012,
    },
    {
      height: 184919,
      timestamp: Date.now() - 1200,
      previousHash: '0x992b28febc35d10943a19823fe0128c4309bab3490aa182834bafc1092478ba190',
      hash: '0x8f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
      merkleRoot: '0x55b1902eca834190cfa9810a90b1977d402c889145b23d90ab421a8123fa9901',
      proposer: 'Nordic-Shield-Validator',
      transactionsCount: 168,
      finalityMs: 375,
      status: 'COMMITTED',
      zkProofHash: '0x04e12fa90b4c28108aef83401bcae098310baf8332145b23d90ab421a8123fa9901b',
      energyKWh: 0.00014,
    },
    {
      height: 184918,
      timestamp: Date.now() - 2000,
      previousHash: '0x44d9ab802f019b33c78f90823450912bc0a9178490aa182834bafc1092478ba190',
      hash: '0x992b28febc35d10943a19823fe0128c4309bab3490aa182834bafc1092478ba190',
      merkleRoot: '0x12fa90b4c28108aef83401bcae098310baf8332145b23d90ab421a8123fa9901',
      proposer: 'Tokyo-Nexus-Guardian',
      transactionsCount: 155,
      finalityMs: 390,
      status: 'COMMITTED',
      zkProofHash: '0x043a8f29e623190bbac8709321e908d5b4c0123891902ebaf01923fa8901bba2901a',
      energyKWh: 0.00013,
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-819',
      hash: '0x71c8a3d98e3992d9c34c8913b1f8e19d70ac861ba78b209148bc8921fa0021c9',
      type: 'ACCESS_REQUEST',
      sender: 'did:aegis:secops:9b2a7e1104fc',
      target: '/api/v2/core-vault',
      timestamp: Date.now() - 800,
      status: 'FINALIZED',
      payloadSummary: 'Zero-Knowledge Clearance Proof: Authorized for HSM Root Keys',
      gasUsed: 21500,
    },
    {
      id: 'tx-818',
      hash: '0x8f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
      type: 'CONTRACT_AUDIT',
      sender: '0x71C8A3d98E3992d9C34c8913B1F8E19d70Ac861b',
      target: 'AegisSecureVault.sol',
      timestamp: Date.now() - 1400,
      status: 'FINALIZED',
      payloadSummary: 'AST & Dynamic Taint Audit Attestation mint: 100/100 score',
      gasUsed: 45000,
    },
    {
      id: 'tx-817',
      hash: '0x3a8f29e623190bbac8709321e908d5b4c012389145b23d90ab421a8123fa9901',
      type: 'BRIDGE_TRANSFER',
      sender: '0x71C8A3d98E3992d9C34c8913B1F8E19d70Ac861b',
      target: 'Ethereum L2 Bridge',
      timestamp: Date.now() - 3200,
      status: 'FINALIZED',
      payloadSummary: 'Cross-chain lock-and-mint: 250,000 AEGIS-USD with 4/4 relayer sigs',
      gasUsed: 62000,
    },
  ]);

  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>(INITIAL_THREAT_LOGS);
  const [validators, setValidators] = useState<Validator[]>(INITIAL_VALIDATORS);
  const [dids, setDids] = useState<DIDDocument[]>(INITIAL_DIDS);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>(INITIAL_CREDENTIALS);
  const [contracts, setContracts] = useState<AuditContract[]>(INITIAL_CONTRACTS);
  const [transfers, setTransfers] = useState<CrossChainTransfer[]>(INITIAL_TRANSFERS);
  const [zkProofs, setZkProofs] = useState<ZkProofRecord[]>(INITIAL_ZK_PROOFS);
  const [proposals, setProposals] = useState<GovernanceProposal[]>(INITIAL_PROPOSALS);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(INITIAL_SNAPSHOTS);
  
  const [currentDid, setCurrentDid] = useState<DIDDocument>(INITIAL_DIDS[0]);
  const [isConsensusRunning, setConsensusRunning] = useState<boolean>(true);
  const [consensusPhase, setConsensusPhase] = useState<'PROPOSE' | 'PRE_VOTE' | 'PRE_COMMIT' | 'COMMIT'>('COMMIT');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  // New cybersecurity state collections
  const [caseStudies] = useState<RealWorldCaseStudy[]>(REAL_WORLD_CASE_STUDIES);
  const [attackSimulations] = useState<AttackVectorSimulation[]>(ATTACK_VECTOR_SIMULATIONS);
  const [attackHistory, setAttackHistory] = useState<AttackExecutionResult[]>([]);
  const [certificates, setCertificates] = useState<DecentralizedCertificate[]>(INITIAL_CERTIFICATES);
  const [threatIntelList, setThreatIntelList] = useState<ThreatIntelItem[]>(INITIAL_THREAT_INTEL);


  const [accessLogs, setAccessLogs] = useState<AccessRequestLog[]>([
    {
      id: 'acc-1',
      timestamp: Date.now() - 800,
      didUri: 'did:aegis:secops:9b2a7e1104fc',
      credentialId: 'vc-1',
      targetResource: '/api/v2/core-vault',
      requiredClearance: 'LEVEL_4_TOP_SECRET',
      result: 'AUTHORIZED',
      reason: 'Valid W3C Verifiable Credential & ZK-SNARK clearance proof verified on-chain',
      zkProofVerified: true,
      latencyMs: 12.4,
    },
    {
      id: 'acc-2',
      timestamp: Date.now() - 15000,
      didUri: 'did:aegis:unknown:rogue_node',
      credentialId: 'none',
      targetResource: '/api/v2/core-vault',
      requiredClearance: 'LEVEL_4_TOP_SECRET',
      result: 'DENIED',
      reason: 'No cryptographically signed Verifiable Credential provided. Zero-Trust Gateway blocked request.',
      zkProofVerified: false,
      latencyMs: 0.4,
    },
  ]);

  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    tps: 14250,
    blockHeight: 184920,
    avgLatencyMs: 382,
    energyKWhPerTx: 0.00012,
    totalEnergySavedPercent: 99.98,
    blockedAttacksCount: 148,
    networkIntegrityPercent: 99.998,
    totalStakedAegis: 23800000,
  });

  const toggleAudio = useCallback(() => {
    cyberAudio.enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      cyberAudio.playSuccess();
    }
  }, [audioEnabled]);

  const switchActiveDid = useCallback((didUri: string) => {
    const found = dids.find((d) => d.didUri === didUri);
    if (found) {
      setCurrentDid(found);
      cyberAudio.playSuccess();
    }
  }, [dids]);

  // Trigger low-latency block production
  const triggerBlockProduce = useCallback(async () => {
    setConsensusPhase('PROPOSE');
    await new Promise((r) => setTimeout(r, 80));
    setConsensusPhase('PRE_VOTE');
    await new Promise((r) => setTimeout(r, 90));
    setConsensusPhase('PRE_COMMIT');
    await new Promise((r) => setTimeout(r, 90));
    setConsensusPhase('COMMIT');

    const activeValidators = validators.filter((v) => v.status === 'ACTIVE');
    const proposer = activeValidators.length > 0
      ? activeValidators[Math.floor(Math.random() * activeValidators.length)].moniker
      : 'Aegis-Sentinel-01';

    const prevBlock = blocks[0];
    const newHeight = prevBlock ? prevBlock.height + 1 : 184921;

    // Generate random mock leaf hashes for transactions
    const txHashes = [
      generateRandomHex(64),
      generateRandomHex(64),
      generateRandomHex(64),
      generateRandomHex(64),
    ];
    const merkleRoot = await computeMerkleRoot(txHashes);
    const blockPayload = `${newHeight}-${prevBlock?.hash || '0x00'}-${merkleRoot}-${proposer}`;
    const newHash = await sha256(blockPayload);
    const zkProofHash = await sha256(`zk-state-root-${merkleRoot}`);

    const finalityMs = Math.floor(350 + Math.random() * 55);

    const newBlock: Block = {
      height: newHeight,
      timestamp: Date.now(),
      previousHash: prevBlock ? prevBlock.hash : '0x00',
      hash: newHash,
      merkleRoot,
      proposer,
      transactionsCount: Math.floor(120 + Math.random() * 80),
      finalityMs,
      status: 'COMMITTED',
      zkProofHash,
      energyKWh: 0.00012,
    };

    setBlocks((prev) => [newBlock, ...prev.slice(0, 19)]);
    setNetworkMetrics((prev) => ({
      ...prev,
      blockHeight: newHeight,
      avgLatencyMs: finalityMs,
      tps: Math.floor(13500 + Math.random() * 1500),
    }));

    cyberAudio.playBlockCommit();
  }, [blocks, validators]);

  // Automated block production loop
  useEffect(() => {
    if (!isConsensusRunning) return;
    const interval = setInterval(() => {
      triggerBlockProduce();
    }, 4500); // 4.5s automatic epoch tick in UI
    return () => clearInterval(interval);
  }, [isConsensusRunning, triggerBlockProduce]);

  // Run Smart Contract Audit
  const runSmartContractAudit = useCallback(async (contractId: string) => {
    const target = contracts.find((c) => c.id === contractId);
    if (!target) return;

    // Simulating AST parser & taint analyzer
    await new Promise((r) => setTimeout(r, 600));

    // Dynamic scanning
    const isVulnerable = target.code.includes('call{value:') || target.code.includes('tx.origin');
    const isFixed = target.code.includes('nonReentrant') || target.code.includes('AegisAccessGateway');

    let issues: AuditIssue[] = [];
    let score = 98;

    if (!isFixed && isVulnerable) {
      issues = [
        {
          id: 'iss-' + Math.random().toString(36).substring(7),
          title: 'Critical Reentrancy Vulnerability Detected (SWC-107)',
          severity: 'CRITICAL',
          swcId: 'SWC-107',
          line: 18,
          description: 'State variable mutation occurs after low-level external call. Vulnerable to reentrant drainage.',
          recommendation: 'Implement Checks-Effects-Interactions (CEI) and inherit OpenZeppelin ReentrancyGuard.',
          automatedFixAvailable: true,
        },
        {
          id: 'iss-' + Math.random().toString(36).substring(7),
          title: 'Phishable Authorization via tx.origin (SWC-115)',
          severity: 'HIGH',
          swcId: 'SWC-115',
          line: 26,
          description: 'Authorization relies on tx.origin instead of msg.sender, leaving contract vulnerable to phishing proxies.',
          recommendation: 'Replace tx.origin with msg.sender or EIP-712 cryptographic signatures.',
          automatedFixAvailable: true,
        },
      ];
      score = 35;
    }

    const auditHash = await sha256(`AUDIT-${contractId}-${target.code.length}-${Date.now()}`);

    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: 'AUDITED',
              issues,
              securityScore: score,
              auditHash,
              auditedAt: Date.now(),
            }
          : c
      )
    );

    // Record on-chain audit transaction
    const auditTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substring(7),
      hash: auditHash,
      type: 'CONTRACT_AUDIT',
      sender: currentDid.controller,
      target: target.filename,
      timestamp: Date.now(),
      status: 'FINALIZED',
      payloadSummary: `Security Audit Attestation: ${target.filename} scored ${score}/100 (${issues.length} issues)`,
      gasUsed: 42000,
    };
    setTransactions((prev) => [auditTx, ...prev.slice(0, 19)]);
    cyberAudio.playSuccess();
  }, [contracts, currentDid]);

  // Apply automated security patch
  const applyContractPatch = useCallback(async (contractId: string) => {
    const target = contracts.find((c) => c.id === contractId);
    if (!target || !target.patchedCode) return;

    await new Promise((r) => setTimeout(r, 400));
    const newAuditHash = await sha256(`PATCHED-${contractId}-${Date.now()}`);

    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              code: c.patchedCode,
              status: 'PATCHED',
              issues: [],
              securityScore: 100,
              auditHash: newAuditHash,
              auditedAt: Date.now(),
            }
          : c
      )
    );

    const patchTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substring(7),
      hash: newAuditHash,
      type: 'CONTRACT_AUDIT',
      sender: currentDid.controller,
      target: target.filename,
      timestamp: Date.now(),
      status: 'FINALIZED',
      payloadSummary: `Automated Security Patch Deployed & Verified: ${target.filename} scored 100/100`,
      gasUsed: 52000,
    };
    setTransactions((prev) => [patchTx, ...prev.slice(0, 19)]);
    cyberAudio.playSuccess();
  }, [contracts, currentDid]);

  // Add custom contract to auditor
  const addNewContract = useCallback((title: string, filename: string, code: string) => {
    const newContract: AuditContract = {
      id: 'contract-' + Date.now(),
      title,
      filename,
      language: filename.endsWith('.rs') ? 'Rust' : 'Solidity',
      code,
      description: 'User-provided smart contract for automated static AST and formal verification.',
      patchedCode: code,
      issues: [],
      status: 'PENDING',
    };
    setContracts((prev) => [newContract, ...prev]);
    cyberAudio.playSuccess();
  }, []);

  // Request Zero-Trust Access to Protected Resource
  const requestAccess = useCallback(
    async (resourceId: string): Promise<{ authorized: boolean; reason: string; latencyMs: number }> => {
      const resource = PROTECTED_RESOURCES.find((r) => r.id === resourceId);
      if (!resource) {
        return { authorized: false, reason: 'Resource not found', latencyMs: 0.2 };
      }

      const startTime = performance.now();

      // Find credentials belonging to current DID
      const userCredential = credentials.find(
        (c) => c.didUri === currentDid.didUri && c.status === 'VALID'
      );

      const clearanceWeights: Record<ClearanceLevel, number> = {
        LEVEL_1_PUBLIC: 1,
        LEVEL_2_CONFIDENTIAL: 2,
        LEVEL_3_SECRET: 3,
        LEVEL_4_TOP_SECRET: 4,
      };

      let authorized = false;
      let reason = '';
      let zkProofVerified = false;

      if (!userCredential) {
        authorized = false;
        reason = `Access Denied: Missing W3C Verifiable Credential for DID '${currentDid.didUri}'. Gateway rejected unauthenticated handshake.`;
      } else {
        const userLevelWeight = clearanceWeights[userCredential.claims.clearanceLevel];
        const requiredLevelWeight = clearanceWeights[resource.requiredClearance];

        if (userLevelWeight < requiredLevelWeight) {
          authorized = false;
          reason = `Access Denied: Clearance level ${userCredential.claims.clearanceLevel} is lower than required ${resource.requiredClearance}.`;
        } else if (!userCredential.claims.allowedEndpoints.includes(resource.endpoint)) {
          authorized = false;
          reason = `Access Denied: Endpoint '${resource.endpoint}' is outside the authorized credential scope list.`;
        } else {
          // Verify ZK Proof on-chain
          const zkResult = await verifyZkProof(
            userCredential.signature,
            [currentDid.didUri, resource.endpoint],
            userCredential.claims.clearanceLevel
          );
          zkProofVerified = zkResult.isValid;
          authorized = zkProofVerified;
          reason = `Access Granted: Verified W3C Credential (${userCredential.claims.role}) & Zero-Knowledge clearance proof in ${zkResult.verificationTimeMs}ms.`;
        }
      }

      const endTime = performance.now();
      const latencyMs = parseFloat((endTime - startTime).toFixed(2));

      const log: AccessRequestLog = {
        id: 'acc-' + Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        didUri: currentDid.didUri,
        credentialId: userCredential ? userCredential.id : 'NONE',
        targetResource: resource.endpoint,
        requiredClearance: resource.requiredClearance,
        result: authorized ? 'AUTHORIZED' : 'DENIED',
        reason,
        zkProofVerified,
        latencyMs,
      };

      setAccessLogs((prev) => [log, ...prev.slice(0, 29)]);

      if (!authorized) {
        // Log cyber threat attempt
        const threat: ThreatLog = {
          id: 'threat-' + Math.random().toString(36).substring(7),
          timestamp: Date.now(),
          type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          sourceIp: '10.0.4.12 (' + currentDid.role + ')',
          originDid: currentDid.didUri,
          blockedBy: 'Aegis Zero-Trust Access Gateway',
          severity: resource.requiredClearance === 'LEVEL_4_TOP_SECRET' ? 'CRITICAL' : 'HIGH',
          txHash: await sha256(`DENIED-${Date.now()}`),
          details: `Blocked attempt to access ${resource.name} (${resource.endpoint}): ${reason}`,
        };
        setThreatLogs((prev) => [threat, ...prev.slice(0, 19)]);
        setNetworkMetrics((m) => ({ ...m, blockedAttacksCount: m.blockedAttacksCount + 1 }));
        cyberAudio.playAlert();
      } else {
        cyberAudio.playSuccess();
      }

      return { authorized, reason, latencyMs };
    },
    [currentDid, credentials]
  );

  // Issue new Verifiable Credential
  const issueVerifiableCredential = useCallback(
    (didUri: string, role: UserRole, clearance: ClearanceLevel, allowedEndpoints: string[]) => {
      const newCredId = 'vc-' + Math.random().toString(36).substring(7);
      const signature = generateRandomHex(64);

      const newCred: VerifiableCredential = {
        id: newCredId,
        didUri,
        issuer: 'did:aegis:governance:root-authority',
        schema: `https://schema.aegis.network/v1/${role}Credential.json`,
        claims: {
          role,
          clearanceLevel: clearance,
          allowedEndpoints,
          maxTtlMinutes: 1440,
          department: 'Enterprise Cyber Defense Network',
        },
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        signature,
        status: 'VALID',
      };

      setCredentials((prev) => [newCred, ...prev]);
      setDids((prev) =>
        prev.map((d) => (d.didUri === didUri ? { ...d, credentialsCount: d.credentialsCount + 1 } : d))
      );
      cyberAudio.playSuccess();
    },
    []
  );

  // Create a new DID
  const createDid = useCallback((role: UserRole, clearance: ClearanceLevel): DIDDocument => {
    const { didUri, publicKeyHex, address } = generateDID(role.toLowerCase().slice(0, 6));
    const newDoc: DIDDocument = {
      id: 'did-' + Date.now(),
      didUri,
      controller: address,
      publicKeyHex,
      role,
      clearanceLevel: clearance,
      createdTimestamp: Date.now(),
      isActive: true,
      credentialsCount: 0,
    };

    setDids((prev) => [newDoc, ...prev]);
    setCurrentDid(newDoc);
    cyberAudio.playSuccess();
    return newDoc;
  }, []);

  // Generate & Verify ZK Proof
  const generateAndVerifyZk = useCallback(
    async (
      statement: string,
      proofType: 'Groth16-zkSNARK' | 'PLONK' | 'STARK-Halo2'
    ): Promise<ZkProofRecord> => {
      const proofHash = generateRandomHex(64);
      const pedersenCommitment = generateRandomHex(64);
      const publicSignals = [
        generateRandomHex(16),
        generateRandomHex(16),
        generateRandomHex(16),
      ];

      const res = await verifyZkProof(proofHash, publicSignals, pedersenCommitment);

      const record: ZkProofRecord = {
        id: 'zk-' + Math.random().toString(36).substring(7),
        proofId: `zk-proof-${Math.random().toString(16).substring(2, 8)}`,
        statement,
        proofType,
        publicSignals,
        proofHash,
        verificationTimeMs: res.verificationTimeMs,
        verified: res.isValid,
        verifiedAt: Date.now(),
        pedersenCommitment,
      };

      setZkProofs((prev) => [record, ...prev]);

      const zkTx: Transaction = {
        id: 'tx-' + Math.random().toString(36).substring(7),
        hash: proofHash,
        type: 'ZK_VERIFY',
        sender: currentDid.controller,
        target: 'AegisZkVerifierCircuit',
        timestamp: Date.now(),
        status: 'FINALIZED',
        payloadSummary: `${proofType} verified in ${res.verificationTimeMs}ms: ${statement.slice(0, 45)}...`,
        gasUsed: 18500,
      };
      setTransactions((prev) => [zkTx, ...prev.slice(0, 19)]);
      cyberAudio.playSuccess();

      return record;
    },
    [currentDid]
  );

  // Execute Cross-chain Transfer
  const executeBridgeTransfer = useCallback(
    async (
      source: 'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay',
      dest: 'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay',
      asset: string,
      amount: string,
      recipient: string
    ) => {
      const transferId = 'bridge-' + Math.random().toString(36).substring(7);
      const txHash = generateRandomHex(64);
      const stateProof = generateRandomHex(64);

      const transfer: CrossChainTransfer = {
        id: transferId,
        txHash,
        sourceChain: source,
        destChain: dest,
        asset,
        amount,
        sender: currentDid.controller,
        recipient,
        stateRootProof: stateProof,
        relayerSignaturesCount: 1,
        requiredSignatures: 4,
        status: 'LOCKED',
        timestamp: Date.now(),
      };

      setTransfers((prev) => [transfer, ...prev]);

      // Progress through relayer signatures
      setTimeout(() => {
        setTransfers((prev) =>
          prev.map((t) => (t.id === transferId ? { ...t, relayerSignaturesCount: 2, status: 'VALIDATING' } : t))
        );
      }, 700);

      setTimeout(() => {
        setTransfers((prev) =>
          prev.map((t) => (t.id === transferId ? { ...t, relayerSignaturesCount: 3, status: 'RELAYED' } : t))
        );
      }, 1400);

      setTimeout(() => {
        setTransfers((prev) =>
          prev.map((t) => (t.id === transferId ? { ...t, relayerSignaturesCount: 4, status: 'FINALIZED' } : t))
        );
        cyberAudio.playSuccess();
      }, 2100);
    },
    [currentDid]
  );

  // Simulate Byzantine Attack and Slashing
  const simulateByzantineAttack = useCallback(
    async (validatorId: string, attackType: 'DOUBLE_SIGN' | 'DOWNTIME' | 'MALICIOUS_PROPOSAL') => {
      const validator = validators.find((v) => v.id === validatorId);
      if (!validator) return;

      let slashPercent = 0.25; // 25% for double signing
      let description = '';

      if (attackType === 'DOUBLE_SIGN') {
        slashPercent = 0.25;
        description = `Validator ${validator.moniker} double-signed two conflicting blocks in round ${networkMetrics.blockHeight}. 25% of stake slashed immediately.`;
      } else if (attackType === 'DOWNTIME') {
        slashPercent = 0.05;
        description = `Validator ${validator.moniker} failed to respond during 12 consecutive BFT rounds. 5% stake penalty applied.`;
      } else {
        slashPercent = 0.5;
        description = `Validator ${validator.moniker} submitted invalid zero-knowledge state proposal. 50% stake burned and node jailed.`;
      }

      const slashedAmount = Math.floor(validator.stakeAmount * slashPercent);
      const newStake = validator.stakeAmount - slashedAmount;

      setValidators((prev) =>
        prev.map((v) =>
          v.id === validatorId
            ? {
                ...v,
                stakeAmount: newStake,
                votingPower: Math.floor(newStake / 2),
                status: attackType === 'DOWNTIME' ? 'ACTIVE' : 'JAILED',
                totalSlashes: v.totalSlashes + 1,
              }
            : v
        )
      );

      const threat: ThreatLog = {
        id: 'threat-' + Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        type: attackType === 'DOUBLE_SIGN' ? 'DOUBLE_SIGN_BYZANTINE' : 'SYBIL_NODE_ATTEMPT',
        sourceIp: validator.address.slice(0, 18),
        originDid: validator.address,
        blockedBy: 'Automated Slashing & Validator Integrity Protocol',
        severity: 'CRITICAL',
        txHash: generateRandomHex(64),
        details: `${description} Burned ${slashedAmount.toLocaleString()} AEGIS tokens.`,
      };

      setThreatLogs((prev) => [threat, ...prev]);
      setNetworkMetrics((m) => ({
        ...m,
        blockedAttacksCount: m.blockedAttacksCount + 1,
        totalStakedAegis: m.totalStakedAegis - slashedAmount,
      }));

      cyberAudio.playAlert();
    },
    [validators, networkMetrics]
  );

  // Delegate stake
  const delegateStake = useCallback((validatorId: string, amount: number) => {
    setValidators((prev) =>
      prev.map((v) =>
        v.id === validatorId
          ? {
              ...v,
              stakeAmount: v.stakeAmount + amount,
              votingPower: v.votingPower + Math.floor(amount / 2),
            }
          : v
      )
    );
    setNetworkMetrics((m) => ({ ...m, totalStakedAegis: m.totalStakedAegis + amount }));
    cyberAudio.playSuccess();
  }, []);

  // Distribute epoch rewards
  const distributeEpochRewards = useCallback(() => {
    setValidators((prev) =>
      prev.map((v) => {
        if (v.status !== 'ACTIVE') return v;
        const reward = Math.floor((v.votingPower / 1000000) * 450);
        return {
          ...v,
          rewardsEarned: v.rewardsEarned + reward,
        };
      })
    );
    cyberAudio.playSuccess();
  }, []);

  // Vote on proposal
  const voteOnProposal = useCallback((proposalId: string, vote: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const voteWeight = 50000;
        return {
          ...p,
          votesFor: vote === 'FOR' ? p.votesFor + voteWeight : p.votesFor,
          votesAgainst: vote === 'AGAINST' ? p.votesAgainst + voteWeight : p.votesAgainst,
          votesAbstain: vote === 'ABSTAIN' ? p.votesAbstain + voteWeight : p.votesAbstain,
          totalQuorum: p.totalQuorum + voteWeight,
          userVoted: vote,
        };
      })
    );
    cyberAudio.playSuccess();
  }, []);

  // Create new proposal
  const createProposal = useCallback(
    (title: string, category: GovernanceProposal['category'], description: string) => {
      const newProposal: GovernanceProposal = {
        id: 'prop-' + Date.now(),
        proposalNumber: proposals.length + 46,
        title,
        category,
        description,
        proposer: currentDid.didUri,
        votesFor: 50000,
        votesAgainst: 0,
        votesAbstain: 0,
        totalQuorum: 50000,
        status: 'ACTIVE',
        endsInBlocks: 2400,
        userVoted: 'FOR',
      };
      setProposals((prev) => [newProposal, ...prev]);
      cyberAudio.playSuccess();
    },
    [proposals.length, currentDid.didUri]
  );

  // Create state snapshot
  const createBackupSnapshot = useCallback(
    async (
      storageTarget: 'IPFS_ENCRYPTED' | 'ARWEAVE_COLD' | 'LOCAL_SECURE_VAULT'
    ): Promise<BackupSnapshot> => {
      const blockHeight = blocks[0] ? blocks[0].height : 184920;
      const stateHash = await sha256(`STATE-DUMP-${blockHeight}-${Date.now()}`);
      const checksum = `sha256:${(await sha256(stateHash + storageTarget)).slice(2)}`;

      const snapshot: BackupSnapshot = {
        id: `snap-${blockHeight}-${Math.random().toString(36).substring(7)}`,
        blockHeight,
        timestamp: Date.now(),
        stateHash,
        sizeKb: Math.floor(14000 + Math.random() * 1200),
        checksum,
        totalTransactions: 3491200 + blocks.length * 150,
        activeValidatorsCount: validators.filter((v) => v.status === 'ACTIVE').length,
        storageTarget,
      };

      setSnapshots((prev) => [snapshot, ...prev]);
      cyberAudio.playSuccess();
      return snapshot;
    },
    [blocks, validators]
  );

  // Restore from snapshot
  const restoreFromSnapshot = useCallback(async (snapshotId: string): Promise<boolean> => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return false;
    await new Promise((r) => setTimeout(r, 600));
    cyberAudio.playSuccess();
    return true;
  }, [snapshots]);

  // Execute interactive attack simulation in cyber range
  const executeAttackSimulation = useCallback(
    async (simulationId: string): Promise<AttackExecutionResult> => {
      const sim = attackSimulations.find((s) => s.id === simulationId);
      if (!sim) throw new Error('Simulation not found');

      // Trigger audio alarm
      cyberAudio.playAlert();
      await new Promise((r) => setTimeout(r, 450));

      const blockHeight = blocks[0] ? blocks[0].height : 184920;
      const proofHash = await sha256(`ATTACK-MITIGATION-${sim.id}-${blockHeight}-${Date.now()}`);
      let defenseAction = '';
      let slashedValidator: string | undefined;
      let revokedDid: string | undefined;

      if (sim.category === 'DATA_EXFILTRATION') {
        defenseAction = 'Cryptographic SHA-256 state tree audit detected altered SQL row. Merkle root mismatch discarded transaction in 0.4ms. Attacker IP blacklisted.';
        revokedDid = 'did:aegis:unknown:rogue_sql_injector';
      } else if (sim.category === 'CREDENTIAL_REPLAY') {
        defenseAction = 'State nullifier collision detected. Replayed OAuth token rejected; ZK proof constraints failed on-chain.';
      } else if (sim.category === 'BYZANTINE_CONSENSUS') {
        defenseAction = 'Dual-block proposal caught by slashing observer. Malicious validator penalized 25% stake (490,000 AEGIS) and tombstoned.';
        slashedValidator = 'Tokyo-Nexus-Guardian';
        // Auto-slash validator
        setValidators((prev) =>
          prev.map((v) =>
            v.moniker === 'Tokyo-Nexus-Guardian'
              ? {
                  ...v,
                  status: 'JAILED',
                  totalSlashes: v.totalSlashes + 1,
                  stakeAmount: Math.floor(v.stakeAmount * 0.75),
                }
              : v
          )
        );
      } else if (sim.category === 'SMART_CONTRACT_DRAIN') {
        defenseAction = 'AST Static Analyzer trapped missing CEI pattern. Mutex lock injected; zero drain permitted.';
      } else if (sim.category === 'MITM_CERT_SPOOF') {
        defenseAction = 'Rogue X.509 cert absent from decentralized PKI ledger. TLS handshake terminated before session key derivation.';
      }

      // Log threat in state
      const threat: ThreatLog = {
        id: `sim-threat-${Date.now()}`,
        timestamp: Date.now(),
        type:
          sim.category === 'DATA_EXFILTRATION'
            ? 'UNAUTHORIZED_ACCESS_ATTEMPT'
            : sim.category === 'BYZANTINE_CONSENSUS'
            ? 'DOUBLE_SIGN_BYZANTINE'
            : sim.category === 'SMART_CONTRACT_DRAIN'
            ? 'MALICIOUS_BYTECODE_DEPLOY'
            : sim.category === 'CREDENTIAL_REPLAY'
            ? 'REPLAY_ATTACK'
            : 'UNAUTHORIZED_ACCESS_ATTEMPT',
        sourceIp: '198.51.100.199 (Simulated Cyber Range)',
        originDid: revokedDid || currentDid.didUri,
        blockedBy: 'AegisChain Defensive Consensus & ZK Verifier',
        severity: sim.severity,
        txHash: proofHash,
        details: `${sim.title}: ${defenseAction}`,
      };

      setThreatLogs((prev) => [threat, ...prev]);

      const result: AttackExecutionResult = {
        simulationId: sim.id,
        timestamp: Date.now(),
        blocked: true,
        mitigationStage: 'Consensus Level 1 Finality Gate',
        proofHash,
        blockHeight,
        defenseAction,
        slashedValidator,
        revokedDid,
        incidentReceipt: `AEGIS-SOC-INCIDENT#${Date.now().toString(36).toUpperCase()}`,
      };

      setAttackHistory((prev) => [result, ...prev]);
      setNetworkMetrics((prev) => ({
        ...prev,
        blockedAttacksCount: prev.blockedAttacksCount + 1,
      }));

      cyberAudio.playSuccess();
      return result;
    },
    [attackSimulations, blocks, currentDid.didUri]
  );

  // Issue decentralized certificate
  const issueCertificate = useCallback(
    async (
      domainOrSubject: string,
      certType: DecentralizedCertificate['certType']
    ): Promise<DecentralizedCertificate> => {
      const blockHeight = blocks[0] ? blocks[0].height : 184920;
      const rawHash = await sha256(`CERT-${domainOrSubject}-${Date.now()}`);
      const fp = `SHA256:${rawHash.slice(0, 2)}:${rawHash.slice(2, 4)}:${rawHash.slice(4, 6)}:${rawHash.slice(6, 8)}:${rawHash.slice(8, 10)}:${rawHash.slice(10, 12)}:${rawHash.slice(12, 14)}:${rawHash.slice(14, 16)}`;
      const merkleProof = await sha256(`MERKLE-LEAF-${fp}-${blockHeight}`);

      const newCert: DecentralizedCertificate = {
        id: `cert-${Date.now()}`,
        domainOrSubject,
        certType,
        publicKeyFingerprint: fp,
        issuerDid: currentDid.didUri,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000 * 24 * 365,
        status: 'VALID',
        anchorBlockHeight: blockHeight,
        merkleProof,
      };

      setCertificates((prev) => [newCert, ...prev]);
      cyberAudio.playSuccess();
      return newCert;
    },
    [blocks, currentDid.didUri]
  );

  // Revoke decentralized certificate on-chain
  const revokeCertificate = useCallback(async (certId: string, reason: string): Promise<void> => {
    setCertificates((prev) =>
      prev.map((c) =>
        c.id === certId
          ? {
              ...c,
              status: 'REVOKED',
              revocationReason: reason,
              revokedAt: Date.now(),
            }
          : c
      )
    );

    const cert = certificates.find((c) => c.id === certId);
    if (cert) {
      const threat: ThreatLog = {
        id: `cert-rev-${Date.now()}`,
        timestamp: Date.now(),
        type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        sourceIp: 'Decentralized PKI Registry',
        originDid: cert.issuerDid,
        blockedBy: 'Aegis Key Revocation Engine',
        severity: 'HIGH',
        txHash: cert.merkleProof,
        details: `Revoked certificate for ${cert.domainOrSubject}. Reason: ${reason}`,
      };
      setThreatLogs((prev) => [threat, ...prev]);
    }

    cyberAudio.playAlert();
  }, [certificates]);

  // Submit Threat Intelligence IOC
  const submitThreatIntel = useCallback(
    async (
      iocType: ThreatIntelItem['iocType'],
      iocValue: string,
      threatActor: string,
      tags: string[],
      stake: number
    ): Promise<void> => {
      const newItem: ThreatIntelItem = {
        id: `ioc-${Date.now()}`,
        iocType,
        iocValue,
        threatActor,
        stakedAegis: stake,
        reputationScore: 99.1,
        reportedByDid: currentDid.didUri,
        timestamp: Date.now(),
        tags,
        status: 'VERIFIED_ON_CHAIN',
      };

      setThreatIntelList((prev) => [newItem, ...prev]);
      cyberAudio.playSuccess();
    },
    [currentDid.didUri]
  );

  return (
    <BlockchainContext.Provider
      value={{
        blocks,
        transactions,
        threatLogs,
        validators,
        dids,
        credentials,
        accessLogs,
        contracts,
        transfers,
        zkProofs,
        proposals,
        snapshots,
        currentDid,
        networkMetrics,
        isConsensusRunning,
        consensusPhase,
        audioEnabled,

        // New cybersecurity state
        caseStudies,
        attackSimulations,
        attackHistory,
        certificates,
        threatIntelList,

        toggleAudio,
        setConsensusRunning,
        switchActiveDid,
        triggerBlockProduce,
        runSmartContractAudit,
        applyContractPatch,
        addNewContract,
        requestAccess,
        issueVerifiableCredential,
        createDid,
        generateAndVerifyZk,
        executeBridgeTransfer,
        simulateByzantineAttack,
        delegateStake,
        distributeEpochRewards,
        voteOnProposal,
        createProposal,
        createBackupSnapshot,
        restoreFromSnapshot,

        // New cybersecurity actions
        executeAttackSimulation,
        issueCertificate,
        revokeCertificate,
        submitThreatIntel,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
