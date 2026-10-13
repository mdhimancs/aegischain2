import {
  AuditContract,
  Validator,
  DIDDocument,
  VerifiableCredential,
  GovernanceProposal,
  CrossChainTransfer,
  ZkProofRecord,
  BackupSnapshot,
  ThreatLog,
  RealWorldCaseStudy,
  AttackVectorSimulation,
  DecentralizedCertificate,
  ThreatIntelItem,
} from '../types/blockchain';

export const INITIAL_CONTRACTS: AuditContract[] = [
  {
    id: 'contract-1',
    title: 'DeFi Liquidity Vault & Flash Pool',
    filename: 'AegisVault_Exploit.sol',
    language: 'Solidity',
    description: 'Vulnerable token vault susceptible to reentrancy attacks and flash loan state manipulation.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // SWC-107: Reentrancy Vulnerability - State updated AFTER external call!
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient funds");

        // Vulnerable external call before balance reduction
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        balances[msg.sender] -= amount;
    }

    // SWC-115: Use of tx.origin for critical authorization
    function emergencyDrain() external {
        require(tx.origin == owner, "Unauthorized caller");
        payable(owner).transfer(address(this).balance);
    }
}`,
    patchedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AegisSecureVault is ReentrancyGuard {
    mapping(address => uint256) public balances;
    address public immutable owner;

    event Withdrawn(address indexed user, uint256 amount);
    event Deposited(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Patched: nonReentrant modifier and Checks-Effects-Interactions pattern
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // 1. Effects: update balance before external transfer
        balances[msg.sender] -= amount;

        // 2. Interaction: external call guarded
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // Patched: Strict msg.sender verification instead of tx.origin
    function emergencyDrain() external {
        require(msg.sender == owner, "Unauthorized caller");
        payable(owner).transfer(address(this).balance);
    }
}`,
    issues: [
      {
        id: 'iss-1',
        title: 'Reentrancy via Low-Level External Call',
        severity: 'CRITICAL',
        swcId: 'SWC-107',
        line: 20,
        description: 'State variable `balances[msg.sender]` is decremented after external execution. An adversary contract can reenter `withdraw()` repeatedly draining all protocol reserves.',
        recommendation: 'Adhere to the Checks-Effects-Interactions (CEI) design pattern or implement OpenZeppelin ReentrancyGuard nonReentrant modifier.',
        automatedFixAvailable: true,
      },
      {
        id: 'iss-2',
        title: 'Authorization via Phishable tx.origin',
        severity: 'HIGH',
        swcId: 'SWC-115',
        line: 27,
        description: 'Checking `tx.origin == owner` allows malicious intermediary contracts to trick the contract owner into authorizing unexpected fund drains.',
        recommendation: 'Replace `tx.origin` with `msg.sender` or cryptographic signature authorization via EIP-712.',
        automatedFixAvailable: true,
      },
    ],
    status: 'AUDITED',
    auditHash: '0x8f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
    securityScore: 32,
    auditedAt: Date.now() - 3600000,
  },
  {
    id: 'contract-2',
    title: 'Cross-Chain Relay Token Bridge',
    filename: 'CrossChainBridge_Relay.sol',
    language: 'Solidity',
    description: 'Bridge contract handling lock-and-mint cross-chain asset transfers with threshold signatures.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenBridge {
    mapping(bytes32 => bool) public processedNonces;
    address public relayer;

    // SWC-121: Missing Signature Replay Protection & Unchecked return
    function unlockTokens(
        address to,
        uint256 amount,
        bytes32 messageHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        address signer = ecrecover(messageHash, v, r, s);
        require(signer == relayer, "Invalid relayer");

        // Nonce is NOT checked or recorded, enabling infinite replay attacks!
        payable(to).call{value: amount}("");
    }
}`,
    patchedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AegisSecureTokenBridge {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executedTransfers;
    address public immutable relayer;

    event TokensUnlocked(address indexed to, uint256 amount, bytes32 indexed transferHash);

    constructor(address _relayer) {
        relayer = _relayer;
    }

    function unlockTokens(
        address to,
        uint256 amount,
        uint256 nonce,
        uint256 chainId,
        bytes memory signature
    ) external {
        bytes32 transferHash = keccak256(
            abi.encodePacked(to, amount, nonce, chainId, address(this))
        );
        
        // Replay defense
        require(!executedTransfers[transferHash], "Transfer already executed");
        executedTransfers[transferHash] = true;

        bytes32 ethSignedHash = ECDSA.toEthSignedMessageHash(transferHash);
        address signer = ECDSA.recover(ethSignedHash, signature);
        require(signer == relayer, "Invalid relayer signature");

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Token transfer failed");

        emit TokensUnlocked(to, amount, transferHash);
    }
}`,
    issues: [
      {
        id: 'iss-3',
        title: 'Replay Attack in Cross-Chain Validator Signature',
        severity: 'CRITICAL',
        swcId: 'SWC-121',
        line: 18,
        description: 'Message hash does not bind to chain ID, contract address, or an incremental nonce, and `processedNonces` is never written. The same signed payload can be replayed repeatedly.',
        recommendation: 'Bind signature to domain separator (EIP-712) including chainId, nonce, and mark hash as processed prior to value transfer.',
        automatedFixAvailable: true,
      },
      {
        id: 'iss-4',
        title: 'Unchecked Low-Level Call Return Value',
        severity: 'MEDIUM',
        swcId: 'SWC-104',
        line: 20,
        description: 'The return value of `.call{value: amount}("")` is discarded. If transfer fails silently, state inconsistency occurs.',
        recommendation: 'Check the boolean return value of call or use OpenZeppelin Address.sendValue.',
        automatedFixAvailable: true,
      },
    ],
    status: 'AUDITED',
    auditHash: '0x4e29b1fa0c653d9e88aa0b31e089d71c356f912e7a03425f1908ab9e2233c4f7',
    securityScore: 41,
    auditedAt: Date.now() - 7200000,
  },
  {
    id: 'contract-3',
    title: 'Aegis Zero-Trust Granular Access Controller',
    filename: 'AegisAccessGateway.sol',
    language: 'Solidity',
    description: 'On-chain zero-trust gatekeeper verifying W3C DIDs and ZK-SNARK clearance proofs before emitting access authorizations.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZkProofVerifier {
    function verifyProof(bytes calldata proof, uint256[] calldata signals) external view returns (bool);
}

