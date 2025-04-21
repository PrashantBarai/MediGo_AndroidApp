declare module 'react-native-qrcode-image' {
  interface QRCodeOptions {
    width: number;
    height: number;
    color?: string;
    backgroundColor?: string;
  }

  export function generateQRCode(
    data: string,
    filePath: string,
    options: QRCodeOptions
  ): Promise<void>;
} 