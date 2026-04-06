import { NextRequest } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Eres Nexa One Life, un asistente experto en desarrollo web. Tu tarea es generar aplicaciones web completas y funcionales en HTML, CSS y JavaScript puro (vanilla JS) en un solo archivo HTML.

REGLAS ESTRICTAS:
1. Siempre responde con UN SOLO bloque de código HTML completo entre \`\`\`html y \`\`\`
2. El HTML debe ser completamente funcional y autocontenido (todo en un archivo)
3. Usa Tailwind CSS via CDN para estilos modernos y atractivos
4. Usa JavaScript vanilla para la lógica (no frameworks externos)
5. El diseño debe ser moderno, profesional y responsive
6. Incluye datos de ejemplo realistas cuando sea necesario
7. Si el usuario pide modificaciones, devuelve el HTML completo actualizado
8. Agrega comentarios en el código para explicar secciones importantes
9. Usa colores atractivos y un diseño visualmente impresionante
10. Asegúrate de que todos los botones e interacciones funcionen correctamente

Después del bloque de código, puedes agregar una breve explicación de lo que construiste (máximo 3 líneas).`;

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Mensajes inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();

    if (model === "claude") {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key de Anthropic no configurada" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const client = new Anthropic({ apiKey });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await client.messages.stream({
              model: "claude-opus-4-5",
              max_tokens: 8192,
              system: SYSTEM_PROMPT,
              messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            });

            for await (const chunk of response) {
              if (
                chunk.type === "content_block_delta" &&
                chunk.delta.type === "text_delta"
              ) {
                controller.enqueue(encoder.encode(chunk.delta.text));
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    } else {
      // OpenAI (default)
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key de OpenAI no configurada" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const client = new OpenAI({ apiKey });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await client.chat.completions.create({
              model: "gpt-4o",
              max_tokens: 8192,
              stream: true,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.map((m: { role: string; content: string }) => ({
                  role: m.role as "user" | "assistant",
                  content: m.content,
                })),
              ],
            });

            for await (const chunk of response) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    }
  } catch (error) {
    console.error("Error en /api/generate:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