contract AegisAccessGateway {
    IZkProofVerifier public immutable zkVerifier;
    mapping(bytes32 => bool) public usedNullifiers;
    
    event AccessGranted(bytes32 indexed identityCommitment, bytes32 indexed resourceId);

    constructor(address _zkVerifier) {
        zkVerifier = IZkProofVerifier(_zkVerifier);
    }

    function verifyAndGrantAccess(
        bytes32 nullifierHash,
        bytes32 resourceId,
        bytes calldata proof,
        uint256[] calldata signals
    ) external returns (bool) {
        require(!usedNullifiers[nullifierHash], "Nullifier already consumed");
        require(zkVerifier.verifyProof(proof, signals), "ZK proof verification failed");
        
        usedNullifiers[nullifierHash] = true;
        emit AccessGranted(nullifierHash, resourceId);
        return true;
    }
}`,
    patchedCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Certified Clean & Formally Verified
contract AegisAccessGateway {
    // Zero vulnerabilities detected. Enterprise Grade.
}`,
    issues: [],
    status: 'AUDITED',
    auditHash: '0x1a89cd34be760081df90432f8108c9012a9bc4512e0934fba012e87c0932de01',
    securityScore: 99,
    auditedAt: Date.now() - 10800000,
  },
];

export const INITIAL_VALIDATORS: Validator[] = [
  {
    id: 'val-1',
    moniker: 'Aegis-Alpha-Sentry',
    address: '0x71C8A3d98E3992d9C34c8913B1F8E19d70Ac861b',
    votingPower: 2850000,
    stakeAmount: 5700000,
    uptimePercent: 99.99,
    latencyMs: 14,
    location: 'Zurich, Switzerland',
    status: 'ACTIVE',
    totalSlashes: 0,
    rewardsEarned: 41250,
    lastBlockProposed: 184920,
  },
  {
    id: 'val-2',
    moniker: 'Nordic-Shield-Validator',
    address: '0x3A8F29e623190bBaC8709321E908D5b4C0123891',
    votingPower: 2410000,
    stakeAmount: 4820000,
    uptimePercent: 99.98,
    latencyMs: 18,
    location: 'Stockholm, Sweden',
    status: 'ACTIVE',
    totalSlashes: 0,
    rewardsEarned: 38900,
    lastBlockProposed: 184919,
  },
  {
    id: 'val-3',
    moniker: 'Tokyo-Nexus-Guardian',
    address: '0x992B28fEbC35d10943A19823fE0128C4309baB34',
    votingPower: 2150000,
    stakeAmount: 4300000,
    uptimePercent: 99.95,
    latencyMs: 24,
    location: 'Tokyo, Japan',
    status: 'ACTIVE',
    totalSlashes: 0,
    rewardsEarned: 33100,
    lastBlockProposed: 184918,
  },
  {
    id: 'val-4',
    moniker: 'Singapore-Fortress-04',
    address: '0x44D9aB802f019B33c78F90823450912bc0A91784',
    votingPower: 1890000,
    stakeAmount: 3780000,
    uptimePercent: 99.94,
    latencyMs: 21,
    location: 'Singapore',
    status: 'ACTIVE',
    totalSlashes: 0,
    rewardsEarned: 29400,
    lastBlockProposed: 184917,
  },
  {
    id: 'val-5',
    moniker: 'Virginia-East-BFT-Node',
    address: '0x55B1902Eca834190cFa9810a90B1977d402C8891',
    votingPower: 1620000,
    stakeAmount: 3240000,
    uptimePercent: 99.91,
    latencyMs: 28,
    location: 'N. Virginia, USA',
    status: 'ACTIVE',
    totalSlashes: 0,
    rewardsEarned: 24800,
    lastBlockProposed: 184916,
  },
  {
    id: 'val-6',
    moniker: 'Frankfurt-CryptSecure',
    address: '0x12Fa90B4c28108aeF83401bcaE098310baF83321',
    votingPower: 980000,
    stakeAmount: 1960000,
    uptimePercent: 97.40,
    latencyMs: 65,
    location: 'Frankfurt, Germany',
    status: 'ACTIVE',
    totalSlashes: 1,
    rewardsEarned: 12200,
    lastBlockProposed: 184890,
  },
];

