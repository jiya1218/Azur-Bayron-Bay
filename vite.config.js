import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function copyStaticDirs() {
  return {
    name: 'copy-static-dirs',
    closeBundle() {
      const dirs = ['Home', 'Rooms', 'About', 'Logo', 'Blog', 'Explore', 'Group Bookings', 'js'];
      dirs.forEach(d => {
        const src = resolve(__dirname, d);
        const dest = resolve(__dirname, 'dist', d);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true, dereference: true });
        }
      });
    }
  };
}

function serveMediaMiddleware() {
  return {
    name: 'serve-media-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const rawUrl = req.url.split('?')[0];
          const decodedUrl = decodeURI(rawUrl);
          if (decodedUrl.endsWith('.mp4') || decodedUrl.endsWith('.webm') || decodedUrl.endsWith('.mov')) {
            const cleanPath = decodedUrl.replace(/^\/+/, '');
            const filePath = resolve(__dirname, cleanPath);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const stat = fs.statSync(filePath);
              const fileSize = stat.size;
              const range = req.headers.range;

              if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = end - start + 1;
                const file = fs.createReadStream(filePath, { start, end });
                res.writeHead(206, {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': chunksize,
                  'Content-Type': 'video/mp4',
                });
                file.pipe(res);
                return;
              } else {
                res.writeHead(200, {
                  'Content-Length': fileSize,
                  'Content-Type': 'video/mp4',
                  'Accept-Ranges': 'bytes',
                });
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }
          }
        } catch (e) {
          console.error('serveMediaMiddleware error:', e);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [serveMediaMiddleware(), copyStaticDirs()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        rooms: resolve(__dirname, 'rooms.html'),
        about: resolve(__dirname, 'about.html'),
        groupBookings: resolve(__dirname, 'group-bookings.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        explore: resolve(__dirname, 'explore.html'),
        blog: resolve(__dirname, 'blog.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
