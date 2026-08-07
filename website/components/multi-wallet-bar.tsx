"use client";

import { LuteWalletButton } from "./lute-wallet-button";
import { FreighterWalletButton } from "./freighter-wallet-button";

export function MultiWalletBar() {
  return (
    <div className="flex items-center gap-2">
      <LuteWalletButton />
      <FreighterWalletButton />
    </div>
  );
}
