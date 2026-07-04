# Progressive — Plan del proyecto

> Meta-framework / librería que une **Angular (SSR) + NestJS** en un solo repo y un
> solo proceso Node.js. La idea de Next.js, pero para el ecosistema Angular + Nest.
>
> **Autor:** Rafael · **Estado:** Fase 0 (arranque) · **Fecha:** 2026-07-03

---

## 0. Cómo leer este plan

A lo largo del documento vas a ver dos marcadores. Es clave que los distingas:

- 🛑 **HUMANO (TÚ)** → un paso que solo tú puedes hacer (crear cuentas, dar clics en
  la consola de AWS o npm, autorizar accesos, entregarme una URL). Cuando veas 🛑, yo
  me **detengo y espero** a que me confirmes antes de continuar.
- 🤖 **CLAUDE (YO)** → un paso que hago yo (escribir código, crear configuración,
  correr comandos de build).

No asumo que sepas AWS ni npm publishing. Cada término nuevo lo explico en simple la
primera vez que aparece.

---

## 1. Qué es Progressive (y qué NO es)

**La confusión común:** "quiero clonar Next.js para Angular". Eso implicaría bifurcar
el compilador de Angular y reimplementar React Server Components. Inviable para una
persona, e innecesario.

**El reencuadre correcto:** Next.js mezcla 3 capas. Angular + Nest **ya te dan 2 de
las 3 gratis**. Lo único que falta es el *pegamento*:

| Capa | ¿Ya existe en Angular/Nest? |
|------|------------------------------|
| A. Monorepo unificado (un repo) | ✅ Sí (Nx) |
| B. SSR + hidratación + rutas API | ✅ Sí (`@angular/ssr` + NestJS) |
| C. El "pegamento": un solo servidor, un solo build/deploy, tipos compartidos | ❌ **Esto construimos** |

**Progressive = el pegamento oficial Angular-SSR + NestJS que nadie ha empaquetado.**
Existe AnalogJS (parecido), pero usa Nitro como backend, no NestJS. Nuestro nicho:
**NestJS de verdad** (su DI, guards, módulos, GraphQL) unido a Angular SSR.

---

## 2. Dos artefactos, dos "despliegues" (¡CLAVE — no confundir!)

Esto es lo que faltaba en la versión anterior del plan. Hay **dos cosas distintas**,
cada una con su propio "deploy":

### Artefacto A — La LIBRERÍA Progressive (tu producto)
- Es lo que TÚ desarrollas. Vive en el **repo de GitHub `progressive`**.
- "Desplegarla" = **publicarla en npm** con `npm publish`. **No** va a App Runner.
- Son varios paquetes (ver sección 3).

### Artefacto B — Una APP creada con Progressive (una instancia)
- Es lo que obtiene un dev (o tú, para dogfood) al correr
  `npm create progressive@latest mi-app`.
- Es una app fullstack Angular+Nest normal.
- "Desplegarla" = subirla a un host que corra Node → **AWS App Runner** (sección 8).

```
        TÚ desarrollas                        UN DEV consume
   ┌────────────────────┐              ┌──────────────────────────┐
   │  repo: progressive │  npm publish │  npm create progressive  │
   │  (la librería)     │ ───────────▶ │  → genera "mi-app"       │
   └────────────────────┘   → npm      │  → dev la sube a         │
        Artefacto A                     │    App Runner            │
                                        └──────────────────────────┘
                                              Artefacto B
```

> Regla mental: **Librería → npm. App → App Runner.** Nunca al revés.

---

## 3. Nombres en npm (verificado el 2026-07-03)

El nombre pelado `progressive` en npm **ya está ocupado**. No importa: usamos scope +
iniciador, que es la convención correcta igual.

| Paquete | Para qué | Estado |
|---------|----------|--------|
| `create-progressive` | El "iniciador": habilita `npm create progressive@latest` | ✅ **Libre** |
| `@progressive/core` | Núcleo de la librería | ✅ Libre* |
| `@progressive/ssr-nest` | Módulo que monta Angular SSR dentro de Nest | ✅ Libre* |

