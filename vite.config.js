import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