export const INITIAL_DIDS: DIDDocument[] = [
  {
    id: 'did-1',
    didUri: 'did:aegis:secops:9b2a7e1104fc',
    controller: '0x71C8A3d98E3992d9C34c8913B1F8E19d70Ac861b',
    publicKeyHex: '0x048f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211a78b',
    role: 'TIER3_AUDITOR',
    clearanceLevel: 'LEVEL_4_TOP_SECRET',
    createdTimestamp: Date.now() - 86400000 * 14,
    isActive: true,
    credentialsCount: 3,
  },
  {
    id: 'did-2',
    didUri: 'did:aegis:secops:4c8109d77e20',
    controller: '0x3A8F29e623190bBaC8709321E908D5b4C0123891',
    publicKeyHex: '0x04e12fa90b4c28108aef83401bcae098310baf8332145b23d90ab421a8123fa9901b',
    role: 'SECOPS_ENGINEER',
    clearanceLevel: 'LEVEL_3_SECRET',
    createdTimestamp: Date.now() - 86400000 * 8,
    isActive: true,
    credentialsCount: 2,
  },
  {
    id: 'did-3',
    didUri: 'did:aegis:secops:12fb0a88319e',
    controller: '0x992B28fEbC35d10943A19823fE0128C4309baB34',
    publicKeyHex: '0x043a8f29e623190bbac8709321e908d5b4c0123891902ebaf01923fa8901bba2901a',
    role: 'SOC_ANALYST',
    clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
    createdTimestamp: Date.now() - 86400000 * 4,
    isActive: true,
    credentialsCount: 1,
  },
  {
    id: 'did-4',
    didUri: 'did:aegis:infra:gw0912ab5501',
    controller: '0x44D9aB802f019B33c78F90823450912bc0A91784',
    publicKeyHex: '0x04992b28febc35d10943a19823fe0128c4309bab3490aa182834bafc1092478ba190',
    role: 'INFRA_GATEWAY',
    clearanceLevel: 'LEVEL_4_TOP_SECRET',
    createdTimestamp: Date.now() - 86400000 * 30,
    isActive: true,
    credentialsCount: 4,
  },
];

export const INITIAL_CREDENTIALS: VerifiableCredential[] = [
  {
    id: 'vc-1',
    didUri: 'did:aegis:secops:9b2a7e1104fc',
    issuer: 'did:aegis:governance:root-authority',
    schema: 'https://schema.aegis.network/v1/SecOpsTopSecretCredential.json',
    claims: {
      role: 'TIER3_AUDITOR',
      clearanceLevel: 'LEVEL_4_TOP_SECRET',
      allowedEndpoints: ['/api/v2/core-vault', '/api/v2/scada-bridge', '/api/v2/financial-db', '/api/v2/k8s-secrets'],
      maxTtlMinutes: 1440,
      department: 'Global Security Operations Command',
    },
    issuedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    signature: '0x9b2a7e1104fc4e29b1fa0c653d9e88aa0b31e089d71c356f912e7a03425f1908ab9e2233c4f7',
    status: 'VALID',
  },
  {
    id: 'vc-2',
    didUri: 'did:aegis:secops:4c8109d77e20',
    issuer: 'did:aegis:governance:root-authority',
    schema: 'https://schema.aegis.network/v1/SecOpsSecretCredential.json',
    claims: {
      role: 'SECOPS_ENGINEER',
      clearanceLevel: 'LEVEL_3_SECRET',
      allowedEndpoints: ['/api/v2/financial-db', '/api/v2/k8s-secrets'],
      maxTtlMinutes: 480,
      department: 'Infrastructure Security & Incident Response',
    },
    issuedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    signature: '0x4c8109d77e208f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
    status: 'VALID',
  },
  {
    id: 'vc-3',
    didUri: 'did:aegis:secops:12fb0a88319e',
    issuer: 'did:aegis:governance:root-authority',
    schema: 'https://schema.aegis.network/v1/SocAnalystConfidential.json',
    claims: {
      role: 'SOC_ANALYST',
      clearanceLevel: 'LEVEL_2_CONFIDENTIAL',
      allowedEndpoints: ['/api/v2/telemetry-stream', '/api/v2/audit-logs'],
      maxTtlMinutes: 240,
      department: 'SOC Operations Center',
    },
    issuedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    signature: '0x12fb0a88319e4e29b1fa0c653d9e88aa0b31e089d71c356f912e7a03425f1908ab9e2233c4f7',
    status: 'VALID',
  },
];

export const PROTECTED_RESOURCES = [
  {
    id: 'res-core-vault',
    endpoint: '/api/v2/core-vault',
    name: 'Hardware Security Module (HSM) Root Keys',
    requiredClearance: 'LEVEL_4_TOP_SECRET' as const,
    description: 'Master quantum-resistant cryptographic seed storage and validator slashing authority keys.',
    legacySystem: 'Legacy IBM Enterprise HSM v9.2',
  },
  {
    id: 'res-scada',
    endpoint: '/api/v2/scada-bridge',
    name: 'Critical SCADA Power Grid Interconnect',
    requiredClearance: 'LEVEL_4_TOP_SECRET' as const,
    description: 'Modbus/DNP3 industrial automated telemetry and physical relay control actuators.',
    legacySystem: 'Legacy Siemens S7 PLC Network via Aegis Bridge',
  },
  {
    id: 'res-financial-db',
    endpoint: '/api/v2/financial-db',
    name: 'Interbank Settlement Ledger & Cold Reserves',
    requiredClearance: 'LEVEL_3_SECRET' as const,
    description: 'Decentralized multi-sig custodial accounts and SWIFT ISO 20022 messaging bridge.',
    legacySystem: 'Legacy Oracle Financial Cloud DB 19c',
  },
  {
    id: 'res-k8s',
    endpoint: '/api/v2/k8s-secrets',
    name: 'Zero-Trust Kubernetes Cluster Orchestrator',
    requiredClearance: 'LEVEL_3_SECRET' as const,
    description: 'Production cluster service accounts, TLS mutual authentication certificates, and container secrets.',
    legacySystem: 'Legacy Enterprise OpenShift Mesh',
  },
  {
    id: 'res-audit-logs',
    endpoint: '/api/v2/audit-logs',
    name: 'Immutable SIEM Event & Threat Telemetry Feed',
    requiredClearance: 'LEVEL_2_CONFIDENTIAL' as const,
    description: 'Real-time cryptographic forensic audit logs from distributed edge sentinels.',
    legacySystem: 'Splunk Enterprise SIEM Connector',
  },
];

