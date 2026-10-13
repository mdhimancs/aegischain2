export interface Block {
  height: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  merkleRoot: string;
  proposer: string;
  transactionsCount: number;
  finalityMs: number;
  status: 'COMMITTED' | 'PRE_COMMITTING' | 'PRE_VOTING';
  zkProofHash: string;
  energyKWh: number;
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'ACCESS_REQUEST' | 'CONTRACT_AUDIT' | 'ZK_VERIFY' | 'BRIDGE_TRANSFER' | 'SLASH_EVENT' | 'GOV_VOTE';
  sender: string;
  target: string;
  timestamp: number;
  status: 'FINALIZED' | 'VALIDATING' | 'REJECTED';
  payloadSummary: string;
  gasUsed: number;
}

export interface ThreatLog {
  id: string;
  timestamp: number;
  type: 'UNAUTHORIZED_ACCESS_ATTEMPT' | 'DOUBLE_SIGN_BYZANTINE' | 'MALICIOUS_BYTECODE_DEPLOY' | 'REPLAY_ATTACK' | 'SYBIL_NODE_ATTEMPT';
  sourceIp: string;
  originDid: string;
  blockedBy: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  txHash: string;
  details: string;
}

export interface Validator {
  id: string;
  moniker: string;
  address: string;
  votingPower: number;
  stakeAmount: number; // in AEGIS tokens
  uptimePercent: number;
  latencyMs: number;
  location: string;
  status: 'ACTIVE' | 'JAILED' | 'SLASHED';
  totalSlashes: number;
  rewardsEarned: number;
  lastBlockProposed: number;
}

export type ClearanceLevel = 'LEVEL_1_PUBLIC' | 'LEVEL_2_CONFIDENTIAL' | 'LEVEL_3_SECRET' | 'LEVEL_4_TOP_SECRET';
export type UserRole = 'SOC_ANALYST' | 'SECOPS_ENGINEER' | 'TIER3_AUDITOR' | 'INFRA_GATEWAY' | 'GUEST_ACTOR';

export interface DIDDocument {
  id: string;
  didUri: string;
  controller: string;
  publicKeyHex: string;
  role: UserRole;
  clearanceLevel: ClearanceLevel;
  createdTimestamp: number;
  isActive: boolean;
  credentialsCount: number;
}

export interface VerifiableCredential {
  id: string;
  didUri: string;
  issuer: string;
  schema: string;
  claims: {
    role: UserRole;
    clearanceLevel: ClearanceLevel;
    allowedEndpoints: string[];
    maxTtlMinutes: number;
    department: string;
  };
  issuedAt: string;
  expiresAt: string;
  signature: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
}

export interface AccessRequestLog {
  id: string;
  timestamp: number;
  didUri: string;
  credentialId: string;
  targetResource: string;
  requiredClearance: ClearanceLevel;
  result: 'AUTHORIZED' | 'DENIED';
  reason: string;
  zkProofVerified: boolean;
  latencyMs: number;
}

export interface AuditIssue {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  swcId: string;
  line: number;
  description: string;
  recommendation: string;
  automatedFixAvailable: boolean;
}

export interface AuditContract {
  id: string;
  title: string;
  filename: string;
  language: 'Solidity' | 'Rust';
  code: string;
  description: string;
  patchedCode: string;
  issues: AuditIssue[];
  status: 'PENDING' | 'AUDITED' | 'PATCHED';
  auditHash?: string;
  securityScore?: number;
  auditedAt?: number;
}

export interface CrossChainTransfer {
  id: string;
  txHash: string;
  sourceChain: 'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay';
  destChain: 'AegisChain L1' | 'Ethereum L2' | 'Solana' | 'Cosmos IBC' | 'Polkadot Relay';
  asset: string;
  amount: string;
  sender: string;
  recipient: string;
  stateRootProof: string;
  relayerSignaturesCount: number;
  requiredSignatures: number;
  status: 'LOCKED' | 'VALIDATING' | 'RELAYED' | 'FINALIZED';
  timestamp: number;
}

export interface ZkProofRecord {
  id: string;
  proofId: string;
  statement: string;
  proofType: 'Groth16-zkSNARK' | 'PLONK' | 'STARK-Halo2';
  publicSignals: string[];
  proofHash: string;
  verificationTimeMs: number;
  verified: boolean;
  verifiedAt: number;
  pedersenCommitment: string;
}

export interface GovernanceProposal {
  id: string;
  proposalNumber: number;
  title: string;
  category: 'SECURITY_PATCH' | 'CONSENSUS_PARAM' | 'SLASHING_RULE' | 'BRIDGE_CONNECTOR';
  description: string;
  proposer: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalQuorum: number;
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
  endsInBlocks: number;
  userVoted?: 'FOR' | 'AGAINST' | 'ABSTAIN';
}

export interface BackupSnapshot {
  id: string;
  blockHeight: number;
  timestamp: number;
  stateHash: string;
  sizeKb: number;
  checksum: string;
  totalTransactions: number;
  activeValidatorsCount: number;
  storageTarget: 'IPFS_ENCRYPTED' | 'ARWEAVE_COLD' | 'LOCAL_SECURE_VAULT';
}

export interface RealWorldCaseStudy {
  id: string;
  name: string;
  category: 'GOVERNMENT_DEFENSE' | 'THREAT_INTEL' | 'DECENTRALIZED_PKI' | 'SMART_CONTRACT_AUDIT' | 'BUG_BOUNTY_SECURITY';
  organization: string;
  websiteUrl: string;
  cyberProblem: string;
  blockchainSolution: string;
  productionDeployment: string;
  realWorldClients: string[];
  consensusOrArchitecture: string;
  keyBenefit: string;
  attackVectorsPrevented: string[];
}

export interface AttackVectorSimulation {
  id: string;
  title: string;
  category: 'DATA_EXFILTRATION' | 'CREDENTIAL_REPLAY' | 'BYZANTINE_CONSENSUS' | 'SMART_CONTRACT_DRAIN' | 'MITM_CERT_SPOOF';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  payloadSummary: string;
  targetService: string;
  legacyVulnerability: string;
  blockchainDefenseMechanism: string;
}

export interface AttackExecutionResult {
  simulationId: string;
  timestamp: number;
  blocked: boolean;
  mitigationStage: string;
  proofHash: string;
  blockHeight: number;
  defenseAction: string;
  slashedValidator?: string;
  revokedDid?: string;
  incidentReceipt: string;
}

export interface DecentralizedCertificate {
  id: string;
  domainOrSubject: string;
  certType: 'TLS_SSL_WEB' | 'SSH_BASTION' | 'VPN_GATEWAY' | 'CODE_SIGNING';
  publicKeyFingerprint: string;
  issuerDid: string;
  issuedAt: number;
  expiresAt: number;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  anchorBlockHeight: number;
  merkleProof: string;
  revocationReason?: string;
  revokedAt?: number;
}

export interface ThreatIntelItem {
  id: string;
  iocType: 'MALICIOUS_IP' | 'CONTRACT_EXPLOIT_HASH' | 'MALWARE_SIGNATURE' | 'PHISHING_DID';
  iocValue: string;
  threatActor: string;
  stakedAegis: number;
  reputationScore: number;
  reportedByDid: string;
  timestamp: number;
  tags: string[];
  status: 'VERIFIED_ON_CHAIN' | 'DISPUTED' | 'INVESTIGATING';
}

