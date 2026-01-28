import type { User } from "./user.js";
import { hashPassword as hashPasswordScrypt } from "@/tools/crypto/password";
import { encryptPin } from "@/tools/crypto/pin";
import { genUserId, genUserName } from "@/utils";
import { env } from "@/config/env/index.js";

/**
 * @function userBeforeCreateHook
 * @description 用户模型创建前钩子，用于生成 id 和 name
 * @param {User} user - 用户实例
 */
export function userBeforeCreateHook(user: User): void {
  if (!user.get("id")) {
    user.set("id", genUserId());
  }
  if (!user.get("name")) {
    user.set("name", genUserName());
  }
}

/**
 * @function userBeforeSaveHook
 * @description 用户模型保存前钩子，用于密码和 pin 哈希处理
 * @param {User} user - 用户实例
 */
export async function userBeforeSaveHook(user: User): Promise<void> {
  if (user.changed("password")) {
    const val = user.get("password") as string | null;
    if (val && !val.startsWith("scrypt$")) {
      user.set("password", await hashPasswordScrypt(val));
    }
  }
  if (user.changed("pin")) {
    const val = user.get("pin") as string | null;
    if (val && !val.startsWith("{")) {
      user.set("pin", await encryptPin(val, env.PIN_SECRET));
    }
  }
}
