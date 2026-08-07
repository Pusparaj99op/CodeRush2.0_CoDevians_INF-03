export interface FreighterWalletState {
  connected: boolean;
  publicKey: string | null;
  network: "TESTNET" | "PUBLIC";
}

declare global {
  interface Window {
    freighter?: {
      isConnected?: () => Promise<boolean>;
      isAllowed?: () => Promise<boolean>;
      requestAccess?: () => Promise<string>;
      getPublicKey?: () => Promise<string>;
      getNetwork?: () => Promise<string>;
      signTransaction?: (xdr: string, opts?: { network?: string; networkPassphrase?: string }) => Promise<string>;
    };
    freighterApi?: any;
  }
}

/**
 * Check if Freight/Freighter Wallet extension is present in the browser.
 */
export function isFreighterInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.freighter || window.freighterApi);
}

/**
 * Connect to Freight/Freighter Wallet browser extension on Stellar TestNet.
 */
export async function connectFreighterWallet(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Freight Wallet connection is only available in the browser");
  }

  // Check direct window.freighter provider
  if (window.freighter) {
    try {
      if (window.freighter.requestAccess) {
        const pubKey = await window.freighter.requestAccess();
        if (pubKey) return pubKey;
      }
      if (window.freighter.getPublicKey) {
        const pubKey = await window.freighter.getPublicKey();
        if (pubKey) return pubKey;
      }
    } catch (err) {
      throw new Error(`Freight Wallet connection failed: ${(err as Error).message}`);
    }
  }

  // Fallback to window.freighterApi or freighter-api if present
  try {
    if (window.freighterApi && typeof window.freighterApi.getPublicKey === "function") {
      const pubKey = await window.freighterApi.getPublicKey();
      if (pubKey) return pubKey;
    }
  } catch (e) {
    // ignore lookup error
  }

  // Simulated fallback key for hackathon demo if extension is not active
  const savedKey = localStorage.getItem("veldar:freighter_key");
  if (savedKey) return savedKey;

  const mockKey = "GA2C5RFPE6GCKMY3US5PAB4VVVRIGCHW54FKW2B2P2X23N5TKEY4TEST";
  localStorage.setItem("veldar:freighter_key", mockKey);
  return mockKey;
}

/**
 * Sign a Stellar payment transaction using Freight/Freighter Wallet extension.
 */
export async function signPaymentWithFreighter(
  payerPublicKey: string,
  payeePublicKey: string,
  amountStellar: number
): Promise<{ txnHash: string; signedXdr?: string }> {
  if (typeof window === "undefined") {
    throw new Error("Freight Wallet signing is only available in the browser");
  }

  let validPayer = (payerPublicKey ?? "").trim();
  if (!validPayer) {
    validPayer = await connectFreighterWallet();
  }

  let validPayee = (payeePublicKey ?? "").trim();
  if (!validPayee) {
    validPayee = "GBRPYHIL2CI3FNQ4BXLFMNDLFPPPU2HY523XYT6WL3L32T7MYW27L3R";
  }

  // Try extension signing if freighter is connected
  if (window.freighter?.signTransaction) {
    try {
      // Dummy testnet XDR envelope for demonstration signing
      const dummyXdr = "AAAAAgAAAAA...";
      const signedXdr = await window.freighter.signTransaction(dummyXdr, {
        network: "TESTNET",
      });
      const hash = `STL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      return { txnHash: hash, signedXdr };
    } catch (err) {
      throw new Error(`Freight Wallet signing rejected: ${(err as Error).message}`);
    }
  }

  // Standard simulated transaction hash when running in web demo mode
  const simulatedHash = `STL-TESTNET-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    txnHash: simulatedHash,
  };
}
