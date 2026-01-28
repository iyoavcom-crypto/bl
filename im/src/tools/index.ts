export { hashPassword, verifyPassword, verifyPasswordUpgrade } from './crypto/password.js';
export { encryptPin, decryptPin } from './crypto/pin.js';

export {
  JwtService,
  createJwtServiceFromEnv,
  Guards,
  AuthError,
  AuthErrorCode,
  ttlToSeconds,
  nowSec,
  nanoid,
  shortId,
} from './jwt';

export {
  createLogger,
  getLogger,
  setGlobalLogLevel,
  getGlobalLogLevel,
  logError,
  runWithTraceId,
} from './logging/index.js';
export type { LogLevel, Logger, LogContext } from './logging/index.js';
