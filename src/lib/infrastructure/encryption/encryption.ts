import crypto from "crypto";

const algorithm = "aes-256-gcm";
const envKey = process.env.ENCRYPTION_KEY;

if (!envKey || envKey.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be exactly 32 characters long");
}

const key = envKey; // Now TypeScript knows this is a string

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.setAAD(Buffer.from("api-pulse", "utf8"));

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAAD(Buffer.from("api-pulse", "utf8"));
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
