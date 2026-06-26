#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

function copyFile(relPath) {
  const source = path.join(ROOT, relPath);
  if (!fs.existsSync(source)) return;
  const target = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`  + ${relPath}`);
}

function copyDir(relPath) {
  const source = path.join(ROOT, relPath);
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const childRel = path.join(relPath, entry.name);
    if (entry.isDirectory()) {
      copyDir(childRel);
    } else if (entry.isFile()) {
      copyFile(childRel);
    }
  }
}

function writeRedirect(fileName, hashPath) {
  const target = path.join(OUT, fileName);
  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0; url=./#${hashPath}" />
    <title>Redirecting...</title>
  </head>
  <body>
    <a href="./#${hashPath}">Go to ${hashPath}</a>
  </body>
</html>
`;
  fs.writeFileSync(target, html);
  console.log(`  + ${fileName}`);
}

function main() {
  if (!fs.existsSync(OUT)) {
    throw new Error('dist directory does not exist. Run vite build first.');
  }

  console.log('Copying static assets for Vite build...');
  copyFile('CNAME');
  copyFile('favicon.ico');
  copyFile('LICENSE');
  copyFile('THIRD_PARTY_NOTICES.md');
  copyDir('data');
  copyDir(path.join('assets', 'img'));
  copyDir(path.join('assets', 'payment'));

  writeRedirect('about.html', '/about');
  writeRedirect('activities.html', '/activities');
  writeRedirect('contact.html', '/contact');
  writeRedirect('donate.html', '/donate');
  writeRedirect('payments.html', '/payments');
  writeRedirect('poli-statements.html', '/statements');
  writeRedirect('poli.html', '/poli');
  writeRedirect('region.html', '/region');
}

main();
