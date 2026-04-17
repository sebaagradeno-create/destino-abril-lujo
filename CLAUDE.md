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

## Estrategia de Marketing (MAESTRA)

**Filosofía Central:** Conversión directa, no engagement vano.

**Regla de los 5 Minutos:** Lead sin respuesta en 5 min = 80% menos conversión → Automatizar respuestas.

**Sistema 10/30 (Meta Ads):**
- 10 ángulos estratégicos por campaña
- 3 creatives por ángulo = 30 variaciones
- No segmentar por intereses, solo por contenido
- Dejar 50 conversiones antes de modificar

**Estructura de Contenido 70/30:**
- 70% → Problema/Dolor del cliente
- 30% → Solución

**Calendario 30 días:**
- 50% Contenido de Problema
- 30% Contenido de Solución + Tips
- 10% Contenido de Producto (cómo lo hacemos)
- 10% Mentalidad/Valores

**Para Destino Abril — OATF (Oferta Amigable Tráfico Frío):**
1. **Resultado Soñado:** Vender rápido al mejor precio (o encontrar casa ideal)
2. **Percepción de Realización:** Testimonios/casos de éxito constantes
3. **Reducción de Esfuerzo:** "Nosotros manejamos papeleo y visitas"
4. **Optimización del Tiempo:** Mostrar promedio real de cierre

**Lead Magnet:** Gancho de baja fricción
- Ej: "Auditoría de Perfil Inmobiliario Gratis"

**Reels/Videos:** 10 ángulos x 3 creatives = 30 variaciones

---

## Reglas
- Siempre build + deploy después de cambios en src/
- Haiku para búsquedas y preguntas simples
- Sonnet para código nuevo y sistemas
- No tocar node_modules ni .git
- Contenido alineado con Estrategia Maestra (ver arriba)
