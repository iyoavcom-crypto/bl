// src/http/express/schemas/crypto.ts
/**
 * @packageDocumentation
 * @module http-schemas-crypto
 * @since 1.3.2 (2025-10-19)
 * @author Z-kali
 * @description 路由入参/出参模式（zod）
 */
export interface THashReq { password: string }
export interface THashRes { hash: string }

export interface TVerifyReq { password: string; hash: string }
export interface TVerifyRes { ok: boolean; needsRehash?: boolean; newHash?: string }

export interface TEncryptReq { plaintext: string; aad?: string }
export interface Payload {
  v: 1;
  alg: "AES-256-GCM";
  kid: string;
  iv: string;
  tag: string;
  ct: string;
  aad?: string;
}
export interface TEncryptRes { payload: Payload }

export interface TDecryptReq { payload: Payload }
export interface TDecryptRes { ok: boolean }
