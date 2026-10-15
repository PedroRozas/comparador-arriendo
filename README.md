# llave · comparador personal de arriendos

Aplicación web personal para registrar casas en arriendo y compararlas con datos: tabla con heatmap, ranking ponderado con sliders, radar chart y comparación par a par contra tu casa actual.

**Stack:** Vite + React + TypeScript estricto · MUI con theme custom (dark editorial) · framer-motion · recharts · React Router · React Hook Form + Zod · Supabase (Auth + Postgres con RLS + Storage privado).

## Usa tu propia instancia

El repositorio no incluye ninguna base de datos ni credenciales. Cada persona levanta la app con **su propio proyecto de Supabase** (el plan gratuito alcanza), así que tus datos y fotos quedan solo en tu cuenta. Los pasos de abajo te llevan de cero a la app corriendo.

**Requisitos:**

- Node.js `^20.19.0` o `>=22.12.0` (lo exige Vite).
- Una cuenta en [supabase.com](https://supabase.com).

```bash
git clone https://github.com/PedroRozas/comparador-arriendo.git
cd comparador-arriendo
```

---

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Guarda la **Project URL** y la **anon key** (Settings → API). **Nunca uses la `service_role` key en este proyecto:** la app corre 100 % en el cliente y la seguridad depende de Auth + RLS.

## 2. Correr las migraciones (en orden)

1. Abre el **SQL Editor** del proyecto.
2. Pega y ejecuta [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Luego ejecuta [`supabase/migrations/0002_dimensiones_y_casa_actual.sql`](supabase/migrations/0002_dimensiones_y_casa_actual.sql).

La migración 1 crea:

- Tablas `properties`, `rooms` y `bathrooms` con sus constraints e índices.
- **RLS activado** en las tres tablas, con políticas explícitas por operación (`select` / `insert` / `update` / `delete`). `properties` valida `auth.uid() = user_id`; `rooms` y `bathrooms` validan la propiedad del padre vía `EXISTS`.
- El bucket privado `property-photos` con sus políticas de Storage.

La migración 2 ajusta el modelo:

- Las superficies se guardan como **largo × ancho** (el área se calcula en la app).
- `listing_url` pasa a ser opcional (obligatoria solo para candidatas, con check constraint).
- Nuevo flag `living_dining_separated`.

## 3. Bucket privado de fotos

La migración ya crea el bucket `property-photos` como **privado** (`public = false`) y sus políticas: cada usuario solo puede subir, leer, actualizar y borrar archivos bajo su propia carpeta (`{user_id}/...`).

Si prefieres crearlo a mano: Storage → New bucket → nombre `property-photos`, **desmarcar** "Public bucket", y ejecutar solo la sección 3 de la migración para las políticas.

Las fotos se muestran siempre con **signed URLs temporales** (`createSignedUrl`, 1 hora); nunca se usa URL pública.

## 4. Activar confirmación de email (obligatoria)

1. Ve a **Authentication → Sign In / Up → Email**.
2. Deja activado **"Confirm email"** (viene activado por defecto).

Con esto, quien se registre no podrá iniciar sesión hasta verificar su correo. La app ya maneja el flujo: tras el signup muestra la pantalla "Confirma tu correo" y traduce el error `Email not confirmed` en el login.

> En desarrollo, configura también **Authentication → URL Configuration → Site URL** con `http://localhost:5173` para que el enlace de confirmación redirija bien.

## 5. (Opcional) Allowlist de correos

Para que **solo tú** puedas registrarte:

1. En `supabase/migrations/0001_init.sql`, descomenta la **sección 4** completa.
2. Reemplaza `tu-correo@ejemplo.com` por tu correo real y ejecútala.

Funciona con un trigger `before insert` sobre `auth.users`: si el correo no está en `public.allowed_emails`, el signup falla y la app muestra "Este correo no está autorizado para registrarse".

- **Agregar otro correo:** `insert into public.allowed_emails (email) values ('otro@correo.com');`
- **Desactivar la allowlist:** `drop trigger if exists enforce_email_allowlist_trigger on auth.users;`
- **Reactivarla:** vuelve a crear el trigger (último `create trigger` de la sección 4).

## 6. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con los valores de tu proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Solo la **anon key**. La app valida al arrancar que ambas variables existan.

## 7. Instalar y correr

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173), crea tu cuenta, confirma el correo y entra.

Otros comandos:

```bash
npm run build      # type-check + build de producción
npm run preview    # sirve el build local
npm run lint       # eslint
```

## 8. (Opcional) Publicarlo

El build es un sitio estático (`dist/`), así que sirve cualquier hosting estático. Por ejemplo, Vercel o Netlify:

1. Importa tu fork del repositorio.
2. Configura el build: comando `npm run build`, carpeta de salida `dist`.
3. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto.
4. La app usa rutas del navegador (`BrowserRouter`), así que cualquier ruta debe responder con `index.html`:
   - **Vercel:** crea `vercel.json` con `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
   - **Netlify:** crea `public/_redirects` con la línea `/* /index.html 200`.
5. En Supabase, cambia **Authentication → URL Configuration → Site URL** por la URL publicada, para que el enlace de confirmación de correo apunte ahí.

---

## Estructura

```
src/
  lib/            cliente Supabase (instancia única), tipos de la BD, env
  theme/          theme MUI custom (paleta, tipografía, overrides)
  components/ui/  componentes compartidos (badges, empty states, motion)
  features/
    auth/         login, signup, sesión, rutas protegidas
    properties/   CRUD, cálculos derivados, fotos, formato CLP/m²
    benchmark/    tabla heatmap, scoring, ranking, charts, frente a frente
  layout/         shell con navbar
supabase/
  migrations/     0001_init.sql (tablas, RLS, storage, allowlist opcional)
                  0002_dimensiones_y_casa_actual.sql (largo × ancho, casa actual)
```

## Notas de seguridad

- La **anon key es pública por diseño**; todo el acceso a datos está protegido por Auth + RLS por usuario.
- Sesión persistente con refresh automático (`persistSession: true`, `autoRefreshToken: true`).
- Todas las rutas de la app van detrás de `<ProtectedRoute>`; sin sesión se redirige a `/login`.
- Las fotos viven en un bucket privado bajo `{user_id}/...` y se sirven con signed URLs que expiran.

## Licencia

MIT. Ver [LICENSE](LICENSE).
