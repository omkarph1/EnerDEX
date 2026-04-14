/**
 * Parse Solidity / MetaMask errors into user-friendly messages.
 */
export function parseError(err) {
  const msg = err?.reason || err?.data?.message || err?.message || "Unknown error";
  if (msg.includes("user rejected"))            return "Transaction cancelled by user.";
  if (msg.includes("insufficient funds"))       return "Insufficient ETH balance.";
  if (msg.includes("Listing is not active"))    return "This listing is no longer available.";
  if (msg.includes("Seller cannot buy"))        return "You cannot buy your own listing.";
  if (msg.includes("Incorrect ETH"))            return "Incorrect ETH amount sent.";
  if (msg.includes("Only seller can cancel"))   return "Only the seller can cancel this listing.";
  if (msg.includes("Amount must be greater"))   return "Amount must be greater than 0.";
  if (msg.includes("Price must be greater"))    return "Price must be greater than 0.";
  if (msg.includes("No fees to withdraw"))      return "No accumulated fees to withdraw.";
  if (msg.includes("InsufficientAllowance"))    return "Token approval required — please approve first.";
  if (msg.includes("InsufficientBalance"))      return "Insufficient ETK token balance.";
  return msg.length > 120 ? msg.slice(0, 120) + "…" : msg;
}

/**
 * Format a unix timestamp → "Apr 12, 2:30 PM"
 */
export function formatTimestamp(unixTs) {
  if (!unixTs) return null;
  return new Date(unixTs * 1000).toLocaleString("en-IN", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

/**
 * Truncate an Ethereum address for display.
 */
export function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

/**
 * Calculate loyalty tier from point count.
 */
export function loyaltyTier(pts) {
  const p = parseInt(pts) || 0;
  if (p >= 100) return { label: "🥇 Gold",    color: "#f0b429", next: null, progress: 100 };
  if (p >= 50)  return { label: "🥈 Silver",  color: "#a0aec0", next: 100,  progress: (p - 50)  / 50 * 100 };
  if (p >= 10)  return { label: "🥉 Bronze",  color: "#c97d4e", next: 50,   progress: (p - 10)  / 40 * 100 };
  return              { label: "⭐ Starter",  color: "#888",    next: 10,   progress: p / 10 * 100 };
}
