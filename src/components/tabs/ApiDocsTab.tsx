import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  Layers,
  Send,
  Zap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useBlockchain } from '../../context/BlockchainContext';

interface ApiEndpoint {
  method: string;
  category: string;
  description: string;
  paramsExample: Record<string, any>;
  responseExample: Record<string, any>;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'aegis_verifyAccess',
    category: 'Zero-Trust Access Gateway',
    description: 'Validates a W3C Decentralized Identity and Verifiable Credential against protected legacy infrastructure endpoints using zero-knowledge proof verification.',
    paramsExample: {
      did: 'did:aegis:secops:9b2a7e1104fc',
      resource: '/api/v2/core-vault',
      requiredClearance: 'LEVEL_4_TOP_SECRET',
      zkProof: '0x048f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
    },
    responseExample: {
      authorized: true,
      statusCode: 200,
      clearanceLevel: 'LEVEL_4_TOP_SECRET',
      zkProofVerified: true,
      latencyMs: 3.8,
      attestationHash: '0x71c8a3d98e3992d9c34c8913b1f8e19d70ac861ba78b209148bc8921fa0021c9',
    },
  },
  {
    method: 'aegis_submitZKProof',
    category: 'Zero-Knowledge Engine',
    description: 'Submits a zk-SNARK or PLONK proof for on-chain state finality and confidential access without disclosing private witness data.',
    paramsExample: {
      proofType: 'Groth16-zkSNARK',
      statement: 'Membership in Tier-3 SecOps Whitelist',
      publicSignals: ['0x2984...71a0', '0x9182...44f0'],
      proofBytes: '0x9b2a7e1104fc4e29b1fa0c653d9e88aa0b31e089d71c356f912e7a03425f1908ab9e',
    },
    responseExample: {
      verified: true,
      constraintsSatisfied: 43280,
      pairingCheck: 'PASSED',
      finalityMs: 4.1,
      txHash: '0x8f3c7e091b409d6fbb5a11c8a4128f9cde2a5b6c77884a2d3e10fa899cba4211',
    },
  },
  {
    method: 'aegis_auditContract',
    category: 'Automated Security Audit',
    description: 'Triggers automated static AST and symbolic taint analysis on EVM or WASM smart contract bytecode.',
    paramsExample: {
      contractName: 'AegisVault.sol',
      compilerVersion: '0.8.20',
      ruleset: ['SWC-107', 'SWC-115', 'SWC-121'],
    },
    responseExample: {
      securityScore: 99,
      vulnerabilitiesFound: 0,
      status: 'VERIFIED_SECURE',
      auditHash: '0x1a89cd34be760081df90432f8108c9012a9bc4512e0934fba012e87c0932de01',
      gasEfficiencyRating: 'OPTIMAL',
    },
  },
  {
    method: 'aegis_bridgeRelay',
    category: 'Cross-Chain Interoperability',
    description: 'Submits state sync payload for cross-chain asset transfer and threshold relayer multi-sig verification.',
    paramsExample: {
      sourceChain: 'AegisChain L1',
      destChain: 'Ethereum L2',
      asset: 'AEGIS-USD',
      amount: '50000.00',
      recipient: '0x32A44B9E0981cCa40182E098d70A110294bfa293',
    },
    responseExample: {
      status: 'FINALIZED',
      relayerSignaturesCount: 4,
      requiredSignatures: 4,
      stateRootProof: '0x5b33108aeF83401bcaE098310baF8332145b23d90ab421a8123fa9901bba2901',
      relayTxHash: '0x99a2c8108aeF83401bcaE098310baF8332145b23d90ab421a8123fa9901b0981',
    },
  },
  {
    method: 'aegis_getLatestBlock',
    category: 'Consensus & Ledger',
    description: 'Retrieves the latest committed block header, SHA-256 Merkle root, validator proposer, and sub-second finality benchmark.',
    paramsExample: {},
    responseExample: {
      height: 184920,
      proposer: 'Aegis-Alpha-Sentry',
      finalityMs: 382,
      tps: 14250,
      merkleRoot: '0x3a8f29e623190bbac8709321e908d5b4c012389145b23d90ab421a8123fa9901',
      hash: '0x71c8a3d98e3992d9c34c8913b1f8e19d70ac861ba78b209148bc8921fa0021c9',
    },
  },
];

