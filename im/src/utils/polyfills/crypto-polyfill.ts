/**
 * @packageDocumentation
 * @module utils/polyfills/crypto-polyfill
 * @description 为React Native环境提供Crypto API polyfill
 */

// 检查是否在React Native环境中
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// 创建一个简单的随机数生成器
const createGetRandomValues = () => {
  return (array: Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array): void => {
    for (let i = 0; i < array.length; i++) {
      if (array instanceof Uint8Array || array instanceof Int8Array) {
        array[i] = Math.floor(Math.random() * 256);
      } else if (array instanceof Uint16Array || array instanceof Int16Array) {
        array[i] = Math.floor(Math.random() * 65536);
      } else if (array instanceof Uint32Array || array instanceof Int32Array) {
        array[i] = Math.floor(Math.random() * 4294967296);
      }
    }
  };
};

// 创建一个简单的 UUID 生成器
const createSimpleUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

if (isReactNative) {
  // 如果全局范围内没有crypto对象，则创建一个模拟实现
  if (typeof (global as any).crypto === 'undefined') {
    // 尝试动态导入 uuid (如果可用)
    let uuidGenerator: (() => string) | null = null;
    
    // 异步加载 uuid (不阻塞初始化)
    (async () => {
      try {
        const uuidModule = await import('uuid');
        uuidGenerator = uuidModule.v4;
      } catch {
        // uuid 不可用，使用简单实现
        uuidGenerator = createSimpleUUID;
      }
    })();

    // 创建crypto对象
    (global as any).crypto = {
      getRandomValues: createGetRandomValues(),
      randomUUID: (): string => {
        return uuidGenerator ? uuidGenerator() : createSimpleUUID();
      }
    };
  }
} else if (typeof window !== 'undefined' && typeof (window as any).crypto === 'undefined') {
  // 在浏览器环境中，如果crypto不存在，尝试使用node:crypto（如果在Electron等环境中）
  (async () => {
    try {
      const nodeCrypto = await import('node:crypto');
      (window as any).crypto = {
        getRandomValues: (array: Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array): void => {
          if (array instanceof Uint8Array || array instanceof Int8Array) {
            const buffer = nodeCrypto.randomBytes(array.length);
            array.set(buffer);
          } else if (array instanceof Uint16Array || array instanceof Int16Array) {
            const buffer = nodeCrypto.randomBytes(array.length * 2);
            for (let i = 0; i < array.length; i++) {
              array[i] = buffer.readUInt16BE(i * 2);
            }
          } else if (array instanceof Uint32Array || array instanceof Int32Array) {
            const buffer = nodeCrypto.randomBytes(array.length * 4);
            for (let i = 0; i < array.length; i++) {
              array[i] = buffer.readUInt32BE(i * 4);
            }
          }
        },
        randomUUID: (): string => {
          return nodeCrypto.randomUUID();
        }
      };
    } catch {
      // 如果无法引入node:crypto，创建一个简单的实现
      (window as any).crypto = {
        getRandomValues: createGetRandomValues(),
        randomUUID: createSimpleUUID
      };
    }
  })();
}

/**
 * 确保crypto对象存在
 */
export const ensureCryptoExists = (): void => {
  if (typeof crypto === 'undefined') {
    if (typeof window !== 'undefined') {
      (window as any).crypto = (global as any).crypto;
    } else if (typeof global !== 'undefined') {
      (global as any).crypto = (global as any).crypto;
    }
  }
};

// 自动执行确保crypto存在
ensureCryptoExists();