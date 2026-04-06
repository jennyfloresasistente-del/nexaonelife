import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook Mercado Pago:", JSON.stringify(body));

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) return NextResponse.json({ ok: false }, { status: 500 });

    if (body.type === "payment" && body.data?.id) {
      const client = new MercadoPagoConfig({ accessToken });
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: body.data.id });

      if (payment.status === "approved") {
        const ref = payment.external_reference || "";
        const [userId, planId, creditosStr] = ref.split("|");
        const creditos = parseInt(creditosStr || "0", 10);

        console.log(`✅ Pago aprobado: userId=${userId}, plan=${planId}, créditos=${creditos}`);
        // En producción aquí actualizarías tu base de datos
        // Por ahora el cliente maneja los créditos en localStorage
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 200 }); // Siempre 200 para MP
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook activo" });
}