export const ApiDocsTab: React.FC = () => {
  const { networkMetrics, blocks } = useBlockchain();
  const [selectedMethod, setSelectedMethod] = useState<string>(API_ENDPOINTS[0].method);
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(API_ENDPOINTS[0].paramsExample, null, 2)
  );
  const [liveResponse, setLiveResponse] = useState<string>(
    JSON.stringify(API_ENDPOINTS[0].responseExample, null, 2)
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [execLatency, setExecLatency] = useState<number>(3.8);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [copied, setCopied] = useState<boolean>(false);

  const activeEndpoint = API_ENDPOINTS.find((e) => e.method === selectedMethod) || API_ENDPOINTS[0];

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedMethod(ep.method);
    setRequestPayload(JSON.stringify(ep.paramsExample, null, 2));
    setLiveResponse(JSON.stringify(ep.responseExample, null, 2));
  };

  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 120));
    const end = performance.now();
    const duration = parseFloat((end - start).toFixed(2));
    setExecLatency(duration);

    // Dynamic mock response based on endpoint
    if (activeEndpoint.method === 'aegis_getLatestBlock') {
      const latest = blocks[0];
      setLiveResponse(
        JSON.stringify(
          {
            jsonrpc: '2.0',
            result: {
              height: latest?.height || networkMetrics.blockHeight,
              proposer: latest?.proposer || 'Aegis-Alpha-Sentry',
              finalityMs: latest?.finalityMs || 382,
              tps: networkMetrics.tps,
              merkleRoot: latest?.merkleRoot,
              hash: latest?.hash,
            },
            id: 1,
          },
          null,
          2
        )
      );
    } else {
      setLiveResponse(
        JSON.stringify(
          {
            jsonrpc: '2.0',
            result: activeEndpoint.responseExample,
            id: 1,
          },
          null,
          2
        )
      );
    }

    setIsExecuting(false);
  };

  const generateSnippet = () => {
    if (codeLanguage === 'curl') {
      return `curl -X POST https://api.aegis.network/rpc/v1 \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    {
      jsonrpc: '2.0',
      method: activeEndpoint.method,
      params: activeEndpoint.paramsExample,
      id: 1,
    },
    null,
    2
  )}'`;
    }
    if (codeLanguage === 'typescript') {
      return `import { AegisClient } from '@aegis/sdk';

const client = new AegisClient({ endpoint: 'https://api.aegis.network/rpc/v1' });

async function execute() {
  const response = await client.${activeEndpoint.method}(${JSON.stringify(
        activeEndpoint.paramsExample,
        null,
        2
      )});
  console.log('Result:', response);
}
execute();`;
    }
    return `import requests

url = "https://api.aegis.network/rpc/v1"
payload = {
    "jsonrpc": "2.0",
    "method": "${activeEndpoint.method}",
    "params": ${JSON.stringify(activeEndpoint.paramsExample, null, 4)},
    "id": 1
}
response = requests.post(url, json=payload)
print(response.json())`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Developer API Documentation & JSON-RPC 2.0 Playground
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrate AegisChain cybersecurity primitives into legacy enterprise systems, CI/CD pipelines, and microservices.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
          JSON-RPC 2.0 / REST v1 Spec
        </div>
      </div>

      {/* Main Playground Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints Index (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Available Methods
          </h3>

          <div className="space-y-1.5">
            {API_ENDPOINTS.map((ep) => {
              const isSelected = ep.method === activeEndpoint.method;
              return (
                <button
                  key={ep.method}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-emerald-700">
                    {ep.method}()
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">{ep.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Explorer & Request/Response (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Method Overview Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-base font-bold text-slate-900">
                {activeEndpoint.method}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
                POST /rpc/v1
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {activeEndpoint.description}
            </p>

            {/* Request Payload Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Request Parameters (JSON)</span>
                <span className="text-[11px] font-mono text-slate-400">Edit payload freely</span>
              </div>
              <textarea
                rows={5}
                value={requestPayload}
                onChange={(e) => setRequestPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleExecuteRequest}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-xs"
              >
                <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
                {isExecuting ? 'Calling Endpoint...' : 'Execute Live Request'}
              </button>
            </div>
          </div>

          {/* Response Payload Viewer */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Live Response Payload (JSON-RPC)
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Execution Time: {execLatency}ms
              </span>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[220px] shadow-inner">
              <code>{liveResponse}</code>
            </pre>
          </div>

          {/* Code Snippets Section */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">SDK Implementation Snippet</span>
              </div>

              <div className="flex items-center gap-2">
                {(['curl', 'typescript', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition ${
                      codeLanguage === lang
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}

                <button
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition"
                  title="Copy code snippet"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[200px] shadow-inner">
              <code>{generateSnippet()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
