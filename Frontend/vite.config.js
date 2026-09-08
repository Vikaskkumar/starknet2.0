import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/signup': 'http://localhost:5000',
      '/signin': 'http://localhost:5000',
      '/createPost': 'http://localhost:5000',
      '/allposts': 'http://localhost:5000',
      '/myposts': 'http://localhost:5000',
      '/myprofile': 'http://localhost:5000',
      '/like': 'http://localhost:5000',
      '/unlike': 'http://localhost:5000',
      '/comment': 'http://localhost:5000',
      '/deletepost': 'http://localhost:5000',
      '/user': 'http://localhost:5000',
      '/follow': 'http://localhost:5000',
      '/unfollow': 'http://localhost:5000',
      '/myfollowingpost': 'http://localhost:5000',
      '/uploadProfilePic': 'http://localhost:5000',
      '/removeProfilePic': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/allusers': 'http://localhost:5000',
      '/messages': 'http://localhost:5000',
      '/direct-reset-password': 'http://localhost:5000',
    }
  }
})
