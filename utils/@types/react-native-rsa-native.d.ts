declare module 'react-native-rsa-native' {
  const RNRSA: {
    generateKeys: (keySize: number) => Promise<{ private: string; public: string }>;
    encrypt: (text: string, publicKey: string) => Promise<string>;
    decrypt: (encrypted: string, privateKey: string) => Promise<string>;
    sign: (
      message: string,
      privateKey: string,
      algorithm: 'SHA256withRSA' | 'SHA512withRSA' | 'SHA1withRSA'
    ) => Promise<string>;
    verify: (
      signature: string,
      message: string,
      publicKey: string,
      algorithm: 'SHA256withRSA' | 'SHA512withRSA' | 'SHA1withRSA'
    ) => Promise<boolean>;
  };
  export default RNRSA;
}
