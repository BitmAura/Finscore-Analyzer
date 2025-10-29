"use client";

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const iv = randomBytes(16);
const password = process.env.ENCRYPTION_KEY || 'default_secret_password_that_is_long_enough'; // Should be in env vars

// The key length is 32 bytes (256 bits)
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;

export async function encrypt(text: string) {
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + cipher.getAuthTag().toString('hex');
}

export async function decrypt(text: string) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.shift()!, 'hex');
    const authTag = Buffer.from(parts.shift()!, 'hex');

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
}

export async function decryptData(encryptedData: string): Promise<string> {
  return decrypt(encryptedData);
}
