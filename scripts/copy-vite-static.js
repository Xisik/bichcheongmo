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

function writeRedirect(fileName, hashPath, title) {
  const target = path.join(OUT, fileName);
  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0; url=./#${hashPath}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="./assets/img/logo.jpg" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="Bichcheongmo website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="Bichcheongmo website" />
    <title>${title}</title>
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

  writeRedirect('about.html', '/about', '단체 소개 | About');
  writeRedirect('activities.html', '/activities', '활동공유 | Activities');
  writeRedirect('contact.html', '/contact', '문의하기 | Contact');
  writeRedirect('donate.html', '/donate', '후원하기 | Donate');
  writeRedirect('payments.html', '/payments', '지출내역 | Expense Reports');
  writeRedirect('poli-statements.html', '/statements', '성명 | Statements');
  writeRedirect('poli.html', '/poli', '정치위원회 | Political Committee');
  writeRedirect('region.html', '/region', '지역 지부 | Regional Branches');
}

main();
