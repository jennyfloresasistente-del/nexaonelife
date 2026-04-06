# Guía de Despliegue — Nexa One Life en nexaoneia.com

## Paso 1 — Subir el proyecto a Netlify

1. Ve a **app.netlify.com** e inicia sesión
2. Haz clic en **"Add new site" → "Deploy manually"**
3. Arrastra el archivo **`nexaone_project.zip`** a la zona de carga
4. Netlify desplegará el proyecto automáticamente

---

## Paso 2 — Configurar variables de entorno en Netlify

En el panel de Netlify ve a:
**Site settings → Environment variables → Add variable**

Agrega estas variables exactamente:

| Variable | Valor |
|----------|-------|
| `OPENAI_API_KEY` | `sk-proj-EBHmQJTF...` (tu key de OpenAI) |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-qDZ20...` (tu key de Anthropic) |
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-5176517905...` (tu token de MP) |
| `ADMIN_EMAIL` | `abrahamreyesperez804@gmail.com` |
| `ADMIN_PASSWORD` | `nexa2024admin` |
| `NEXT_PUBLIC_BASE_URL` | `https://nexaoneia.com` |

---

## Paso 3 — Conectar tu dominio nexaoneia.com

1. En Netlify ve a **Site settings → Domain management → Add domain**
2. Escribe `nexaoneia.com` y haz clic en **Verify**
3. Netlify te dará los **nameservers** o un **registro CNAME**
4. Ve al panel donde compraste el dominio y actualiza los DNS

### Subdominios recomendados

Crea estos registros CNAME en tu DNS:

| Subdominio | Apunta a |
|------------|----------|
| `app.nexaoneia.com` | `tu-sitio.netlify.app` |
| `preview.nexaoneia.com` | `tu-sitio.netlify.app` |
| `admin.nexaoneia.com` | `tu-sitio.netlify.app` |

---

## Paso 4 — Configurar Mercado Pago para producción

1. En tu cuenta de Mercado Pago ve a **Credenciales → Producción**
2. Asegúrate de que el Access Token sea el de **producción** (no sandbox)
3. Configura el webhook en Mercado Pago:
   - URL: `https://nexaoneia.com/api/pago/webhook`
   - Eventos: `payment`

---

## URLs finales de tu plataforma

| Sección | URL |
|---------|-----|
| Plataforma principal | `https://nexaoneia.com` |
| Panel admin | `https://nexaoneia.com/admin` |
| Preview de apps | `https://nexaoneia.com/preview/[slug]` |

---

## Credenciales de acceso

- **Admin:** `abrahamreyesperez804@gmail.com` / `nexa2024admin`
- **PIN aprobación:** `1516` (para la app de rehabilitación)
- **Créditos gratis:** 5 por usuario nuevo

---

## Soporte

Si tienes dudas durante el despliegue, contacta a tu desarrollador con este archivo.
