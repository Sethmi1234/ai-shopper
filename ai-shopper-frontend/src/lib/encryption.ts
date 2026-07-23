const KEY_HEX =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ||
  "c6a412d1babeae1d8cdbe7ee00f9deb55da8f53c2558d7646bdf6a3dab684128";
const IV_HEX =
  process.env.NEXT_PUBLIC_ENCRYPTION_IV ||
  "450f050d931a9c716a99cba67387e7ac";

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const getSubtle = (): SubtleCrypto => {
  // Works in browser (window.crypto.subtle) and Node.js 18+ (globalThis.crypto.subtle)
  const subtle =
    (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) ||
    (typeof window !== "undefined" && window.crypto?.subtle);
  if (!subtle) throw new Error("Web Crypto API not available");
  return subtle;
};

const importKey = async (
  usage: "encrypt" | "decrypt"
): Promise<CryptoKey> => {
  const subtle = getSubtle();
  const rawKey = hexToBytes(KEY_HEX).buffer as ArrayBuffer;
  return subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-CBC" },
    false,
    [usage]
  );
};

export const encryptData = async (data: any): Promise<string> => {
  const subtle = getSubtle();
  const key = await importKey("encrypt");
  const iv = hexToBytes(IV_HEX).buffer as ArrayBuffer;
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await subtle.encrypt({ name: "AES-CBC", iv }, key, encoded);
  return bytesToHex(new Uint8Array(encrypted));
};

export const decryptData = async (encryptedHex: string): Promise<any> => {
  const subtle = getSubtle();
  const key = await importKey("decrypt");
  const iv = hexToBytes(IV_HEX).buffer as ArrayBuffer;
  const encryptedBytes = hexToBytes(encryptedHex).buffer as ArrayBuffer;
  const decrypted = await subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encryptedBytes
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
};