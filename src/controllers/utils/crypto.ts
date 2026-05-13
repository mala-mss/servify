/**
 * Crypto utility for End-to-End Encryption (E2EE)
 * Using Web Crypto API and IndexedDB
 */

const DB_NAME = 'FamilyCareCrypto';
const STORE_NAME = 'privateKeys';

// Helper to convert Uint8Array to Base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper to convert Base64 to Uint8Array
const base64ToBuffer = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Open IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

interface KeyBundle {
  privateKey: CryptoKey;
  publicKeyBase64: string;
}

export const saveKeyPair = async (userId: number, privateKey: CryptoKey, publicKeyBase64: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const bundle: KeyBundle = { privateKey, publicKeyBase64 };
    const request = store.put(bundle, userId.toString());
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getKeyPair = async (userId: number): Promise<KeyBundle | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userId.toString());
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

// Keep old functions for backward compatibility or simple migration
export const getPrivateKey = async (userId: number): Promise<CryptoKey | null> => {
  const bundle = await getKeyPair(userId);
  return bundle ? bundle.privateKey : null;
};

export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  );
};

export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return bufferToBase64(exported);
};

export const importPublicKey = async (base64Key: string): Promise<CryptoKey> => {
  const bytes = base64ToBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
};

export const deriveSharedSecret = async (
  privateKey: CryptoKey,
  publicKey: CryptoKey
): Promise<CryptoKey> => {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptMessage = async (
  text: string,
  derivedKey: CryptoKey
): Promise<{ encrypted_content: string; iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    derivedKey,
    data
  );

  return {
    encrypted_content: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer),
  };
};

export const decryptMessage = async (
  encryptedBase64: string,
  ivBase64: string,
  derivedKey: CryptoKey
): Promise<string> => {
  const encryptedBytes = base64ToBuffer(encryptedBase64);
  const ivBytes = base64ToBuffer(ivBase64);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
    },
    derivedKey,
    encryptedBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

