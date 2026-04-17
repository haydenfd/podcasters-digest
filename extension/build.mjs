import * as esbuild from 'esbuild';
import { copyFileSync, readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const watch = process.argv.includes('--watch');

// Load .env file from repo root
function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    return env;
  } catch (error) {
    console.error('Warning: Could not read .env file:', error.message);
    return {};
  }
}

const env = loadEnv();

// Create define object for esbuild
const define = {
  'INJECTED_OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || ''),
  'INJECTED_OBSIDIAN_API_KEY': JSON.stringify(env.OBSIDIAN_API_KEY || ''),
  'INJECTED_OBSIDIAN_URL': JSON.stringify(env.OBSIDIAN_URL || ''),
  'INJECTED_OBSIDIAN_FOLDER': JSON.stringify(env.OBSIDIAN_FOLDER || ''),
};

const config = {
  bundle: true,
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  target: 'es2020',
  format: 'esm',
  define,
};

// Ensure dist directory exists
const distDir = join(__dirname, 'dist');
mkdirSync(distDir, { recursive: true });

const contexts = await Promise.all([
  esbuild.context({
    ...config,
    absWorkingDir: __dirname,
    entryPoints: ['background/background.ts'],
    outfile: 'dist/background.js',
  }),
  esbuild.context({
    ...config,
    absWorkingDir: __dirname,
    entryPoints: ['content/content.ts'],
    outfile: 'dist/content.js',
  }),
  esbuild.context({
    ...config,
    absWorkingDir: __dirname,
    entryPoints: ['popup/popup.ts'],
    outfile: 'dist/popup.js',
  }),
]);

if (watch) {
  await Promise.all(contexts.map(ctx => ctx.watch()));
  console.log('Watching for changes...');
} else {
  await Promise.all(contexts.map(async ctx => {
    await ctx.rebuild();
    await ctx.dispose();
  }));

  // Copy static files
  copyFileSync(join(__dirname, 'manifest.json'), join(distDir, 'manifest.json'));
  copyFileSync(join(__dirname, 'popup', 'popup.html'), join(distDir, 'popup.html'));

  console.log('Build complete!');
  console.log('Environment variables injected:', Object.keys(define).join(', '));
}