export const INITIAL_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'prop-48',
    proposalNumber: 48,
    title: 'AIP-48: Implement Halo2-PLONK ZK Circuit for 180ms Block Finality',
    category: 'CONSENSUS_PARAM',
    description: 'Replaces Groth16 trusted setup with universal zero-knowledge polynomial commitments (Halo2), reducing verification overhead from 4.2ms to 0.8ms and enabling sub-200ms sub-second transaction finality on Aegis-BFT consensus.',
    proposer: 'did:aegis:secops:9b2a7e1104fc',
    votesFor: 8420000,
    votesAgainst: 320000,
    votesAbstain: 110000,
    totalQuorum: 8850000,
    status: 'ACTIVE',
    endsInBlocks: 1420,
    userVoted: 'FOR',
  },
  {
    id: 'prop-47',
    proposalNumber: 47,
    title: 'AIP-47: Automated Slashing Severity Increase for Double-Signing Relayers',
    category: 'SLASHING_RULE',
    description: 'Increases the automated slashing penalty for cross-chain state relayer double-signing from 20% to 35% of locked validator stake, and enforces an automatic 30-day jail period to safeguard cross-ledger integrity.',
    proposer: 'did:aegis:secops:4c8109d77e20',
    votesFor: 9150000,
    votesAgainst: 180000,
    votesAbstain: 50000,
    totalQuorum: 9380000,
    status: 'PASSED',
    endsInBlocks: 0,
  },
  {
    id: 'prop-46',
    proposalNumber: 46,
    title: 'AIP-46: Enterprise Zero-Trust SCADA Legacy Adapter Integration',
    category: 'SECURITY_PATCH',
    description: 'Standardizes the Modbus-over-TLS connector format for industrial operational technology (OT) networks, requiring W3C Verifiable Credentials for all remote maintenance sessions.',
    proposer: 'did:aegis:infra:gw0912ab5501',
    votesFor: 7890000,
    votesAgainst: 890000,
    votesAbstain: 240000,
    totalQuorum: 9020000,
    status: 'EXECUTED',
    endsInBlocks: 0,
  },
];

export const INITIAL_TRANSFERS: CrossChainTransfer[] = [
  {
    id: 'bridge-101',
    txHash: '0x99a2c8108aeF83401bcaE098310baF8332145b23d90ab421a8123fa9901b0981',
    sourceChain: 'AegisChain L1',
    destChain: 'Ethereum L2',
    asset: 'AEGIS-USD (Security Escrow)',
    amount: '250,000.00',
    sender: '0x71C8A3d98E3992d9C34c8913B1F8E19d70Ac861b',
    recipient: '0x32A44B9E0981cCa40182E098d70A110294bfa293',
    stateRootProof: '0x5b33108aeF83401bcaE098310baF8332145b23d90ab421a8123fa9901bba2901',
    relayerSignaturesCount: 4,
    requiredSignatures: 4,
    status: 'FINALIZED',
    timestamp: Date.now() - 120000,
  },
  {
    id: 'bridge-102',
    txHash: '0x12fa90b4c28108aef83401bcae098310baf8332145b23d90ab421a8123fa9901',
    sourceChain: 'Cosmos IBC',
    destChain: 'AegisChain L1',
    asset: 'IBC Security Telemetry Oracle',
    amount: '1,500.00',
    sender: 'cosmos18aef83401bcae098310baf8332145b23d90a',
    recipient: '0x992B28fEbC35d10943A19823fE0128C4309baB34',
    stateRootProof: '0x77fa28108aef83401bcae098310baf8332145b23d90ab421a8123fa9901bba28',
    relayerSignaturesCount: 4,
    requiredSignatures: 4,
    status: 'FINALIZED',
    timestamp: Date.now() - 340000,
  },
  {
    id: 'bridge-103',
    txHash: '0x88bb208108aef83401bcae098310baf8332145b23d90ab421a8123fa9901112a',
    sourceChain: 'AegisChain L1',
    destChain: 'Solana',
    asset: 'Zero-Knowledge Access Voucher',
    amount: '50,000.00',
    sender: '0x3A8F29e623190bBaC8709321E908D5b4C0123891',
    recipient: 'So11111111111111111111111111111111111111112',
    stateRootProof: '0x3344108aef83401bcae098310baf8332145b23d90ab421a8123fa9901bba2901',
    relayerSignaturesCount: 3,
    requiredSignatures: 4,
    status: 'RELAYED',
    timestamp: Date.now() - 45000,
  },
];

export const INITIAL_ZK_PROOFS: ZkProofRecord[] = [
  {
    id: 'zk-901',
    proofId: 'zk-proof-8192a0',
    statement: 'Zero-Knowledge Membership in Tier-3 SecOps Whitelist without revealing DID or identity hash',
    proofType: 'Groth16-zkSNARK',
    publicSignals: ['0x2984...71a0', '0x9182...44f0', '0x1092...331b'],
    proofHash: '0x9b2a7e1104fc4e29b1fa0c653d9e88aa0b31e089d71c356f912e7a03425f1908ab9e',
    verificationTimeMs: 3.8,
    verified: true,
    verifiedAt: Date.now() - 48000,
    pedersenCommitment: '0x048f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
  },
  {
    id: 'zk-902',
    proofId: 'zk-proof-8192b1',
    statement: 'Range proof: Stake balance exceeds 1,000,000 AEGIS for Byzantine validator election without revealing exact balance',
    proofType: 'PLONK',
    publicSignals: ['0x1928...99bb', '0x8812...00aa'],
    proofHash: '0x4c8109d77e208f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa89',
    verificationTimeMs: 4.1,
    verified: true,
    verifiedAt: Date.now() - 140000,
    pedersenCommitment: '0x04e12fa90b4c28108aef83401bcae098310baf8332145b23d90ab421a8123fa9901b',
  },
];

