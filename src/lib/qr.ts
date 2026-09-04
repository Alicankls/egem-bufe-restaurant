import QRCode from 'qrcode'

export async function generateQrSvg(
  url: string,
  options?: { margin?: number; color?: { dark?: string; light?: string } }
): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    margin: options?.margin ?? 1,
    color: {
      dark: options?.color?.dark ?? '#072138',
      light: options?.color?.light ?? '#ffffff',
    },
  })
}
