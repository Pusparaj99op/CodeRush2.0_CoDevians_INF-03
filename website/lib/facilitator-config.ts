// The facilitator's canonical settlement terms, in one place.
//
// Providers (including the laptop-server) used to hardcode their own copy
// of the payee address in their own env var, and the two had to be kept in
// sync by hand. They drifted immediately, and the only symptom was a
// "payee address does not match declared terms" failure after the payment
// had already been made. Providers now fetch this from
// GET /api/facilitator/terms instead of duplicating it.

import { envOr } from "./env";

export const FACILITATOR_PAYEE_ADDRESS = envOr(
  "FACILITATOR_PAYEE_ADDRESS",
  "FACILITATORPLACEHOLDERADDRESSTESTNETONLY"
);

export const FACILITATOR_NETWORK = "testnet" as const;

/** True while running on the built-in placeholder rather than a real account. */
export const isPlaceholderPayee = FACILITATOR_PAYEE_ADDRESS.startsWith("FACILITATORPLACEHOLDER");
