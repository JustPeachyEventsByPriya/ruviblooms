import {defineConfig, loadEnv} from 'vite';
import {rentalInquiryPlugin} from './server/rental-inquiry';

export default defineConfig(({mode}) => ({
  base: './',
  esbuild: {jsx: 'automatic'},
  resolve: {dedupe: ['react', 'react-dom']},
  plugins: [rentalInquiryPlugin(loadEnv(mode, process.cwd(), 'RENTAL_'))],
}));
