import { NextRequest, NextResponse } from "next/server";

// Almacenamiento en memoria (en producción usar una DB)
const appsPublicadas = new Map<string, { html: string; titulo: string; fecha: string; autor?: string }>();

function generarSlug(titulo: string): string {
  const base = titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const sufijo = Math.random().toString(36).slice(2, 7);
  return `${base}-${sufijo}`;
}

export async function POST(req: NextRequest) {
  try {
    const { html, titulo, autor } = await req.json();
    if (!html) return NextResponse.json({ error: "HTML requerido" }, { status: 400 });

    const slug = generarSlug(titulo || "mi-app");
    appsPublicadas.set(slug, {
      html,
      titulo: titulo || "Mi App",
      fecha: new Date().toISOString(),
      autor,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nexaoneia.com";
    const url = `https://preview.nexaoneia.com/${slug}`;

    return NextResponse.json({ slug, url });
  } catch {
    return NextResponse.json({ error: "Error al publicar" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug requerido" }, { status: 400 });

  const app = appsPublicadas.get(slug);
  if (!app) return NextResponse.json({ error: "App no encontrada" }, { status: 404 });

  return NextResponse.json(app);
}
