# Crypto 工具模块

- 提供 AES-256-GCM 加/解密、口令 `scrypt` 哈希校验、PIN 加/解密、密钥提供器，以及 HTTP 交互用的类型模式。
- 设计原则：安全默认、常量时间比较、明确的环境配置、可扩展的密钥管理。

## 目录结构

- `aesgcm.ts`：AES-256-GCM 对称加密实现（随机 IV，16B Tag，可选 AAD）
- `password.ts`：基于 `scrypt` 的口令哈希与校验（支持 pepper 与参数升级）
- `pin.ts`：基于字符串 `secret` 派生密钥，对 PIN 进行 AES-GCM 加/解密
- `kms.ts`：密钥提供器接口与 `EnvKeyProvider` 默认实现（读取 `process.env`）
- `src/settings/env/crypto-env/`：加载与校验环境变量（`dotenv`），以及 `CrypEnv` 类型（供密码模块等使用）
- `schemas/`：HTTP 层入参/出参 TypeScript 接口（便于路由校验集成）
- `index.ts`：集中导出密码与 PIN 常用 API

## 快速开始

- 安装与环境准备：
  - 确保 Node 22（ESM，ES2022）。
  - 在 `.env` 或部署环境中设置：
    - `PASSWORD_PEPPER`：≥16 字符，用于 `scrypt` 增强。
    - `DATA_MASTER_KEY`：32 字节 `base64url`，用于对称加密主密钥（KMS）。
    - `DATA_MASTER_KEY_KID`：可选，自定义主密钥 KID。
    - `KEY_ROTATION_DAYS`：可选，密钥轮换提示间隔（默认 90）。
    - `PIN_SECRET`：≥16 字符，用于 PIN 加/解密。

- 示例：生成与验证口令哈希

```ts
import { hashPassword, verifyPassword, verifyPasswordUpgrade } from "./password.js";

const hash = await hashPassword("P@ssw0rd!");
const ok = await verifyPassword("P@ssw0rd!", hash);
const { ok: ok2, needsRehash, newHash } = await verifyPasswordUpgrade("P@ssw0rd!", hash);
```

- 示例：PIN 加/解密（序列化载荷 JSON）

```ts
import { encryptPin, decryptPin } from "./pin.js";

const payloadJson = await encryptPin("123456", process.env.PIN_SECRET!);
const pin = await decryptPin(payloadJson, process.env.PIN_SECRET!);
```

- 示例：直接使用 AES-GCM（含 AAD）

```ts
import { encrypt, decrypt } from "./aesgcm.js";
import { EnvKeyProvider } from "./kms.js";

const kms = new EnvKeyProvider();
const key = await kms.getActiveKey();
const aad = Buffer.from("order#123:AUD:web");
const payload = encrypt(Buffer.from("hello"), key, aad);
const plain = decrypt(payload, key);
```

## API 参考

- `password.ts`
  - `hashPassword(password: string): Promise<string>` — 生成 `scrypt` 哈希；位置 `api/src/tools/crypto/password.ts:39`
  - `verifyPassword(password: string, stored: string): Promise<boolean>` — 校验哈希；位置 `api/src/tools/crypto/password.ts:55`
  - `verifyPasswordUpgrade(password: string, stored: string): Promise<{ ok: boolean; needsRehash: boolean; newHash?: string }>` — 校验并按当前基线评估是否重算；位置 `api/src/tools/crypto/password.ts:77`
  - 说明：参数基线 `SCRYPT={N:32768,r:8,p:1,keylen:32}`；位置 `api/src/tools/crypto/password.ts:15`

- `aesgcm.ts`
  - `encrypt(plain: Buffer, key: SymmetricKey, aad?: Buffer): AesGcmPayload` — AES-256-GCM 加密；位置 `api/src/tools/crypto/aesgcm.ts:59`
  - `decrypt(payload: AesGcmPayload, key: SymmetricKey): Buffer` — AES-256-GCM 解密；位置 `api/src/tools/crypto/aesgcm.ts:78`
  - `safeKidEqual(a: string, b: string): boolean` — KID 常量时间比较；位置 `api/src/tools/crypto/aesgcm.ts:96`
  - `AesGcmPayload` 载荷结构；位置 `api/src/tools/crypto/aesgcm.ts:33`
  - `SymmetricKey` 对称密钥类型；位置 `api/src/tools/crypto/aesgcm.ts:49`

- `pin.ts`
  - `deriveKeyFromSecret(secret: string, kid = "env:PIN_SECRET"): SymmetricKey` — 由 `secret` 派生 32B 密钥；位置 `api/src/tools/crypto/pin.ts:22`
  - `encryptPin(pin: string, secret: string): Promise<string>` — 加密并返回序列化 JSON；位置 `api/src/tools/crypto/pin.ts:38`
  - `decryptPin(payloadJson: string, secret: string): Promise<string>` — 解密 PIN；位置 `api/src/tools/crypto/pin.ts:53`

