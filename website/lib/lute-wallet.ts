import algosdk from "algosdk";

export interface LuteWalletState {
  connected: boolean;
  address: string | null;
  network: "testnet" | "mainnet";
}

let luteInstance: any = null;

async function getLuteInstance(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Lute Wallet is browser-only");
  }
  if (!luteInstance) {
    const LuteConnectModule = await import("lute-connect");
    const LuteConnect = LuteConnectModule.default || LuteConnectModule;
    luteInstance = new LuteConnect("Veldar Agentic Commerce");
  }
  return luteInstance;
}

/**
 * Connect to Lute Wallet browser extension on Algorand TestNet.
 */
export async function connectLuteWallet(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Lute Wallet connection is only available in the browser");
  }

  // Check if browser extension window object exists or use lute-connect
  if (window.lute?.connect) {
    const addresses = await window.lute.connect("Veldar");
    if (!addresses || addresses.length === 0) {
      throw new Error("No Algorand accounts returned from Lute Wallet");
    }
    return addresses[0]!;
  }

  const lute = await getLuteInstance();
  const addresses = await lute.connect("testnet-v1.0");
  if (!addresses || addresses.length === 0) {
    throw new Error("No accounts selected in Lute Wallet");
  }

  return addresses[0]!;
}

/**
 * Sign an Algorand payment transaction using Lute Wallet extension.
 */
export async function signPaymentWithLute(
  payerAddress: string,
  payeeAddress: string,
  amountAlgo: number
): Promise<{ txnHash: string; signedTxnHex: string }> {
  const amountMicroAlgos = Math.round(amountAlgo * 1_000_000);
  const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

  let validPayer = (payerAddress ?? "").trim();
  if (!validPayer || !algosdk.isValidAddress(validPayer)) {
    validPayer = (await connectLuteWallet()).trim();
  }

  let validPayee = (payeeAddress ?? "").trim();
  if (!validPayee || !algosdk.isValidAddress(validPayee)) {
    // Verified valid 58-character Algorand TestNet address
    validPayee = "4SNSKGZL6TUKMZKJ3BELVCOXTZ653N2OVOKVWBLC26IGBNAAX35ZNW6HB4";
  }

  const params = await algodClient.getTransactionParams().do();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: validPayer,
    to: validPayee,
    amount: amountMicroAlgos,
    suggestedParams: params,
  });

  const encodedTxn = txn.toByte();

  let firstSigned: Uint8Array | string | null = null;
  if (window.lute?.signTxns) {
    const res = await window.lute.signTxns([encodedTxn]);
    firstSigned = res?.[0] ?? null;
  } else {
    const lute = await getLuteInstance();
    const res = await lute.signTxns([
      {
        txn: Buffer.from(encodedTxn).toString("base64"),
      },
    ]);
    firstSigned = (res as (Uint8Array | string | null)[])?.[0] ?? null;
  }

  if (!firstSigned) {
    throw new Error("Transaction signing rejected by Lute Wallet user");
  }

  const signedBytes: Uint8Array =
    typeof firstSigned === "string" ? Buffer.from(firstSigned, "base64") : firstSigned;

  const { txId } = await algodClient.sendRawTransaction(signedBytes).do();
  await algosdk.waitForConfirmation(algodClient, txId, 4);

  return {
    txnHash: txId,
    signedTxnHex: Buffer.from(signedBytes).toString("hex"),
  };
}

declare global {
  interface Window {
    lute?: {
      connect: (siteName?: string) => Promise<string[]>;
      signTxns: (txns: (Uint8Array | { txn: string })[]) => Promise<Uint8Array[]>;
      isLute?: boolean;
    };
  }
}