\* Falta confirmar que el **scope/organización `@progressive`** sea reclamable en npm
(🛑 paso humano, sección 9). Si estuviera tomada, alternativas: `@progressivejs/*` o
usar tu scope de usuario `@turusuario/*`.

**Cómo funciona `npm create progressive`:** por convención de npm, `npm create X`
ejecuta el paquete llamado `create-X`. Como `create-progressive` está libre, el dev
podrá escribir `npm create progressive@latest mi-app` aunque el paquete pelado
`progressive` sea de otra persona (son paquetes diferentes). Igual que `npm create
vite` o `create-next-app`.

---

## 4. Reglas de oro (para no estrellarnos)

- ❌ **No** tocamos el compilador de Angular.
- ❌ **No** clonamos React Server Components / Server Actions.
- ❌ **No** fusionamos los inyectores de DI (Angular y Nest tienen DI separados).
- ✅ Angular **zoneless** desde el día 1 (SSR más limpio).
- ✅ Reutilizar todo lo posible (Nx para el monorepo; OpenAPI/orval o tRPC para el
  puente de tipos). No reinventar.

---

## 5. La arquitectura en una frase

Todo compila a **UN solo proceso Node.js**. NestJS es el único servidor:

```
Internet
   │
   ▼
NestJS (Fastify)  ── enruta cada petición ──┐
   │                                        │
   ├── /api/*  →  Controllers de Nest (REST, WebSockets, GraphQL)
   │
   └── resto   →  AngularNodeAppEngine (SSR de Angular → HTML + hidratación)

libs/shared  →  DTOs y tipos TypeScript usados por AMBOS lados
```

⚠️ Como usa SSR, el servidor Node **debe estar siempre corriendo** → descarta hosting
puramente estático (S3/CloudFront solos no sirven). App Runner mantiene Node vivo.

---

## 6. Estructura del repo (monorepo Nx)

Un solo repo `progressive` que contiene **tanto la librería como una app de ejemplo**
para desarrollarla y probarla (dogfood):

```
progressive/
├── packages/                 ← se PUBLICAN en npm (Artefacto A)
│   ├── create-progressive/   ← el iniciador (Fase 5)
│   ├── core/                 ← @progressive/core
│   └── ssr-nest/             ← @progressive/ssr-nest (Fase 1)
├── examples/
│   ├── playground-web/       ← Angular SSR (build con esbuild/Vite propio de Angular)
│   └── playground-server/    ← NestJS+Fastify; el proceso que REALMENTE corre y
│                                se despliega en App Runner (Artefacto B). Sirve
│                                /api, los assets de playground-web y aloja su
│                                motor SSR.
├── nx.json
└── package.json
```

> Nota: son dos proyectos Nx (no uno) porque Angular y Nest usan toolchains de
> build distintos (esbuild/Vite vs. webpack). Aun así, en producción terminan
> siendo **un solo proceso desplegado**: `playground-server`.

---

## 7. Roadmap por fases

| Fase | Qué entrega | Deploy asociado | Estado |
|------|-------------|-----------------|--------|
| **0** | Spike: Nest + Angular SSR en un proceso (`playground-web` + `playground-server`) | App Runner | ✅ **hecho, corriendo local** |
| 1 | Extraer el pegamento a `@progressive/ssr-nest` | — | ✅ **hecho** (falta 1ª publicación npm) |
| 2 | Dev server con HMR (`npm run dev`) | — | ✅ **hecho** (dos procesos + proxy, ver nota) |
| 3 | Puente tipado front↔back (`@nestjs/swagger` + orval) | — | ✅ **hecho** (falta `@ServerAction`, ver 8c) |
| 4 | Ergonomía de render (render mode por ruta, `@defer`, caché estilo ISR) | — | ✅ **hecho** (streaming SSR queda pendiente) |
| 5 | `create-progressive` → `npm create progressive@latest` funciona | npm | Pendiente |
| 6 | Docs, plantillas, decisión toolkit-sobre-Nx vs. CLI propio | — | Pendiente |

> **npm entra en Fase 1** (primer paquete real que publicar). En Fase 0 solo hacemos
> la app de dogfood y la desplegamos en App Runner; todavía no hay nada que publicar.

---

## 8. Fase 0 — el spike (lo primero)

