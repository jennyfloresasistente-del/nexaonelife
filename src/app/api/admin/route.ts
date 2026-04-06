import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nexa2024admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "abrahamreyesperez804@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, email } = body;

    // Validar correo + contraseña
    if (email && email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Correo no autorizado" }, { status: 401 });
    }
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // Las acciones de admin se manejan en el cliente con localStorage
    // Este endpoint solo valida la contraseña y retorna confirmación
    if (action === "verify") {
      return NextResponse.json({ ok: true, message: "Acceso autorizado" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
