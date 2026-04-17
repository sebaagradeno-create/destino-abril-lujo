# CLAUDE.md — Destino Abril

## Proyecto
Inmobiliaria premium Uruguay. Cliente de Automatizame. Web + CRM + agentes IA.

## Rutas clave
- Repo: `d:\AGENCIA MASTER\01_Clientes_Activos\destino-abril\`
- Source: `src/` (React + Vite + Tailwind)
- Build: `npm run build` → genera `dist/`
- Deploy: `scp -r dist/. root@72.62.13.132:/root/sites/destino-abril/`
- URL: `https://destino-abril.automatizameuy.com`
- Server VPS: `/root/sites/destino-abril/server.js` puerto 4041 (systemd: `destino-abril`)

## Archivos importantes
- `src/pages/Landing.jsx` — página principal con formulario de contacto
- `src/pages/CRM.jsx` — panel de leads (password: `destino2026`)
- `src/components/Chatbot.jsx` — chatbot con flujo completo de calificación
- `src/context/CRMContext.jsx` — lógica de leads → n8n → Supabase
- `src/services/aiService.js` — llama a Gemini (Google API key adentro)
- `src/supabaseClient.js` — Supabase URL y key

## Flujo de leads
Chatbot/Formulario → POST `https://n8n.automatizameuy.com/webhook/destino-abril-lead` → PostgreSQL tabla `leads_destino_abril` + Telegram notificación → Supabase (backup)

## n8n workflows
- Lead receptor web: `YY4f8tzNtKawLwaO` (activo)
- Instagram DM Bot ARIA: `daySEvfuE1WIgmH8` (pausado — falta conectar cuenta IG)
- Scrapers MeLi/InfoCasas/Gallito: varios en pausa, activar con cuidado

## PostgreSQL (mismo VPS que Automatizame)
- Tabla leads: `leads_destino_abril`
- Tabla propiedades: `propiedades_inmobiliaria`
- Credencial n8n: `rfMpsEVls9DDGX`

## Instagram (pendiente)
- Workflow creado y listo
- Webhook URL: `https://n8n.automatizameuy.com/webhook/destino-abril-instagram`
- Necesita: cuenta IG conectada en n8n + configurar Meta Business webhook

## Supabase
- URL: `https://hxskblwcxgaosafxbygb.supabase.co`
- Tabla: `leads`

## Reglas
- Siempre build + deploy después de cambios en src/
- Haiku para búsquedas y preguntas simples
- Sonnet para código nuevo y sistemas
- No tocar node_modules ni .git
