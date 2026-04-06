import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { PLANES } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { planId, userId = "guest" } = await req.json();

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago no configurado. Agrega MERCADOPAGO_ACCESS_TOKEN al .env.local" },
        { status: 500 }
      );
    }

    const plan = PLANES.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 400 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nexaoneia.com";

    const result = await preference.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `Nexa One Life — Plan ${plan.nombre} (${plan.creditos} créditos)`,
            description: plan.descripcion,
            quantity: 1,
            unit_price: plan.precio,
            currency_id: "MXN",
          },
        ],
        back_urls: {
          success: `${baseUrl}/pago/exitoso?plan=${plan.id}&creditos=${plan.creditos}&userId=${userId}`,
          failure: `${baseUrl}/pago/fallido`,
          pending: `${baseUrl}/pago/pendiente`,
        },
        auto_return: "approved",
        external_reference: `${userId}|${plan.id}|${plan.creditos}`,
        notification_url: `${baseUrl}/api/pago/webhook`,
        statement_descriptor: "NEXAONELIFE",
        metadata: {
          userId,
          planId: plan.id,
          creditos: plan.creditos,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: result.init_point,
      sandboxUrl: result.sandbox_init_point,
      preferenceId: result.id,
    });
  } catch (err: unknown) {
    console.error("Mercado Pago error:", err);
    const msg = err instanceof Error ? err.message : "Error al crear preferencia de pago";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
