import crypto from "crypto";
// Fungsi generate nonce (acak, bisa pakai crypto atau Math.random untuk sederhana)
export function generateNonce(length = 16): string {
  // Crypto random lebih aman (Node.js & browser modern)
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => dec.toString(16).padStart(2, "0")).join(
      ""
    );
  } else {
    // Fallback (Node.js)
    return crypto.randomBytes(length).toString("hex");
  }
}

// Fungsi generate timestamp (dalam detik unix epoch)
export function generateTimestamp(): number {
  return Math.floor(Date.now() / 1000); // Dalam detik
}
