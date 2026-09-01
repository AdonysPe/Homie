# Homie

Landing page + web app para **publicar una mascota en adopción**. Un solo objetivo:
que quien tiene que entregar a su mascota pueda publicarla rápido, sin fricción y con
la confianza de que va a llegar a un buen hogar.

Todo el contenido está subordinado a esa acción: cada sección termina en
*"Publicar a mi mascota"*, y el CTA sigue disponible en cualquier punto del scroll.

## Stack

| Área | Elección |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | TailwindCSS con design system propio en `tailwind.config.ts` |
| Animación de UI | Motion / Framer Motion (`whileInView`, `AnimatePresence`, `layout`) |
| Video | Remotion (`RehomingStory`, 11 s, 1080×1080) + `@remotion/player` |
| 3D | Three.js vía React Three Fiber + Drei |
| Formulario | React Hook Form + Zod |
| Estado global | Zustand (un único store: el puente publicación → galería) |

## Scripts

```bash
npm run dev              # servidor de desarrollo
npm run build            # build de producción
npm run lint             # ESLint (flat config de Next 16)
npm run typecheck        # tsc --noEmit
npm run remotion:studio  # editar la pieza animada en Remotion Studio
```

## Estructura

```
src/
├── app/                     # layout, page y estilos globales
├── components/
│   ├── icons/               # set de iconos propio (especies + línea)
│   ├── three/               # escena del hero (huellitas + silueta 3D)
│   └── ui/                  # primitivas puras: Button, TextField, OptionGroup…
├── features/
│   ├── home/                # hero, mosaico, franja, cómo funciona, FAQ, header, footer, CTA
│   ├── pets/                # galería, filtro por especie, store de publicaciones
│   └── publish/             # wizard de publicación (el corazón del producto)
│       ├── components/      # UI: wizard, uploader de fotos, vista previa, éxito
│       ├── hooks/           # usePublishForm, usePetPhotos
│       ├── lib/             # esquema Zod, pasos, defaults, mapeo a publicación
│       └── steps/           # un componente por paso
├── lib/                     # utilidades (cn, format, scroll, catálogo de especies)
├── remotion/                # composición del video compartible
└── types/                   # tipos de dominio
```

Regla de capas: los componentes de `components/` y `steps/` solo pintan; la lógica vive
en `hooks/` y `lib/`. Cada feature es autocontenida y expone lo mínimo hacia afuera.

## El formulario

Cuatro pasos cortos, pensados para completarse en menos de 3 minutos:

1. **Mascota** — especie (7 opciones) y nombre.
2. **Perfil** — edad, tamaño, sexo y convivencia (vacunas, castración, chicos, otras mascotas).
3. **Fotos** — drag & drop con preview, foto principal reordenable, descripción opcional y motivo.
4. **Contacto** — nombre, ciudad, WhatsApp o email, y consentimiento.

Detalles que bajan la fricción:

- Cada paso valida **solo sus campos** (`trigger`), nunca muestra errores de campos no vistos.
- Los valores por defecto ya vienen elegidos por la opción más frecuente.
- `Enter` avanza de paso en lugar de enviar el formulario a medias.
- Vista previa en vivo (`lg+`) de cómo se verá la publicación.
- Al publicar, la mascota aparece primero en la galería, resaltada y "En revisión".

## Movimiento

Cada animación tiene un motivo; ninguna es puro adorno.

| Dónde | Qué hace |
| --- | --- |
| Hero | El mosaico entra escalonado y hace *parallax* suave; el texto cede opacidad al bajar |
| Hero | Subrayado de "nuevo hogar" que se dibuja solo al cargar |
| Ya publicadas | Carrusel continuo que baja de 46 a 9 px/s al pasar el puntero, con rampa suave |
| Header | Barra de progreso de lectura de la página |
| Cómo funciona | Riel de 4 puntos que se dibuja según avanza el scroll |
| Galería / FAQ | Aparición escalonada al entrar en pantalla |
| Huellitas 3D | Se apartan del cursor y vuelven a su sitio |

El carrusel lo mueve un `MotionValue` en vez de una animación CSS: cambiar
`animation-duration` al pasar el puntero provocaría un salto de posición, mientras que
interpolar la velocidad por tiempo frena y acelera sin tirones.

`MotionConfig reducedMotion="user"` desactiva las transformaciones cuando el sistema
pide menos movimiento, y el CSS global anula las animaciones declarativas.

## Ritmo de la página

| Sección | Comportamiento |
| --- | --- |
| Hero | Ocupa exactamente una pantalla (`100svh`), contenido centrado y pista de scroll |
| Ya publicadas | Sección de 165svh con el carrusel anclado (`sticky`) y centrado mientras se hace scroll |
| Publicación | Al menos una pantalla, con el formulario centrado |

El anclaje es `position: sticky` puro: si las animaciones no llegaran a correr,
el contenido igual se ve.

## Cursor

En dispositivos con puntero fino el cursor es una huellita (SVG embebido, sin peticiones):
terracota sobre elementos normales y más grande, oscura y girada sobre lo que se puede
pulsar. Los campos de texto conservan el cursor de escritura y lo deshabilitado, el de
"no permitido".

## Rendimiento

- Three.js y Remotion se cargan con `next/dynamic` (`ssr: false`): no entran en el bundle inicial.
- La escena 3D apaga su `frameloop` cuando el hero sale de pantalla.
- La silueta 3D solo se monta a partir de `lg`; en mobile quedan solo las huellitas.
- Imágenes con `next/image`, `lazy` por defecto y `priority` solo en las primeras.

## Accesibilidad

- Un solo `h1`, jerarquía de encabezados coherente y skip link al formulario.
- Radios y checkboxes nativos: navegación con flechas y anuncio correcto en lectores de pantalla.
- `alt` descriptivo y específico en cada foto de mascota.
- Foco visible en todos los controles y errores asociados con `aria-describedby` / `role="alert"`.
- `prefers-reduced-motion` desactiva la escena 3D, las apariciones por scroll y los flotados.

## Datos

Las publicaciones semilla viven en `src/features/pets/lib/pets-data.ts` (fotos de Unsplash).
El envío del formulario está simulado en `usePublishForm`: al conectar un backend real,
solo cambia esa función.
