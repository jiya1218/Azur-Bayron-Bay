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
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [copyStaticDirs()],
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