**Objetivo:** demostrar el diagrama de la sección 5 funcionando de verdad y desplegado.

Criterio de éxito (todo en UN proceso):
1. ✅ Página Angular con SSR real que se hidrata en el navegador (verificado: cero
   errores de consola, sin doble-fetch gracias al transfer-state).
2. ✅ Endpoint `GET /api/health` de NestJS que responde JSON.
3. ✅ La página llama a `/api/health` en el servidor y muestra el dato embebido.
4. ⏳ Desplegada en App Runner con URL pública `https://...awsapprunner.com` — pendiente,
   siguiente paso tras el primer push.

🤖 **CLAUDE hizo:** scaffold Angular 21.2 (SSR, zoneless) + NestJS 11 (Fastify) +
`AngularFallbackFilter` (exception filter que intercepta el 404 de Nest y delega a
`AngularNodeAppEngine`) + `apprunner.yaml`. Detalles técnicos no obvios que quedaron
resueltos (importantes si tocas este código): `RenderMode.Server` en vez de
`Prerender`, un interceptor HTTP que resuelve URLs relativas a absolutas solo en SSR
(Node no tiene `location` implícito), la env var `NG_ALLOWED_HOSTS` (si falta, Angular
degrada en silencio a solo-CSR en vez de fallar), y un `import()` dinámico "escondido"
de TypeScript (vía `new Function`) porque Nest compila a CommonJS pero el bundle SSR de
Angular es ESM puro.

✅ **Verificación:** local, en el navegador (screenshot + consola + red), es suficiente
para cerrar la Fase 0. **App Runner (sección 9) NO es una tarea tuya como creador del
framework** — es la guía de despliegue que le sirve a un dev que consuma Progressive
más adelante. Queda documentada para cuando la necesites (referenciarla en el README,
o probarla tú mismo si algún día quieres validar el flujo completo de un consumidor),
pero no bloquea el avance del roadmap.

---

## 8b. Fase 2 — dev server con HMR ✅ hecho

**Lo que investigamos primero (y por qué NO lo hicimos):** la idea original era
meter el dev-server de Angular (que usa Vite por dentro) como *middleware* dentro
del propio proceso de Nest — un solo puerto también en desarrollo. Se descartó tras
revisar el código fuente de `@angular/build`: la función que arma la configuración
de Vite (`setupServer`) vive en una ruta interna **no exportada ni documentada** del
paquete, y el dev-server siempre crea su servidor Vite y lo pone a escuchar él
mismo, sin dar ningún gancho para interceptarlo antes. Construir sobre eso
significaría depender de internals privados que se pueden romper con cualquier
parche de Angular — no es una base seria para un framework.

**Lo que hicimos en su lugar:** dos procesos en paralelo, con `npm run dev`:
- Angular en `http://localhost:4200` con su dev-server real (HMR completo, sin tocar
  nada) — **este es el puerto que abres en el navegador**.
- NestJS en `http://localhost:3000`.
- El `proxy.config.json` de Angular (función estable y documentada del CLI) reenvía
  `/api/*` a Nest. Desde el navegador se siente como una sola app en un solo puerto.
- Cada proceso arranca con su puerto fijado explícitamente (vía `concurrently`) para
  no depender de variables de entorno ambiente que pudieran filtrarse desde fuera.

**Verificado:** HMR de Angular funcionando (cambio de UI reflejado sin recargar la
página) y reinicio automático de Nest al cambiar código del backend (ambos
confirmados en vivo). En producción esto no cuesta nada — `npm start` sigue siendo
el único proceso real de la sección 8.

---

## 8c. Fase 3 — puente tipado front↔back ✅ hecho

**Decisión: orval, no tRPC.** El plan original dejaba abiertas las dos opciones.
Se eligió orval porque preserva NestJS "de verdad" — controllers, DTOs,
decoradores, exactamente como ya estaban — y solo automatiza la generación de
tipos a partir de eso. tRPC habría significado introducir su propio paradigma de
routers/procedures en paralelo a los controllers, compitiendo con el
posicionamiento de Progressive ("el nicho es NestJS real").

