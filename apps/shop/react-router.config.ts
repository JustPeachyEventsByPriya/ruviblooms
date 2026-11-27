import type {Config} from '@react-router/dev/config';

export default {
  ssr: true,
  buildDirectory: process.env.RUVI_CLOUDFLARE === '1' ? '.cloudflare-build' : 'build',
  future: {v8_viteEnvironmentApi: process.env.RUVI_CLOUDFLARE === '1'},
} satisfies Config;
