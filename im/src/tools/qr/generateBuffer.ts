// src/qr/generateBuffer.ts
import QRCode from "qrcode";

/**
 * @function generateQRCodeBuffer
 * @description 生成二维码 Buffer
 * @param {number|string} value
 */
export async function generateQRCodeBuffer(
  value: number | string
): Promise<Buffer> {
  return QRCode.toBuffer(String(value), {
    type: "png",
    width: 256,
  });
}