export const INITIAL_SNAPSHOTS: BackupSnapshot[] = [
  {
    id: 'snap-184900',
    blockHeight: 184900,
    timestamp: Date.now() - 3600000 * 2,
    stateHash: '0x88921a4f091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
    sizeKb: 14280,
    checksum: 'sha256:d894821a99812bc0a9178490823450912bc0a91784992b28febc35d10943a198',
    totalTransactions: 3491200,
    activeValidatorsCount: 248,
    storageTarget: 'IPFS_ENCRYPTED',
  },
  {
    id: 'snap-184500',
    blockHeight: 184500,
    timestamp: Date.now() - 3600000 * 6,
    stateHash: '0x77102e3a091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
    sizeKb: 13950,
    checksum: 'sha256:b10943a19823fe0128c4309bab3490aa182834bafc1092478ba19071c8a3d98e',
    totalTransactions: 3478900,
    activeValidatorsCount: 248,
    storageTarget: 'ARWEAVE_COLD',
  },
];

export const INITIAL_THREAT_LOGS: ThreatLog[] = [
  {
    id: 'threat-1',
    timestamp: Date.now() - 15000,
    type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    sourceIp: '198.51.100.42 (Anonymous Tor Exit)',
    originDid: 'did:aegis:unknown:rogue_node',
    blockedBy: 'Aegis Zero-Trust Access Gateway',
    severity: 'CRITICAL',
    txHash: '0x992b28febc35d10943a19823fe0128c4309bab34',
    details: 'Unauthorized actor attempted invoking `/api/v2/core-vault` without W3C Verifiable Credential. Cryptographic gatekeeper rejected connection in 0.4ms.',
  },
  {
    id: 'threat-2',
    timestamp: Date.now() - 85000,
    type: 'DOUBLE_SIGN_BYZANTINE',
    sourceIp: '203.0.113.19',
    originDid: '0x12Fa90B4c28108aeF83401bcaE098310baF83321',
    blockedBy: 'Aegis-BFT Consensus Engine',
    severity: 'CRITICAL',
    txHash: '0x44d9ab802f019b33c78f90823450912bc0a91784',
    details: 'Validator proposed two conflicting blocks for round 184890. Slashing protocol triggered: 25% stake burned (490,000 AEGIS) & node jailed.',
  },
  {
    id: 'threat-3',
    timestamp: Date.now() - 240000,
    type: 'MALICIOUS_BYTECODE_DEPLOY',
    sourceIp: '192.0.2.17',
    originDid: 'did:aegis:secops:guest_extern',
    blockedBy: 'Aegis Automated Smart Contract Auditor',
    severity: 'HIGH',
    txHash: '0x3a8f29e623190bbac8709321e908d5b4c0123891',
    details: 'Disallowed deployment of unverified delegatecall proxy contract containing hidden selfdestruct backdoor opcode.',
  },
  {
    id: 'threat-4',
    timestamp: Date.now() - 620000,
    type: 'REPLAY_ATTACK',
    sourceIp: '198.51.100.88',
    originDid: 'did:aegis:extern:relayer_spoof',
    blockedBy: 'Cross-Chain Cryptographic Relayer',
    severity: 'HIGH',
    txHash: '0x71c8a3d98e3992d9c34c8913b1f8e19d70ac861b',
    details: 'Detected duplicate cross-chain messageHash payload replay on bridge gateway. State nullifier check blocked double-spend.',
  },
];

