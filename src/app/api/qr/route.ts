import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    });

    return NextResponse.json({ qr: qrDataUrl });
  } catch (err) {
    console.error("QR error:", err);
    return NextResponse.json({ error: "Error generando QR" }, { status: 500 });
  }
}
