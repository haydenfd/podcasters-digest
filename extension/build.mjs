import * as esbuild from 'esbuild';
import { copyFileSync } from 'fs';

const watch = process.argv.includes('--watch');

const config = {
  bundle: true,
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  target: 'es2020',
  format: 'esm',
};

const contexts = await Promise.all([
  esbuild.context({
    ...config,
    entryPoints: ['background/background.ts'],
    outfile: 'dist/background.js',
  }),
  esbuild.context({
    ...config,
    entryPoints: ['content/content.ts'],
    outfile: 'dist/content.js',
  }),
  esbuild.context({
    ...config,
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
  copyFileSync('manifest.json', 'dist/manifest.json');
  copyFileSync('popup/popup.html', 'dist/popup.html');

  console.log('Build complete!');
}