export const REAL_WORLD_CASE_STUDIES: RealWorldCaseStudy[] = [
  {
    id: 'case-guardtime',
    name: 'Guardtime (KSI Blockchain)',
    category: 'GOVERNMENT_DEFENSE',
    organization: 'Guardtime & Government of Estonia',
    websiteUrl: 'https://guardtime.com',
    cyberProblem: 'Centralized government and defense audit logs are vulnerable to insider manipulation, stealth rootkit alterations, and nation-state tampering without detection.',
    blockchainSolution: 'Keyless Signature Infrastructure (KSI) anchors cryptographic state hashes into a mathematically verifiable hash-tree ledger every second. Data verification relies purely on hash math without asymmetric keys that could be compromised.',
    productionDeployment: 'Secures all 1,000,000+ electronic health records, court judgments, land registries, and national cybersecurity operations of the Republic of Estonia since 2012.',
    realWorldClients: ['NATO Defense Alliance', 'US Department of Defense (DoD)', 'Lockheed Martin', 'Estonian e-Health & Police'],
    consensusOrArchitecture: 'Calendar Hash-Tree Blockchain with Merkle aggregation & sub-second global publication',
    keyBenefit: 'Mathematically immutable audit trail proof that can be verified independently without trusting any system admin or secret key.',
    attackVectorsPrevented: [
      'Insider Privilege Escalation & Log Scrubbing',
      'APT Rootkit State Manipulation',
      'Undetected Health Record Alterations',
      'SCADA / Defense Supply Chain Tampering',
    ],
  },
  {
    id: 'case-polyswarm',
    name: 'PolySwarm',
    category: 'THREAT_INTEL',
    organization: 'PolySwarm Ltd.',
    websiteUrl: 'https://polyswarm.io',
    cyberProblem: 'Traditional antivirus software relies on centralized proprietary engines with isolated signature databases, causing a 24-48 hour window of exposure for novel zero-day malware.',
    blockchainSolution: 'A decentralized threat intelligence marketplace running on smart contracts where specialized security engines and malware researchers compete and stake tokens to accurately detect malicious payloads in real-time.',
    productionDeployment: 'Processes tens of millions of suspicious artifacts monthly with crowdsourced consensus, compensating researchers via micro-rewards for accurate threat verdicts.',
    realWorldClients: ['Fortune 500 Enterprises', 'National CERT Teams', 'Global MSSPs', 'Cybersecurity Incident Responders'],
    consensusOrArchitecture: 'Proof-of-Accuracy prediction staking on Ethereum & Polygon L2 rollup',
    keyBenefit: 'Near real-time zero-day detection by aggregating over 55+ distinct security vendors simultaneously with economic incentives against false positives.',
    attackVectorsPrevented: [
      'Zero-Day Malware Polymorphism',
      'Ransomware Delivery Payloads',
      'Vendor Monoculture Blindspots',
      'Delayed Threat Signature Propagation',
    ],
  },
  {
    id: 'case-forta',
    name: 'Forta Network',
    category: 'THREAT_INTEL',
    organization: 'Forta Foundation / OpenZeppelin',
    websiteUrl: 'https://forta.org',
    cyberProblem: 'Smart contracts, web3 bridges, and DeFi vaults execute autonomously, meaning exploits succeed in seconds before human security teams can react or pause systems.',
    blockchainSolution: 'Decentralized runtime security detection network operated by independent node runners executing machine learning detection bots on block transactions in real-time to alert and trigger automated circuit breakers.',
    productionDeployment: 'Monitors over $35 Billion in total value locked across Ethereum, Arbitrum, Optimism, Polygon, and Avalanche, detecting protocol exploits before block finalization.',
    realWorldClients: ['Compound Finance', 'Lido', 'MakerDAO', 'Euler Finance Incident Response'],
    consensusOrArchitecture: 'Decentralized SLA Scanner Nodes with FORT token staking and slashing for inaccurate bot alerts',
    keyBenefit: 'Autonomous on-chain threat interception allowing smart contract firewalls to pause vulnerable vaults before funds leave the protocol.',
    attackVectorsPrevented: [
      'Flash Loan Oracle Manipulation',
      'Reentrancy Drainage Exploits',
      'Governance Voting Flash-Jack attacks',
      'Cross-Chain Bridge Relayer Hijacking',
    ],
  },
  {
    id: 'case-certik',
    name: 'CertiK (Skynet & Formal Verification)',
    category: 'SMART_CONTRACT_AUDIT',
    organization: 'CertiK Cyber Technology Corp',
    websiteUrl: 'https://certik.com',
    cyberProblem: 'Code audits traditionally happen once prior to launch, leaving running systems defenseless against dynamic zero-day vectors, economic flash-exploits, and compiler flaws.',
    blockchainSolution: 'Combining mathematical formal verification (proving code properties with ZK-logic) with on-chain Skynet continuous security telemetry, contract scorecards, and bug bounties.',
    productionDeployment: 'Has analyzed over 4,000 web3 protocols, auditing code securing over $300 Billion in digital capital and preventing critical vulnerabilities.',
    realWorldClients: ['Top Layer 1 & Layer 2 Blockchains', 'PancakeSwap', 'Aave Ecosystem', 'Enterprise Web3 Hubs'],
    consensusOrArchitecture: 'CertiK Chain with dedicated Security Oracle for real-time risk assessment before contract interactions',
    keyBenefit: 'Mathematically proven correctness criteria rather than subjective human manual code review.',
    attackVectorsPrevented: [
      'Integer Overflow / Underflow',
      'Arithmetic Precision Rounding Flaws',
      'Logic Flow & Access Control Bypass',
      'Reentrancy & Cross-Function Taint Exploits',
    ],
  },
  {
    id: 'case-remme',
    name: 'Remme Protocol (Decentralized PKI)',
    category: 'DECENTRALIZED_PKI',
    organization: 'Remme Cyber Labs',
    websiteUrl: 'https://remme.io',
    cyberProblem: 'Centralized Public Key Infrastructure (PKI) and Certificate Authorities (CAs like DigiCert, Comodo, Let\'s Encrypt) are single points of failure susceptible to state-sponsored compromise, fraudulent cert issuance, and DNS spoofing.',
    blockchainSolution: 'Decentralized Public Key Infrastructure (PKI(d)) anchoring X.509 certificate public keys and revocation statuses directly to a distributed ledger. Verification happens locally without pinging centralized CRL or OCSP servers.',
    productionDeployment: 'Piloted with enterprise identity providers, IoT device ecosystems, and zero-trust perimeter systems to eliminate passwords and centralized CAs.',
    realWorldClients: ['Automotive IoT Manufacturers', 'Critical Infrastructure Providers', 'Enterprise Zero-Trust IAMs'],
    consensusOrArchitecture: 'BFT Distributed Key Registry with instant cryptographic certificate revocation',
    keyBenefit: 'Impossible for any rogue Certificate Authority or MITM attacker to forge a valid certificate because the root of trust is decentralized consensus.',
    attackVectorsPrevented: [
      'Man-In-The-Middle (MITM) SSL/TLS Hijacking',
      'Rogue Certificate Authority Compromise',
      'Credential Stuffing & Password Spraying',
      'Delayed OCSP/CRL Certificate Revocation Checks',
    ],
  },
  {
    id: 'case-immunefi',
    name: 'Immunefi Bug Bounty Protocol',
    category: 'BUG_BOUNTY_SECURITY',
    organization: 'Immunefi Platform',
    websiteUrl: 'https://immunefi.com',
    cyberProblem: 'White-hat security researchers often lack trust that traditional corporate entities will pay fair bounties without stealing remediation details or threatening legal action.',
    blockchainSolution: 'On-chain escrow smart contracts and cryptographic bug submission hashes that guarantee ethical disclosure payments, offering bounties up to $10,000,000 for critical zero-days.',
    productionDeployment: 'Has paid out over $100 Million to ethical security hackers and saved over $25 Billion in user funds from potential hacker exploits.',
    realWorldClients: ['Ethereum Foundation', 'Chainlink', 'Polygon', 'Uniswap', 'Arbitrum Foundation'],
    consensusOrArchitecture: 'Multi-sig cryptographic escrow and zero-knowledge vulnerability proof attestation',
    keyBenefit: 'Economically incentivizes the world\'s top vulnerability researchers to protect infrastructure rather than sell exploits on the dark web.',
    attackVectorsPrevented: [
      'Zero-Day Vulnerability Black-Market Sales',
      'Delayed Emergency Patch Disclosure',
      'Hostile Bounty Renegotiations',
      'Supply Chain Library Backdoors',
    ],
  },
  {
    id: 'case-chainalysis',
    name: 'Chainalysis Blockchain Intelligence',
    category: 'THREAT_INTEL',
    organization: 'Chainalysis Inc.',
    websiteUrl: 'https://chainalysis.com',
    cyberProblem: 'Ransomware syndicates (e.g., LockBit, BlackCat) and nation-state hackers (e.g., Lazarus Group) use cryptocurrency to launder ransom payments across borders anonymously.',
    blockchainSolution: 'Heuristic graph analytics, clustering algorithms, and real-time ledger intelligence that trace illicit funds across millions of blockchain transactions, identifying hacker wallets and freezing assets.',
    productionDeployment: 'Used by FBI, Europol, IRS Criminal Investigation, and financial institutions across 70+ countries to seize billions in cybercriminal ransom loot.',
    realWorldClients: ['US Department of Justice (DOJ)', 'Europol Cybercrime Centre (EC3)', 'United Nations Sanctions Panel', 'Global Banks'],
    consensusOrArchitecture: 'Distributed ledger cross-referencing with address heuristic risk scoring',
    keyBenefit: 'Transforms blockchain transparency into an immutable forensic audit tool to identify, sanction, and freeze cyber extortionist funds.',
    attackVectorsPrevented: [
      'Ransomware Payment Laundering',
      'Sanction Evasion by Rogue Nation-States',
      'Darknet Terror Financing & Exploits',
      'Mixer & Cross-Chain Asset obfuscation',
    ],
  },
];

