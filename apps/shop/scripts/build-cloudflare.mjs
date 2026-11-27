import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const shop = fileURLToPath(new URL('../', import.meta.url));

function run(cwd, args, env = process.env) {
  const result = spawnSync(process.execPath, args, {cwd, env, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(shop, ['node_modules/@react-router/dev/bin.js', 'build'], {
  ...process.env,
  RUVI_CLOUDFLARE: '1',
});
