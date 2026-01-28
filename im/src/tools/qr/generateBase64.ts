// src/qr/generateBase64.ts
import QRCode from "qrcode";

/**
 * @function generateQRCodeBase64
 * @description 将数字转换为 Base64 QRCode
 * @param {number|string} value
 * @returns {Promise<string>} data:image/png;base64,...
 */
export async function generateQRCodeBase64(
  value: number | string
): Promise<string> {
  return QRCode.toDataURL(String(value), {
    width: 300,
    margin: 1,
  });
}
