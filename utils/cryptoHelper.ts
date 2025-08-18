// utils/cryptoHelpers.ts
import forge from "node-forge";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Generate or reuse an RSA key pair
export async function getOrCreateRSAKeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const cachedPrivate = await AsyncStorage.getItem("priKey");
  const cachedPublic = await AsyncStorage.getItem("pubKey");

  if (cachedPrivate && cachedPublic) {
    return { privateKey: cachedPrivate, publicKey: cachedPublic };
  }

  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, async (err, keys) => {
      if (err) {
        reject(new Error("Failed to generate RSA key pair: " + err.message));
      } else {
        const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
        const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);

        await AsyncStorage.setItem("priKey", privateKeyPem);
        await AsyncStorage.setItem("pubKey", publicKeyPem);

        resolve({ privateKey: privateKeyPem, publicKey: publicKeyPem });
      }
    });
  });
}

// Decrypt AES key
export function decryptAESKey(encryptedAesKeyBase64: string, privateKeyPem: string): string {
  try {
    const encrypted = forge.util.decode64(encryptedAesKeyBase64);
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    return privateKey.decrypt(encrypted, "RSA-OAEP");
  } catch (error) {
    throw new Error("Failed to decrypt AES key: " + (error as Error).message);
  }
}

// AES-GCM encryption
export function encryptWithAesGCM(data: string, aesKey: string): string {
  const iv = forge.random.getBytesSync(12);
  const cipher = forge.cipher.createCipher("AES-GCM", aesKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(data, "utf8"));
  cipher.finish();
  const ciphertext = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();
  return forge.util.encode64(iv + ciphertext + tag);
}

// AES-GCM decryption
export function decryptWithAesGCM(encryptedBase64: string, aesKey: string): string {
  try {
    const bytes = forge.util.decode64(encryptedBase64);
    const iv = bytes.slice(0, 12);
    const tag = bytes.slice(-16);
    const ciphertext = bytes.slice(12, -16);
    const decipher = forge.cipher.createDecipher("AES-GCM", aesKey);
    decipher.start({
      iv,
      tagLength: 128,
      tag: forge.util.createBuffer(tag),
    });
    decipher.update(forge.util.createBuffer(ciphertext));
    if (!decipher.finish()) throw new Error("Decryption failed");
    return decipher.output.toString();
  } catch (error) {
    throw new Error("Failed to decrypt with AES-GCM: " + (error as Error).message);
  }
}