export const ATTACK_VECTOR_SIMULATIONS: AttackVectorSimulation[] = [
  {
    id: 'attack-1',
    title: 'SQL Injection & State Tampering Attack',
    category: 'DATA_EXFILTRATION',
    severity: 'CRITICAL',
    description: 'Adversary injects malicious SQL payload `SELECT * FROM secret_vault WHERE 1=1--` to bypass legacy access restrictions and alter database state.',
    payloadSummary: "' OR '1'='1'; UPDATE ledger SET balance=99999999 WHERE id='hacker'; --",
    targetService: 'Legacy ERP & Financial SQL Database',
    legacyVulnerability: 'Centralized SQL databases trust local DBA credentials and application connection strings, vulnerable to injection or corrupted memory.',
    blockchainDefenseMechanism: 'AegisChain checks the cryptographic SHA-256 state Merkle root. Any altered row invalidates the Merkle inclusion proof in 0.4ms, discarding the unauthorized transaction and blacklisting the attacker DID.',
  },
  {
    id: 'attack-2',
    title: 'Stolen API Token & Replay Attack',
    category: 'CREDENTIAL_REPLAY',
    severity: 'HIGH',
    description: 'Adversary sniffs an authorized bearer token from corporate traffic and attempts replay requests against `/api/v2/core-vault`.',
    payloadSummary: 'Authorization: Bearer aegis_jwt_tok_9b2a... [Replayed from 10 minutes prior]',
    targetService: 'Core Enterprise Vault API Gateway',
    legacyVulnerability: 'Traditional OAuth/JWT tokens can be stolen from log files or MITM proxies and used until expiration unless expensive stateful revoking is configured.',
    blockchainDefenseMechanism: 'AegisChain requires a sub-second zero-knowledge proof with an ephemeral state nullifier tied to the current block height. Replayed proofs collide with the on-chain nullifier accumulator and are dropped with zero latency penalty.',
  },
  {
    id: 'attack-3',
    title: 'Byzantine Double-Signing & Fork Attack',
    category: 'BYZANTINE_CONSENSUS',
    severity: 'CRITICAL',
    description: 'Compromised validator node attempts to propose two contradictory blocks at height N to cause a chain split and execute a double-spend.',
    payloadSummary: 'Propose Block A (Hash: 0x88f...1a) & Block B (Hash: 0x99c...3b) simultaneously',
    targetService: 'Aegis-BFT Consensus Engine & Ledger',
    legacyVulnerability: 'Traditional distributed systems (Raft, Paxos) can freeze or deadlock when nodes act maliciously or lie (Byzantine faults).',
    blockchainDefenseMechanism: 'Automated slashing detector captures both conflicting signatures as cryptographic proof of fraud. Automatically burns 25% of the validator stake (490,000 AEGIS), permanently jails the node, and alerts the SOC network.',
  },
  {
    id: 'attack-4',
    title: 'Reentrancy Smart Contract Drainage',
    category: 'SMART_CONTRACT_DRAIN',
    severity: 'CRITICAL',
    description: 'Malicious actor calls vulnerable contract withdraw function, re-entering before balance deduction to drain liquidity vault.',
    payloadSummary: 'Fallback() { if(address(vault).balance >= 1 ether) { vault.withdraw(1 ether); } }',
    targetService: 'Decentralized Escrow Contract',
    legacyVulnerability: 'Compilers without formal verification allow state mutation order violations (SWC-107).',
    blockchainDefenseMechanism: 'Aegis AST Static & Dynamic Taint Analyzer flags the missing Checks-Effects-Interactions pattern during pre-execution verification. Auto-applies nonReentrant guard modifier and blocks deployment.',
  },
  {
    id: 'attack-5',
    title: 'Man-In-The-Middle (MITM) Certificate Spoofing',
    category: 'MITM_CERT_SPOOF',
    severity: 'HIGH',
    description: 'Adversary uses a rogue or compromised intermediate Certificate Authority to forge a TLS certificate for `aegis-vault.internal`.',
    payloadSummary: 'Forged X.509 Certificate issued by Compromised-Root-CA (Serial #0x99281a)',
    targetService: 'TLS Edge Proxy & Bastion Gateway',
    legacyVulnerability: 'Browsers and servers trust hundreds of global root CAs. If one is hacked or coerced, attackers can issue valid fake certificates for any domain.',
    blockchainDefenseMechanism: 'Aegis Decentralized PKI checks domain fingerprints against the immutable blockchain Merkle tree. Because the rogue cert is absent from the on-chain registry, the handshake is severed before unencrypted bytes are exchanged.',
  },
];