**Cómo funciona (`npm run generate:api`, también corre antes de `build`/`dev`):**
1. `examples/playground-server/scripts/generate-openapi.ts` arranca Nest **sin
   escuchar puerto** (rápido, sin red) y usa `@nestjs/swagger` para construir el
   documento OpenAPI → `examples/playground-server/openapi.json`.
2. `orval.config.ts` lee ese JSON y genera
   `examples/playground-web/src/app/api/generated.ts`.

**El hallazgo que cambió el diseño:** orval ya sabe generar funciones basadas en
`httpResource` (`override.angular.retrievalClient: 'httpResource'`), el mismo
patrón de signals que ya usábamos a mano desde la Fase 0 — no hubo que elegir
entre "lo que ya funciona" y "lo generado", son lo mismo. El componente pasó de
`httpResource<HealthResponse>(() => '/api/health')` (interfaz duplicada a mano) a
`appControllerGetHealthResource()` (tipo `HealthDto` generado desde el DTO real
del backend, cero duplicación).

**Ambos archivos generados (`openapi.json` y `generated.ts`) están en
`.gitignore`** — son artefactos derivados, igual que `dist/`, no código fuente.

**Deuda encontrada de paso (no relacionada, pero bloqueaba verificar el test):**
`tsconfig.spec.json` de `playground-web` nunca había corrido (`nx test` no se
había usado en todo el proyecto hasta ahora) y le faltaba `"lib": ["dom"]` — se
agregó solo ahí, sin tocar la config de build real.

**Pendiente, explícitamente fuera de esta pasada:** el decorador `@ServerAction()`
mencionado en el plan original (que un provider Nest genere directamente el
injectable Angular, sin pasar por OpenAPI) es un diferenciador propio de
Progressive, pero es un salto de complejidad mayor — queda anotado como
evolución futura de esta misma Fase 3, no bloquea el roadmap.

---

## 8d. Fase 4 — ergonomía de render ✅ hecho

Tres piezas, cada una demostrada en vivo en el playground:

**1. Render mode por ruta.** El playground pasó de una sola página a dos, para
poder contrastar de verdad: `/` usa `RenderMode.Server` (SSR fresco + llamada
fresca a `/api/health` en cada request) y `/about` usa `RenderMode.Prerender`
(renderizado una sola vez en `npm run build`, servido después como archivo
estático). Ambos se declaran lado a lado en `app.routes.server.ts`.

**2. `@defer`.** La sección "Under the hood" de la home usa
`@defer (on interaction(...))` — su código no viaja en el bundle inicial ni en
el HTML del SSR, solo se pide al hacer clic. Verificado viendo la petición del
chunk extra en la pestaña de red, disparada únicamente tras el clic.

**3. Caché estilo ISR.** `GET /api/build-info` usa el `CacheInterceptor` nativo
de Nest (`@nestjs/cache-manager`) con TTL de 10s — mismo trade-off que el ISR
de Next.js, sin inventar un primitivo de caché propio. Verificado: valor igual
en clics rápidos consecutivos, valor distinto pasados los 10s.

**El bug real que apareció al construir el demo de prerender (vale la pena
recordarlo):** un campo de componente calculado directo en el constructor
(`new Date().toISOString()`) se **recalcula en el cliente durante la
hidratación** — Angular reutiliza el DOM, pero igual construye la instancia
JS del componente de nuevo en el cliente, y ese campo plano no tiene ningún
mecanismo que lo "congele" cruzando la frontera servidor→cliente. El resultado:
el valor correcto del servidor se veía una fracción de segundo y luego se
sobreescribía con un valor nuevo calculado en el navegador. Se resolvió con
`TransferState`/`makeStateKey` (`about-page.ts`): el servidor calcula y guarda
el valor una vez, el cliente lo lee de ahí en vez de recalcularlo.

**Otro hallazgo menor:** el primer `(click)="..."` real del proyecto hizo
fallar el build — `strictTemplates` necesita tipos DOM para inferir el tipo
del evento, y `tsconfig.base.json` (compartido con proyectos Node) solo tenía
`"lib": ["es2022"]`. Se agregó `"dom"` en `examples/playground-web/tsconfig.json`
(no en la base, para no filtrar globals de navegador a los proyectos Nest).

