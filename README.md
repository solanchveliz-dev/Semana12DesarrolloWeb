# Laboratorio 12 — Sistema de Biblioteca (búsqueda, filtros y paginación)

Next.js 15 (App Router) + TypeScript + Prisma 6 + PostgreSQL (Supabase).
Todos los datos que muestra la aplicación salen de la base de datos (no hay registros escritos en el código).

## Instalación (Windows · terminal CMD de VS Code)
1. `npm install`
2. Crea `.env` (copia de `.env.example`) con tu `DATABASE_URL` de Supabase.
3. `npx prisma db push`  → agrega las columnas nuevas `photoUrl` (Author) y `coverUrl` (Book).
4. `npx prisma generate`
5. (Opcional) `npm run db:seed` → inserta autores y libros reales de ejemplo en TU base de datos.
6. `npm run dev` y abre http://localhost:3000

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| GET, POST | `/api/authors` | Listar y crear autores |
| GET, PUT, DELETE | `/api/authors/:id` | Consultar, editar y eliminar autor |
| GET | `/api/authors/:id/books` | Libros de un autor |
| GET | `/api/authors/:id/stats` | **Estadísticas del autor** |
| GET, POST | `/api/books` | Listar y crear libros |
| GET, PUT, DELETE | `/api/books/:id` | Consultar, editar y eliminar libro |
| GET | `/api/books/search` | **Búsqueda con filtros, orden y paginación** |
| GET | `/api/genres` | Géneros disponibles (para el dropdown) |
| GET | `/api/stats` | Estadísticas generales y actividad reciente |

### `/api/books/search` — query params
| Param | Descripción | Default |
|---|---|---|
| `search` | Título, parcial y sin distinguir mayúsculas | — |
| `genre` | Género exacto | — |
| `authorName` | Nombre del autor, parcial y sin distinguir mayúsculas | — |
| `page` | Número de página | 1 |
| `limit` | Resultados por página (máximo 50) | 10 |
| `sortBy` | `title`, `publishedYear`, `createdAt` | `createdAt` |
| `order` | `asc`, `desc` | `desc` |

Ejemplo: `GET http://localhost:3000/api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc`

## Páginas
- `/bienvenida` portada del sistema.
- `/` dashboard: crear, listar, editar y eliminar autores; ver libros; estadísticas generales.
- `/books` catálogo: crear/editar/eliminar libros, búsqueda en tiempo real, filtros, orden, paginación y loading.
- `/authors/:id` detalle: información, estadísticas, libros del autor, edición y "Agregar nuevo libro".
- `/estadisticas` resumen general de la colección.

## Imagen de la portada (opcional)
Si colocas una foto en `public/hero-biblioteca.jpg`, la página `/bienvenida` la usa; si no existe, muestra una ilustración.

## Vercel
Configura `DATABASE_URL` en Settings → Environment Variables. Nunca subas `.env` a GitHub.
