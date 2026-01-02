const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');
const sourceImage = path.join(publicDir, 'logo.png');

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

  // 원본 이미지에서 아이콘 부분만 추출 (왼쪽 부분)
  const metadata = await sharp(sourceImage).metadata();
  console.log('원본 이미지: ' + metadata.width + 'x' + metadata.height);

  // 로고에서 아이콘 부분만 crop (대략 왼쪽 28%)
  const iconWidth = Math.floor(metadata.width * 0.28);
  const iconBuffer = await sharp(sourceImage)
    .extract({ 
      left: 50, 
      top: Math.floor(metadata.height * 0.25), 
      width: iconWidth, 
      height: Math.floor(metadata.height * 0.5) 
    })
    .toBuffer();

  for (const item of sizes) {
    try {
      await sharp(iconBuffer)
        .resize(item.size, item.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(publicDir, item.name));
      
      console.log('OK ' + item.name + ' (' + item.size + 'x' + item.size + ')');
    } catch (err) {
      console.error('FAIL ' + item.name + ': ' + err.message);
    }
  }

  // ICO 파일은 32x32 PNG를 복사
  fs.copyFileSync(
    path.join(publicDir, 'favicon-32x32.png'),
    path.join(publicDir, 'favicon.ico')
  );
  console.log('OK favicon.ico');

  console.log('\n파비콘 생성 완료!');
}

generateFavicons().catch(console.error);
