import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    // Tests run on the mock unless they say otherwise. The app itself defaults
    // to the real API, so the mock has to be asked for here by name.
    env: { NEXT_PUBLIC_USE_MOCK: 'true' },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
