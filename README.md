# 🎧 Varian Music - PWA

Aplicación web progresiva de música con streaming usando Supabase y Cloudinary.

## 📋 Características

### ✅ Funcionalidades Implementadas

**Autenticación:**
- ✅ Registro de usuarios con email y username
- ✅ Login con email o username
- ✅ Gestión de sesiones
- ✅ Perfiles de usuario

**Reproducción:**
- ✅ Player de audio y video
- ✅ Controles completos (play/pause, volumen, progreso)
- ✅ Atajos de teclado
- ✅ Soporte para Cloudinary

**Interacciones:**
- ✅ Agregar a favoritos
- ✅ Dar like a canciones
- ✅ Historial de reproducción
- ✅ Vistas/reproducciones públicas
- ✅ Compartir canciones

**Playlists:**
- ✅ Crear playlists personalizadas
- ✅ Agregar/quitar canciones
- ✅ Playlists públicas/privadas

**Estadísticas:**
- ✅ Canciones más escuchadas
- ✅ Artistas más escuchados
- ✅ Estadísticas por usuario

**Administración:**
- 🚧 Panel de admin (pendiente)
- 🚧 Subir canciones (pendiente)
- 🚧 Editar/eliminar canciones (pendiente)

## 🚀 Instalación

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor y ejecuta el script `database-schema.sql`
3. Copia tu URL y ANON KEY del proyecto

### 2. Configurar el Proyecto

1. Clona o descarga este repositorio

2. Edita `assets/js/supabase.js`:

```javascript
const supabaseUrl = "TU_SUPABASE_URL";
const supabaseKey = "TU_SUPABASE_ANON_KEY";
```

3. Estructura de carpetas:

```
varian-pwa/
├── public/
│   ├── index.html          # Landing page
│   ├── login.html          # Login
│   ├── register.html       # Registro
│   ├── app/
│   │   ├── index.html      # Biblioteca de música
│   │   └── play.html       # Reproductor
│   └── admin/
│       └── index.html      # Panel admin (pendiente)
├── assets/
│   └── js/
│       ├── supabase.js     # Configuración
│       ├── auth.js         # Autenticación
│       ├── songs.js        # Gestión de canciones
│       ├── player.js       # Reproductor
│       └── metrics.js      # Favoritos, likes, historial
└── database-schema.sql     # Schema de la BD
```

### 3. Configurar Cloudinary (Opcional)

Si quieres usar Cloudinary para almacenar archivos:

1. Crea cuenta en [Cloudinary](https://cloudinary.com)
2. Sube tus archivos de audio/video/imágenes
3. Copia las URLs públicas

**Ejemplo de inserción de canción:**

```sql
insert into songs (titulo, artista, genero, audio_url, thumbnail_url)
values (
  'Mi Canción',
  'Artista X',
  'Pop',
  'https://res.cloudinary.com/tu-cloud/video/upload/v123/audio/song.mp3',
  'https://res.cloudinary.com/tu-cloud/image/upload/v123/covers/cover.jpg'
);
```

### 4. Crear Usuario Admin

1. Regístrate en la aplicación
2. En Supabase SQL Editor ejecuta:

```sql
update profiles 
set is_admin = true 
where email = 'tu_email@ejemplo.com';
```

## 📱 Uso

### Para Usuarios

1. **Registro**: Ve a `/register.html` y crea tu cuenta
2. **Login**: Inicia sesión en `/login.html`
3. **Explorar**: Navega por la biblioteca de música
4. **Reproducir**: Haz clic en cualquier canción
5. **Interactuar**:
   - ❤️ Agregar a favoritos
   - 👍 Dar like
   - 📋 Ver historial
   - 🎵 Crear playlists

### Para Administradores

**Actualmente puedes agregar canciones vía SQL:**

```sql
insert into songs (titulo, artista, genero, audio_url, video_url, thumbnail_url)
values (
  'Título de la canción',
  'Nombre del artista',
  'Género',
  'URL del audio (Cloudinary)',
  'URL del video (opcional)',
  'URL de la portada'
);
```

## 🎨 Funcionalidades del Código

### auth.js

```javascript
import { register, login, logout, getUser } from './auth.js';

// Registro
const result = await register(email, password, username);

// Login
const result = await login('email_o_username', password);

// Obtener usuario actual
const user = await getUser();

// Logout
await logout();
```

### metrics.js

```javascript
import { 
  addToFavorites, 
  removeFromFavorites,
  getFavorites,
  likeSong,
  getLikedSongs,
  addToHistory,
  getHistory,
  createPlaylist,
  addSongToPlaylist
} from './metrics.js';

// Favoritos
await addToFavorites(songId);
const myFavorites = await getFavorites();

// Likes
await likeSong(songId);
const likedSongs = await getLikedSongs();

// Historial
await addToHistory(songId);
const history = await getHistory(50);

// Playlists
const playlist = await createPlaylist('Mi Playlist');
await addSongToPlaylist(playlist.id, songId);
```

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Los usuarios solo pueden modificar su propio contenido
- Las vistas son públicas pero anónimas
- Solo admins pueden gestionar canciones/artistas

## 🎯 Próximas Funcionalidades

- [ ] Panel de administración completo
- [ ] Upload de archivos desde el navegador
- [ ] Sistema de búsqueda avanzada
- [ ] Recomendaciones personalizadas
- [ ] Player con cola de reproducción
- [ ] Modo offline (PWA)
- [ ] Modo oscuro/claro
- [ ] Integración con APIs de letras
- [ ] Ecualizador
- [ ] Compartir playlists

## 🐛 Solución de Problemas

### "Usuario no autenticado"
- Verifica que hayas iniciado sesión
- Revisa la consola del navegador para errores

### "Error cargando canciones"
- Verifica tu conexión a Supabase
- Asegúrate de haber ejecutado el schema SQL
- Revisa las políticas RLS

### "No puedo agregar a favoritos"
- Debes estar autenticado
- Verifica que la tabla `favorites` existe
- Revisa las políticas de la tabla

### Las canciones no reproducen
- Verifica las URLs de Cloudinary
- Asegúrate que sean URLs públicas
- Revisa la consola para errores CORS

## 📄 Licencia

MIT License - Usa este proyecto como quieras

## 👨‍💻 Desarrollo

**Tecnologías:**
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Supabase (Backend)
- Cloudinary (Storage)

**Sin frameworks** - Vanilla JavaScript puro para máximo rendimiento

## 🤝 Contribuir

¿Encontraste un bug? ¿Tienes una idea?
- Abre un issue
- Envía un pull request
- Comparte el proyecto

---

Hecho con ❤️ y ☕ para amantes de la música