**Pendiente, no bloqueante:** streaming SSR (Angular ya lo soporta vía
`@defer` + hidratación incremental, pero no se armó un ejemplo dedicado que
muestre el streaming de la respuesta HTTP en sí).

---

## 9. Desplegar una APP en AWS App Runner (Artefacto B)

> Esto es para la app `playground-server` (que aloja también a `playground-web`), y
> en el futuro para cualquier app de un dev. **NO** es para publicar la librería
> (eso es npm, sección abajo).

### 9.1. ¿Qué es App Runner?
Servicio de AWS que toma tu código de GitHub y lo **compila, corre y expone con HTTPS**
sin que administres servidores. Redespliega solo en cada `git push`.

**Glosario AWS:**
- **Región:** zona física de servidores (ej. `us-east-1` = Virginia). Elige una.
- **Servicio:** tu app corriendo en App Runner.
- **Conexión:** enlace seguro de una vez entre AWS y GitHub (para leer el repo).
- **IAM role:** permiso interno que AWS crea casi siempre automático; solo acepta.

### 9.2. `apprunner.yaml` (ya está en el repo, raíz del proyecto)
```yaml
version: 1.0
runtime: nodejs22
build:
  commands:
    build:
      - npm ci
      - npm run build      # construye playground-web Y playground-server
run:
  command: npm start        # node dist/examples/playground-server/main.js
  network:
    port: 3000
  env:
    - name: NODE_ENV
      value: production
    - name: PORT
      value: "3000"
    - name: NG_ALLOWED_HOSTS   # ver nota de seguridad más abajo
      value: "*"
```

⚠️ **Nota de seguridad — `NG_ALLOWED_HOSTS`:** Angular rechaza (con degradación
silenciosa a solo-CSR) peticiones cuyo header `Host` no esté en esta lista. Como no
conocemos el dominio de App Runner hasta después del primer deploy, arrancamos con
`"*"` (permite cualquier host). Una vez tengas la URL pública (paso 9.3.5), **vuelve
aquí y cámbialo por el dominio real** (ej. `xxxx.us-east-1.awsapprunner.com`) para
cerrar ese hueco de seguridad.

### 9.3. Pasos en la consola AWS
🛑 **Paso 1 — Entrar:** https://console.aws.amazon.com → región **us-east-1** → busca
   **App Runner**.
🛑 **Paso 2 — Crear servicio + conectar GitHub:** *Create service* → *Source code
   repository* → *Add new* (autoriza **AWS Connector for GitHub**, elige el repo
   `progressive`) → rama **main** → *Deployment trigger* **Automatic**.
🛑 **Paso 3 — Build:** elige **Use a configuration file** (usa el `apprunner.yaml`).
🛑 **Paso 4 — Servicio:** name `progressive-playground`, **1 vCPU / 2 GB**, port
   **3000**, resto por defecto → *Create & deploy*.
🛑 **Paso 5 — Esperar (~5–10 min):** estado **Running** → copia la **Default domain**
   `https://xxxx.us-east-1.awsapprunner.com` → ábrela. 🎉

### 9.4. Actualizaciones y costos
- Futuras actualizaciones: solo `git push` → redespliega solo.
- App Runner mantiene 1 instancia viva (pequeño costo aun ocioso). Con tus créditos es
  despreciable. Botón **Pause** para frenar el gasto.

---

## 10. Publicar la LIBRERÍA en npm (Artefacto A) — empieza en Fase 1

Aquí "desplegar" = `npm publish`. **No es App Runner.**

### 10.1. Qué publicaremos
- Fase 1: `@progressive/ssr-nest` (el módulo runtime del pegamento).
- Fase 5: `create-progressive` (para `npm create progressive@latest`).

### 10.2. Preparativos (una sola vez)
🛑 **npm-1:** crea cuenta en https://npmjs.com → verifica email → **activa 2FA**.
🛑 **npm-2:** crea una **organización gratis** llamada `progressive` en
   https://www.npmjs.com/org/create (esto habilita el scope `@progressive/*`). Si el
   nombre está tomado, avísame y usamos `@progressivejs` o tu scope de usuario.