- `kms.ts`
  - `interface KeyProvider` — 密钥提供器接口；位置 `api/src/tools/crypto/kms.ts:21`
  - `class EnvKeyProvider implements KeyProvider` — 读取主密钥与轮换配置；位置 `api/src/tools/crypto/kms.ts:45`
    - `constructor()` — 加载 `DATA_MASTER_KEY` 并校验长度；位置 `api/src/tools/crypto/kms.ts:55`
    - `getActiveKey(): Promise<SymmetricKey>` — 获取当前激活密钥；位置 `api/src/tools/crypto/kms.ts:72`
    - `getKeyById(kid: string): Promise<SymmetricKey|null>` — 按 KID 获取历史密钥；位置 `api/src/tools/crypto/kms.ts:82`
    - `rotateIfNeeded(): Promise<void>` — 轮换占位；位置 `api/src/tools/crypto/kms.ts:91`

- `settings/env/crypto-env/index.ts`
  - `loadCryptoEnv(): Readonly<CrypEnv>` — 读取并校验环境配置；位置 `api/src/settings/env/crypto-env/index.ts:16`
  - `cryptoEnv` — 冻结的配置实例（模块加载时计算）；位置 `api/src/settings/env/crypto-env/index.ts:43`

- `settings/env/crypto-env/types.ts`
  - `interface CrypEnv` — 配置类型；包含 `NODE_ENV`/`PASSWORD_PEPPER?`/`PORT`；位置 `api/src/settings/env/crypto-env/types.ts:12`

- `schemas/index.ts`
  - `THashReq/THashRes` — 口令哈希接口；位置 `api/src/tools/crypto/schemas/index.ts:9`、`api/src/tools/crypto/schemas/index.ts:10`
  - `TVerifyReq/TVerifyRes` — 口令校验与升级提示；位置 `api/src/tools/crypto/schemas/index.ts:12`、`api/src/tools/crypto/schemas/index.ts:13`
  - `TEncryptReq/TEncryptRes` — AES-GCM 加密请求与响应；位置 `api/src/tools/crypto/schemas/index.ts:15`、`api/src/tools/crypto/schemas/index.ts:25`
  - `TDecryptReq/TDecryptRes` — AES-GCM 解密请求与响应；位置 `api/src/tools/crypto/schemas/index.ts:27`、`api/src/tools/crypto/schemas/index.ts:28`

- `index.ts`
  - 导出 `hashPassword/verifyPassword/verifyPasswordUpgrade` 与 `encryptPin/decryptPin`；位置 `api/src/tools/crypto/index.ts:9`、`api/src/tools/crypto/index.ts:10`

## 配置指南

- `PASSWORD_PEPPER`：
  - 用途：增强 `scrypt` 安全性；新哈希要求有效 `pepper`。
  - 约束：长度 ≥16；校验时若缺失将同时尝试“无 pepper”的兼容校验。
  - 相关：`api/src/tools/crypto/password.ts:31`、`api/src/tools/crypto/password.ts:42`。

- `DATA_MASTER_KEY` / `DATA_MASTER_KEY_KID` / `KEY_ROTATION_DAYS`：
  - 用途：`EnvKeyProvider` 从环境读取主密钥与轮换参数。
  - 约束：主密钥必须为 32B `base64url`；位置 `api/src/tools/crypto/kms.ts:60`。

- `PIN_SECRET`：
  - 用途：PIN 加/解密的密钥来源。
  - 约束：长度 ≥16；不足将抛错；位置 `api/src/tools/crypto/pin.ts:24`。

- `NODE_ENV` / `PORT`：
  - 由 `settings/env/crypto-env/index.ts` 进行校验与冻结；位置 `api/src/settings/env/crypto-env/index.ts:16`。

## 最佳实践

- 使用 `AAD` 绑定业务上下文（如订单号与受众），避免明文被跨上下文复用。
- KID 比较使用 `safeKidEqual`，避免侧信道信息泄漏。
- 为旧哈希提供平滑升级：使用 `verifyPasswordUpgrade` 返回 `newHash` 并在用户登录成功后更新。
- 切勿记录或输出密钥与明文敏感信息；避免将 `process.env` 内容写入日志。
- 生产环境实现真实的密钥轮换与持久化存档（`rotateIfNeeded` 为占位）。

## 异常与错误

- `hashPassword`：当口令为空或 `PASSWORD_PEPPER` 无效（<16）抛错。
- `verifyPassword/verifyPasswordUpgrade`：输入格式非法时返回 `false` 或 `{ ok:false }`，内部捕获异常。
- `EnvKeyProvider.constructor`：缺少或非法 `DATA_MASTER_KEY` 抛错。
- `deriveKeyFromSecret`：`secret` 长度不足抛错。
- `decrypt`：认证失败时抛错；务必正确设置 `aad/tag/iv/kid`。

## 变更与版本

- AES-GCM/密码模块 `since 1.3.2`；PIN 工具 `since 1.3.3`（见各文件头注释）。

## 许可与致谢

- 使用 Node 原生 `crypto` 模块；`dotenv` 仅用于加载环境变量。
- 作者：Z-kali；遵循安全最佳实践与团队命名规范。