export const INITIAL_CERTIFICATES: DecentralizedCertificate[] = [
  {
    id: 'cert-1',
    domainOrSubject: 'vault.aegis.internal',
    certType: 'TLS_SSL_WEB',
    publicKeyFingerprint: 'SHA256:7b:99:a2:44:81:e3:10:9f:01:4d:55:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66',
    issuerDid: 'did:aegis:pki:root_authority_01',
    issuedAt: Date.now() - 3600000 * 24 * 30,
    expiresAt: Date.now() + 3600000 * 24 * 335,
    status: 'VALID',
    anchorBlockHeight: 142000,
    merkleProof: '0x8f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
  },
  {
    id: 'cert-2',
    domainOrSubject: 'bastion-zero.secops.mesh',
    certType: 'SSH_BASTION',
    publicKeyFingerprint: 'SHA256:1a:2b:3c:4d:5e:6f:70:81:92:a3:b4:c5:d6:e7:f8:09:10:20:30:40:50:60:70:80',
    issuerDid: 'did:aegis:pki:root_authority_01',
    issuedAt: Date.now() - 3600000 * 24 * 10,
    expiresAt: Date.now() + 3600000 * 24 * 80,
    status: 'VALID',
    anchorBlockHeight: 178000,
    merkleProof: '0x3a8f29e623190bbac8709321e908d5b4c012389145b23d90ab421a8123fa9901',
  },
  {
    id: 'cert-3',
    domainOrSubject: 'api-gateway.k8s.cluster',
    certType: 'TLS_SSL_WEB',
    publicKeyFingerprint: 'SHA256:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99:aa:bb:12:34:56:78:90:ab:cd:ef',
    issuerDid: 'did:aegis:pki:root_authority_01',
    issuedAt: Date.now() - 3600000 * 24 * 45,
    expiresAt: Date.now() + 3600000 * 24 * 320,
    status: 'VALID',
    anchorBlockHeight: 165000,
    merkleProof: '0x71c8a3d98e3992d9c34c8913b1f8e19d70ac861ba78b209148bc8921fa0021c9',
  },
  {
    id: 'cert-4',
    domainOrSubject: 'legacy-vpn.corp.intranet',
    certType: 'VPN_GATEWAY',
    publicKeyFingerprint: 'SHA256:00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff:99:88:77:66:55:44:33:22',
    issuerDid: 'did:aegis:pki:root_authority_01',
    issuedAt: Date.now() - 3600000 * 24 * 120,
    expiresAt: Date.now() + 3600000 * 24 * 245,
    status: 'REVOKED',
    anchorBlockHeight: 130000,
    merkleProof: '0x5b33108aeF83401bcaE098310baF8332145b23d90ab421a8123fa9901bba2901',
    revocationReason: 'Private key exposure detected in public GitHub repository commit. Cryptographically revoked on-chain in 0.3s.',
    revokedAt: Date.now() - 3600000 * 24 * 2,
  },
];

export const INITIAL_THREAT_INTEL: ThreatIntelItem[] = [
  {
    id: 'ioc-1',
    iocType: 'MALICIOUS_IP',
    iocValue: '198.51.100.42',
    threatActor: 'UNC2452 / APT29 Telemetry Node',
    stakedAegis: 50000,
    reputationScore: 99.4,
    reportedByDid: 'did:aegis:secops:9b2a7e1104fc',
    timestamp: Date.now() - 1200000,
    tags: ['Brute-Force', 'SCADA Probe', 'Tor Exit'],
    status: 'VERIFIED_ON_CHAIN',
  },
  {
    id: 'ioc-2',
    iocType: 'CONTRACT_EXPLOIT_HASH',
    iocValue: '0x9b2a7e1104fc4e29b1fa0c653d9e88aa0b31e089d71c356f912e7a03425f1908',
    threatActor: 'Lazarus Group Flash Drainer',
    stakedAegis: 120000,
    reputationScore: 99.8,
    reportedByDid: 'did:aegis:secops:soc_alpha_01',
    timestamp: Date.now() - 4800000,
    tags: ['Reentrancy Exploit', 'Taint Bytecode', 'Zero-Day'],
    status: 'VERIFIED_ON_CHAIN',
  },
  {
    id: 'ioc-3',
    iocType: 'PHISHING_DID',
    iocValue: 'did:aegis:secops:imposter_admin_fe49',
    threatActor: 'Scattered Spider Impersonator',
    stakedAegis: 25000,
    reputationScore: 98.2,
    reportedByDid: 'did:aegis:secops:infra_gateway_01',
    timestamp: Date.now() - 14400000,
    tags: ['Social Engineering', 'Credential Harvest', 'Fake Verifier'],
    status: 'VERIFIED_ON_CHAIN',
  },
  {
    id: 'ioc-4',
    iocType: 'MALWARE_SIGNATURE',
    iocValue: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    threatActor: 'BlackCat / ALPHV Ransomware Payload',
    stakedAegis: 80000,
    reputationScore: 99.9,
    reportedByDid: 'did:aegis:secops:tier3_auditor_01',
    timestamp: Date.now() - 86400000,
    tags: ['Ransomware Encryptor', 'Shadow Copy Wiper', 'SHA256'],
    status: 'VERIFIED_ON_CHAIN',
  },
];

