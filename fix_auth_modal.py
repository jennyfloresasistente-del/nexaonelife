with open("/home/ubuntu/nexaone/src/app/page.tsx", "r") as f:
    content = f.read()

start_marker = "      {/* ── MODAL LOGIN"
end_marker = "      )}\n    </div>\n  );\n}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx == -1 or end_idx == -1:
    print("ERROR: markers not found")
    exit(1)

new_modal = """      {/* ── MODAL AUTH (LOGIN / REGISTRO) ─────────────────────────────── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)" }}
          onClick={() => setShowLoginModal(false)}>
          <div className="relative w-full max-w-sm rounded-2xl p-6 fade-in"
            style={{ background: "#0a0a0f", border: "1px solid rgba(124,58,237,0.35)", boxShadow: "0 0 80px rgba(124,58,237,0.2)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Cerrar */}
            <button onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
              style={{ color: "#475569", background: "rgba(255,255,255,0.05)" }}>
              <X size={14} />
            </button>

            {/* Icono */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
                {authMode === "login" ? <LogIn size={24} color="white" /> : <UserCircle size={24} color="white" />}
              </div>
              <h2 className="text-xl font-black text-white">
                {authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h2>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                {authMode === "login" ? "Accede a tu cuenta de Nexa One Life" : "Regístrate gratis en Nexa One Life"}
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-3 mb-4">
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={authNombre}
                  onChange={(e) => setAuthNombre(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", caretColor: "#7c3aed" }}
                />
              )}
              <input
                type="email"
                placeholder="tu@correo.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", caretColor: "#7c3aed" }}
              />
              <input
                type="password"
                placeholder={authMode === "register" ? "Contraseña (mín. 6 caracteres)" : "Contraseña"}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", caretColor: "#7c3aed" }}
              />
            </div>

            {/* Error */}
            {authError && (
              <div className="mb-3 px-3 py-2 rounded-xl text-xs font-medium"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
                {authError}
              </div>
            )}

            {/* Botón principal */}
            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white mb-3 transition-all"
              style={{
                background: authLoading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#06b6d4)",
                boxShadow: authLoading ? "none" : "0 0 20px rgba(124,58,237,0.35)",
              }}>
              {authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {authMode === "login" ? "Verificando..." : "Creando cuenta..."}
                </span>
              ) : (
                authMode === "login" ? "Entrar" : "Crear cuenta gratis"
              )}
            </button>

            {/* Cambiar modo */}
            <p className="text-center text-xs" style={{ color: "#475569" }}>
              {authMode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <span className="cursor-pointer font-semibold" style={{ color: "#a78bfa" }}
                    onClick={() => { setAuthMode("register"); setAuthError(""); }}>
                    Regístrate gratis
                  </span>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <span className="cursor-pointer font-semibold" style={{ color: "#a78bfa" }}
                    onClick={() => { setAuthMode("login"); setAuthError(""); }}>
                    Inicia sesión
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}"""

new_content = content[:start_idx] + new_modal
with open("/home/ubuntu/nexaone/src/app/page.tsx", "w") as f:
    f.write(new_content)

print("SUCCESS: auth modal replaced")
