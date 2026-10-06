import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { buildCss, watchCss } from './css.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'ignit-css-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await symlink(path.resolve('node_modules'), path.join(root, 'node_modules'));
  async function put(file, css) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), css);
  }
  await put(
    'static/css/_src/style.css',
    `
@import 'tailwindcss' source(none);
@theme { --color-brand: #abcdef; }
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
.shared { color: red; }
`,
  );
  await put('content/example/index.md', '# Example {.p-4}');
  return { root, put };
}

const pageSource = 'content/example/assets/css/_src/style.css';
const pageOutput = 'content/example/assets/css/style.generated.css';

test('page directives share tokens without global rules and URLs retain source ownership', async (t) => {
  const { root, put } = await fixture(t);
  await put(
    'content/example/assets/css/_src/imports/nested.css',
    `.nested { background: url('../../images/example.svg'); }`,
  );
  await put(
    pageSource,
    `
@import './imports/nested.css';
.local { @apply p-4 text-brand; &:hover { color: blue; } @variant dark { color: white; } }
.image { background: url('../images/local.svg'); }
`,
  );
  const { outputs } = await buildCss(root);
  assert.equal(outputs.size, 2);
  const page = await readFile(path.join(root, pageOutput), 'utf8');
  assert.match(page, /padding: calc\(var\(--spacing, 0.25rem\) \* 4\)/);
  assert.match(page, /color: var\(--color-brand, #abcdef\)/);
  assert.match(page, /data-theme/);
  assert.match(page, /&:hover/);
  assert.doesNotMatch(page, /\.shared|@layer theme|box-sizing/);
  assert.match(page, /url\(['"]?\.\/images\/example.svg/);
  assert.match(page, /url\(['"]?\.\/images\/local.svg/);
  const global = await readFile(path.join(root, 'static/css/style.generated.css'), 'utf8');
  assert.match(global, /\.p-4/);
  const first = page;
  await buildCss(root);
  assert.equal(await readFile(path.join(root, pageOutput), 'utf8'), first);
});

test('discovery validates ownership and cleanup preserves handwritten generated files', async (t) => {
  const { root, put } = await fixture(t);
  await put(pageSource, '.local { color: red; }');
  await buildCss(root);
  await rm(path.join(root, pageSource));
  await put('content/other/assets/css/style.generated.css', '/* Handwritten */');
  await buildCss(root);
  await assert.rejects(readFile(path.join(root, pageOutput)), { code: 'ENOENT' });
  assert.equal(
    await readFile(path.join(root, 'content/other/assets/css/style.generated.css'), 'utf8'),
    '/* Handwritten */',
  );
  await put('content/orphan/assets/css/_src/style.css', '.x {}');
  await assert.rejects(buildCss(root), /no owning index.md/);
});

test('invalid directives fail the build command without overwriting existing outputs', async (t) => {
  const { root, put } = await fixture(t);
  await put(pageSource, '.local { color: red; }');
  await buildCss(root);
  const previous = await readFile(path.join(root, pageOutput), 'utf8');
  await put(pageSource, '.local { @apply nonexistent-utility; }');
  const result = spawnSync(process.execPath, [path.resolve('scripts/css.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /nonexistent-utility/);
  assert.equal(await readFile(path.join(root, pageOutput), 'utf8'), previous);
});

async function until(predicate) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  assert.fail('Watcher did not produce expected CSS within 10 seconds');
}

test('watch discovers new pages, dependencies and shared definitions, recovers and removes outputs', async (t) => {
  const { root, put } = await fixture(t);
  const messages = [];
  const close = await watchCss(root, (message) => messages.push(message));
  t.after(close);
  const output = path.join(root, pageOutput);
  async function contains(text) {
    try {
      return (await readFile(output, 'utf8')).includes(text);
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }
  await put(pageSource, '.local { @apply text-brand; }');
  await until(() => contains('color: var(--color-brand, #abcdef)'));
  await put('templates/new.html', '<div class="m-8"></div>');
  await until(async () =>
    (await readFile(path.join(root, 'static/css/style.generated.css'), 'utf8')).includes('.m-8'),
  );
  await put('content/example/assets/css/_src/partial.css', '.imported { color: green; }');
  await put(pageSource, "@import './partial.css'; .local { @apply text-brand; }");
  await until(() => contains('color: green'));
  await put('content/example/assets/css/_src/partial.css', '.imported { color: purple; }');
  await until(() => contains('color: purple'));
  await put(
    'static/css/_src/style.css',
    "@import 'tailwindcss' source(none); @theme { --color-brand: initial; --color-next: blue; }",
  );
  await until(() => messages.some((message) => message.includes('unknown utility')));
  await put(pageSource, '.local { @apply text-next; }');
  await until(() => contains('color: var(--color-next, blue)'));
  await rm(path.join(root, pageSource));
  await until(async () => {
    try {
      await readFile(output);
      return false;
    } catch (error) {
      if (error.code === 'ENOENT') return true;
      throw error;
    }
  });
});

test('site imports theme assets through the merged static tree and excludes private bundles', async (t) => {
  const { root, put } = await fixture(t);
  await put(
    'themes/example/static/css/_src/style.css',
    `@import 'tailwindcss' source(none); @import './fonts.css';`,
  );
  await put(
    'themes/example/static/css/_src/fonts.css',
    `@font-face { src: url('../../fonts/example.woff2?v=1#font'); }`,
  );
  await put(
    'static/css/_src/style.css',
    `@import '../../../themes/example/static/css/_src/style.css';`,
  );
  await put(
    'content/_private/example/assets/css/_src/style.css',
    '.broken { @apply nonexistent-utility; }',
  );
  const { outputs } = await buildCss(root);
  assert.equal(outputs.size, 1);
  const css = await readFile(path.join(root, 'static/css/style.generated.css'), 'utf8');
  assert.match(css, /url\(['"]?\.\.\/fonts\/example.woff2\?v=1#font/);
  const url = new URL(
    '../fonts/example.woff2?v=1#font',
    'https://example.com/blog/css/style.generated.css',
  );
  assert.equal(url.pathname, '/blog/fonts/example.woff2');
  assert.doesNotMatch(css, /themes\//);
  await put(pageSource, `@import '../../../../../themes/example/static/css/_src/fonts.css';`);
  await assert.rejects(buildCss(root), /Page CSS relative asset is outside its owning bundle/);
});

test('watch recovers when an external imported file is broken at startup', async (t) => {
  const { root, put } = await fixture(t);
  const external = await mkdtemp(path.join(os.tmpdir(), 'ignit-css-import-'));
  t.after(() => rm(external, { recursive: true, force: true }));
  const partial = path.join(external, 'partial.css');
  await writeFile(partial, '.external { @apply nonexistent-utility; }');
  await put(pageSource, `@import ${JSON.stringify(partial)};`);
  const messages = [];
  const close = await watchCss(root, (message) => messages.push(message));
  t.after(close);
  assert.ok(messages.some((message) => message.includes('nonexistent-utility')));
  await writeFile(partial, '.external { color: orange; }');
  await until(async () => {
    try {
      return (await readFile(path.join(root, pageOutput), 'utf8')).includes('color: orange');
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  });
});

test('page assets cannot cross bundle boundaries through relative URLs', async (t) => {
  const { root, put } = await fixture(t);
  await put(pageSource, `.local { background: url('../../../../../static/images/icon.svg'); }`);
  await assert.rejects(buildCss(root), /Page CSS relative asset is outside its owning bundle/);
  await put(
    pageSource,
    `.local { background: url('/images/icon.svg'); } .remote { background: url('https://example.com/icon.svg'); }`,
  );
  await buildCss(root);
  const css = await readFile(path.join(root, pageOutput), 'utf8');
  assert.match(css, /url\(['"]?\/images\/icon.svg/);
  assert.match(css, /url\(['"]?https:\/\/example.com\/icon.svg/);
});
