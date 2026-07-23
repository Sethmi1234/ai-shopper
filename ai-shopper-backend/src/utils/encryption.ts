import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "c6a412d1babeae1d8cdbe7ee00f9deb55da8f53c2558d7646bdf6a3dab684128"; // 32 bytes hex
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || "450f050d931a9c716a99cba67387e7ac"; // 16 bytes hex

const ALGORITHM = "aes-256-cbc";

export const encryptData = (data: any): string => {
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error("Encryption configuration missing");
  }

  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ENCRYPTION_IV, "hex");
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

export const decryptData = (encryptedText: string): any => {
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error("Encryption configuration missing");
  }

  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = Buffer.from(ENCRYPTION_IV, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
};
