const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');
const sourceImage = path.join(publicDir, 'favicon.png'); // 투명배경 파비콘 사용

// 생성할 파비콘 크기들
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'favicon-128x128.png', size: 128 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-256x256.png', size: 256 },
  { name: 'favicon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 },
];

async function generateFavicons() {
  console.log('파비콘 생성 시작...\n');
  console.log('소스 이미지: ' + sourceImage);

  const metadata = await sharp(sourceImage).metadata();
  console.log('원본 크기: ' + metadata.width + 'x' + metadata.height + '\n');

  for (const item of sizes) {
    try {
      await sharp(sourceImage)
        .resize(item.size, item.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // 투명 배경 유지
        })
        .png()
        .toFile(path.join(publicDir, item.name));
      
      const stats = fs.statSync(path.join(publicDir, item.name));
      console.log('OK ' + item.name + ' (' + item.size + 'x' + item.size + ') - ' + stats.size + ' bytes');
    } catch (err) {
      console.error('FAIL ' + item.name + ': ' + err.message);
    }
  }

  // ICO 파일은 32x32 PNG를 복사 (브라우저가 PNG도 인식함)
  fs.copyFileSync(
    path.join(publicDir, 'favicon-32x32.png'),
    path.join(publicDir, 'favicon.ico')
  );
  console.log('OK favicon.ico (copied from favicon-32x32.png)');

  console.log('\n파비콘 생성 완료!');
}

generateFavicons().catch(console.error);
