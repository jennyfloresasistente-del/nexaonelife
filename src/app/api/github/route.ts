import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: NextRequest) {
  try {
    const { token, repo, html, filename = "index.html", message = "App generada por Nexa One Life" } = await req.json();

    if (!token || !repo || !html) {
      return NextResponse.json({ error: "Faltan parámetros: token, repo, html" }, { status: 400 });
    }

    const octokit = new Octokit({ auth: token });

    // Verificar usuario
    const { data: user } = await octokit.users.getAuthenticated();
    const owner = user.login;

    // Verificar si el repo existe, si no, crearlo
    let repoExists = false;
    try {
      await octokit.repos.get({ owner, repo });
      repoExists = true;
    } catch {
      // Crear el repo
      await octokit.repos.createForAuthenticatedUser({
        name: repo,
        description: "App generada por Nexa One Life",
        auto_init: true,
        private: false,
      });
      // Esperar un momento para que GitHub inicialice el repo
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Obtener el SHA del archivo si existe (para actualizarlo)
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filename,
      });
      if (!Array.isArray(data) && data.type === "file") {
        sha = data.sha;
      }
    } catch {
      // El archivo no existe, se creará nuevo
    }

    // Subir el archivo
    const content = Buffer.from(html).toString("base64");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filename,
      message,
      content,
      ...(sha ? { sha } : {}),
    });

    // URL de GitHub Pages
    const pagesUrl = `https://${owner}.github.io/${repo}/`;
    const repoUrl = `https://github.com/${owner}/${repo}`;

    // Intentar habilitar GitHub Pages
    try {
      await octokit.repos.createPagesSite({
        owner,
        repo,
        source: { branch: "main", path: "/" },
      });
    } catch {
      // Ya estaba habilitado o no se puede habilitar
    }

    return NextResponse.json({
      ok: true,
      owner,
      repo,
      repoUrl,
      pagesUrl,
      created: !repoExists,
    });
  } catch (err: unknown) {
    console.error("GitHub API error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
