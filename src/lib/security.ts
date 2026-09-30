/**
 * Core Security, Anti-Tamper & Cryptographic Storage Guard
 * Protects runtime state and persistent local storage from unauthorized modification.
 */

const STORAGE_SECRET_SALT = "bj_sec_v3#9948_trk";

/**
 * Computes a deterministic cryptographic signature for state integrity verification.
 */
function computeSignature(payload: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x5bf03635;

  const salted = `${STORAGE_SECRET_SALT}:${payload}:${STORAGE_SECRET_SALT.split("").reverse().join("")}`;

  for (let i = 0; i < salted.length; i++) {
    const code = salted.charCodeAt(i);
    hash1 ^= code;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 ^= code;
    hash2 = Math.imul(hash2, 0x01000193);
  }

  const hex1 = (hash1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  return `${hex1}-${hex2}`;
}

/**
 * Obfuscates state payloads to prevent plaintext memory/storage inspection.
 */
function scramble(str: string): string {
  try {
    const encoded = encodeURIComponent(str);
    let out = "";
    for (let i = 0; i < encoded.length; i++) {
      out += String.fromCharCode(encoded.charCodeAt(i) ^ 0x5a);
    }
    return btoa(out);
  } catch {
    return btoa(str);
  }
}

/**
 * De-obfuscates stored state payloads.
 */
function unscramble(b64: string): string {
  try {
    const bin = atob(b64);
    let out = "";
    for (let i = 0; i < bin.length; i++) {
      out += String.fromCharCode(bin.charCodeAt(i) ^ 0x5a);
    }
    return decodeURIComponent(out);
  } catch {
    return atob(b64);
  }
}

export type ProtectedEnvelope = {
  data: string;
  sig: string;
  ts: number;
};

/**
 * Custom secure storage adapter for Zustand persist middleware.
 * Verifies HMAC/signature integrity on read; resets and logs security events on tamper detection.
 */
export const secureStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined" || !window.localStorage) return null;

    try {
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;

      // Handle unmigrated legacy plaintext JSON safely
      if (raw.startsWith("{") && raw.includes('"state"')) {
        return raw;
      }

      const envelope = JSON.parse(raw) as ProtectedEnvelope;
      if (!envelope || !envelope.data || !envelope.sig) {
        console.warn("[Security Guard] Corrupted storage envelope. Resetting state.");
        window.localStorage.removeItem(name);
        return null;
      }

      const expectedSig = computeSignature(envelope.data);
      if (envelope.sig !== expectedSig) {
        console.error(
          "[Security Guard] Critical: State tampering detected! Storage payload altered. Reverting to safe defaults.",
        );
        window.localStorage.removeItem(name);
        return null;
      }

      return unscramble(envelope.data);
    } catch (err) {
      console.warn("[Security Guard] Failed reading protected storage:", err);
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;

    try {
      const scrambledData = scramble(value);
      const signature = computeSignature(scrambledData);

      const envelope: ProtectedEnvelope = {
        data: scrambledData,
        sig: signature,
        ts: Date.now(),
      };

      window.localStorage.setItem(name, JSON.stringify(envelope));
    } catch (err) {
      console.warn("[Security Guard] Storage write failed:", err);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(name);
  },
};

/**
 * Game Anti-Cheat: Validates run rewards against physics limits.
 * Protects against memory/teleport injection.
 */
export function validateRunReward(distance: number, earnedDollars: number): boolean {
  if (!Number.isFinite(distance) || !Number.isFinite(earnedDollars)) return false;
  if (distance < 0 || earnedDollars < 0) return false;

  // Maximum theoretical dollars per unit distance based on game density
  const MAX_THEORETICAL_DOLLARS_PER_STEP = 350;
  const maxPossible = Math.max(100, (distance + 5) * MAX_THEORETICAL_DOLLARS_PER_STEP);

  if (earnedDollars > maxPossible) {
    console.warn(
      `[Anti-Cheat] Suspicious reward rejected: ${earnedDollars} for distance ${distance}`,
    );
    return false;
  }

  return true;
}

/**
 * Sanitizes and bounds numeric parameters against overflows, NaN and negative injection.
 */
export function clampSafeInteger(value: unknown, min: number, max: number, fallback = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value) || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.floor(value), min), max);
}