🤖 **npm-3:** yo dejo cada `package.json` listo (`name`, `version`, `exports`,
   `files`, y `publishConfig: { access: "public" }` para que el scoped sea público).

### 10.3. Primera publicación (manual, sencilla)
🛑 **pub-1:** en tu terminal, `npm login` (te pedirá usuario/clave/2FA).
🤖 **pub-2:** yo corro el build de los paquetes.
🛑 **pub-3:** `npm publish --access public` (el `--access public` es obligatorio la
   primera vez para paquetes con scope). O `nx release` que lo automatiza en monorepo.
✅ Resultado: tu paquete queda visible en `https://www.npmjs.com/package/@progressive/ssr-nest`
   y cualquiera puede `npm i @progressive/ssr-nest`.

### 10.4. Automatización futura (opcional)
Más adelante: **GitHub Actions + npm automation token** para publicar automáticamente
en cada release/tag, y `changesets` o `nx release` para el versionado semver.

---

## 11. Paso GitHub — crear el repositorio ✅ hecho

Repo: **https://github.com/rortizv/progressive**

---

## 12. Estado actual

- [x] Plan creado (con distinción librería-npm vs. app-App Runner).
- [x] Repo GitHub creado: https://github.com/rortizv/progressive
- [x] 🤖 Scaffold Fase 0 (`playground-web` + `playground-server`), verificado
  funcionando localmente (SSR real, hidratación sin errores, `/api/health` en vivo).
- [x] 🤖 `apprunner.yaml` creado (queda como doc de referencia para futuros
  consumidores; no es tarea del creador).
- [x] 🤖 Primer push a GitHub.
- [x] **Fase 0 cerrada.**
- [x] 🤖 `@progressive/ssr-nest` extraída como librería publicable en
  `packages/ssr-nest`, con API pública `mountAngularSsr(app, { angularDistPath })`.
  `playground-server` ya la consume (no más código duplicado) y se verificó
  funcionando idéntico al spike de Fase 0. Push hecho.
- [ ] 🛑 Preparativos npm (sección 10.2): cuenta npm + 2FA, crear org `@progressive`.
- [ ] 🛑 Primera publicación real (`npm publish --access public`, sección 10.3).
- [x] 🤖 **Fase 2 cerrada:** `npm run dev` — Angular (`:4200`, HMR real) + Nest
  (`:3000`) en paralelo, proxy vía `proxy.config.json`. HMR de UI y reinicio
  automático de Nest verificados en vivo (sección 8b).
- [x] 🤖 **Fase 3 cerrada:** `@nestjs/swagger` + orval generan
  `examples/playground-web/src/app/api/generated.ts` (funciones `httpResource`
  tipadas) a partir del DTO real del backend. Cero tipos duplicados a mano.
  Verificado en vivo (build de producción + tests unitarios). Detalle en 8c.
- [x] 🤖 **Fase 4 cerrada:** render mode por ruta (`/` SSR vs. `/about`
  prerender), `@defer (on interaction)`, y caché estilo ISR en
  `/api/build-info` con `CacheInterceptor`. Los tres verificados en vivo.
  Streaming SSR queda pendiente (no bloqueante). Detalle en 8d.

> App Runner (sección 9) y `NG_ALLOWED_HOSTS` con dominio real quedan en pausa: son
> para cuando un dev despliegue SU app hecha con Progressive, no para ti ahora.

### Nota técnica de la extracción (Fase 1)

`@nx/webpack`'s `NxAppWebpackPlugin` externaliza por defecto **todo** paquete de
terceros (`externalDependencies: 'all'`), asumiendo que vive en `node_modules` con
un build ya compilado. Pero `@progressive/ssr-nest`, al no estar publicada aún, solo
existe como symlink de npm workspaces apuntando a su código TypeScript fuente (sin
compilar) — así que dejarla externalizada rompe el `require()` en tiempo de
ejecución. Se resolvió listando explícitamente en `externalDependencies` solo los
paquetes de terceros reales (`@nestjs/*`, `fastify`, etc.), dejando fuera de esa
lista a `@progressive/ssr-nest` para que se empaquete inline desde su fuente. Una vez
publicada en npm de verdad, este workaround deja de ser necesario.
