// src/qr/generateFile.ts
import QRCode from "qrcode";
import { resolve } from "node:path";

/**
 * @function generateQRCodeFile
 * @description 将数字写入二维码并生成 PNG 文件
 * @param {number|string} value - 数字或可序列化内容
 * @param {string} filename - 输出文件名
 */
export async function generateQRCodeFile(
  value: number | string,
  filename: string
): Promise<void> {
  const output = resolve(process.cwd(), filename);

  await QRCode.toFile(output, String(value), {
    type: "png",
    width: 300,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
