import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/tw_road_fix_map/',
    plugins: [react({ jsxRuntime: 'classic' })],
    define: {
      'process.env.PUBLIC_URL': JSON.stringify('/tw_road_fix_map'),
      'process.env.REACT_APP_GOOGLE_MAP_API_KEY': JSON.stringify(
        env.REACT_APP_GOOGLE_MAP_API_KEY || env.VITE_GOOGLE_MAP_API_KEY || '',
      ),
      'process.env.REACT_APP_DEBUG_ROAD_DATA': JSON.stringify(
        env.REACT_APP_DEBUG_ROAD_DATA || env.VITE_DEBUG_ROAD_DATA || '',
      ),
    },
  };
});
