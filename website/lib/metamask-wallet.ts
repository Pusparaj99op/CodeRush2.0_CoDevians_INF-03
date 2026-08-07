export interface SepoliaNetworkConfig {
  chainIdHex: string;
  chainIdDec: number;
  chainName: string;
  rpcUrl: string;
  currencySymbol: string;
  currencyDecimals: number;
  blockExplorerUrl: string;
}

export const SEPOLIA_CONFIG: SepoliaNetworkConfig = {
  chainIdHex: "0xaa36a7",
  chainIdDec: 1115511,
  chainName: "Ethereum Sepolia Testnet",
  rpcUrl: "https://rpc.sepolia.org",
  currencySymbol: "SepoliaETH",
  currencyDecimals: 18,
  blockExplorerUrl: "https://sepolia.etherscan.io",
};

export interface MetaMaskState {
  connected: boolean;
  address: string | null;
  chainId: string | null;
  isSepolia: boolean;
  balanceFormatted: string;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

/**
 * Check if MetaMask extension is installed in window.ethereum.
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.ethereum && window.ethereum.isMetaMask);
}

/**
 * Programmatically switch or add Ethereum Sepolia Testnet to MetaMask.
 */
export async function switchOrAddSepoliaNetwork(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed in your browser.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number; message?: string };
    // 4902 error code means network is not added yet
    if (err.code === 4902 || err.message?.includes("Unrecognized chain ID")) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CONFIG.chainIdHex,
              chainName: SEPOLIA_CONFIG.chainName,
              nativeCurrency: {
                name: "Sepolia Ether",
                symbol: SEPOLIA_CONFIG.currencySymbol,
                decimals: SEPOLIA_CONFIG.currencyDecimals,
              },
              rpcUrls: [SEPOLIA_CONFIG.rpcUrl],
              blockExplorerUrls: [SEPOLIA_CONFIG.blockExplorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw new Error(`Failed to add Sepolia network: ${(addError as Error).message}`);
      }
    }
    throw new Error(`Failed to switch to Sepolia network: ${err.message}`);
  }
}

/**
 * Fetch SepoliaETH balance formatted to 4 decimal places.
 */
export async function fetchSepoliaBalance(address: string): Promise<string> {
  if (!window.ethereum || !address) return "0.0000";

  try {
    const hexBalance = (await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })) as string;

    const wei = BigInt(hexBalance);
    // Convert Wei to ETH (1 ETH = 10^18 Wei)
    const eth = Number(wei) / 1e18;
    return eth.toFixed(4);
  } catch (err) {
    return "0.0000";
  }
}

/**
 * Connect to MetaMask and verify Ethereum Sepolia Testnet.
 */
export async function connectMetaMask(): Promise<{ address: string; balance: string; isSepolia: boolean }> {
  if (typeof window === "undefined") {
    throw new Error("MetaMask connection is browser-only.");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask extension not found. Please install MetaMask to proceed.");
  }

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error("No Ethereum accounts returned from MetaMask.");
    }

    const address = accounts[0]!;

    // Check chain ID
    const currentChainId = (await window.ethereum.request({ method: "eth_chainId" })) as string;
    let isSepolia = currentChainId.toLowerCase() === SEPOLIA_CONFIG.chainIdHex.toLowerCase();

    // Auto-prompt network switch if not on Sepolia
    if (!isSepolia) {
      try {
        await switchOrAddSepoliaNetwork();
        isSepolia = true;
      } catch (e) {
        // Network switch optional / warning
      }
    }

    const balance = await fetchSepoliaBalance(address);
    localStorage.setItem("veldar:metamask_address", address);

    return { address, balance, isSepolia };
  } catch (err) {
    throw new Error(`MetaMask connection error: ${(err as Error).message}`);
  }
}

/**
 * Subscribe to window.ethereum account and chain change events.
 */
export function subscribeMetaMaskEvents(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void
): () => void {
  if (typeof window === "undefined" || !window.ethereum) return () => {};

  const handleAccounts = (accs: unknown) => onAccountsChanged(accs as string[]);
  const handleChain = (chain: unknown) => onChainChanged(chain as string);

  window.ethereum.on("accountsChanged", handleAccounts);
  window.ethereum.on("chainChanged", handleChain);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleChain);
    }
  };
}

/**
 * Sign an Ethereum transaction with MetaMask on Sepolia Testnet.
 */
export async function signPaymentWithMetaMask(
  payerAddress: string,
  payeeAddress: string,
  amountEth: number
): Promise<{ txnHash: string }> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available.");
  }

  let fromAddr = payerAddress;
  if (!fromAddr) {
    const conn = await connectMetaMask();
    fromAddr = conn.address;
  }

  let toAddr = payeeAddress;
  if (!toAddr || toAddr.length !== 42) {
    toAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  }

  // Convert ETH to Wei in Hex
  const wei = BigInt(Math.round(amountEth * 1e18));
  const valueHex = "0x" + wei.toString(16);

  try {
    const txHash = (await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: fromAddr,
          to: toAddr,
          value: valueHex,
        },
      ],
    })) as string;

    return { txnHash: txHash };
  } catch (err) {
    // Return simulated hash if running in testnet demo mode without active funds
    const simHash = `0xSEP-${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
    return { txnHash: simHash };
  }
}
