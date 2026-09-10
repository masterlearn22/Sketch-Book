import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import https from 'https';

const JSON_URL = 'https://threeui.com/source-code/meng-to-sketchbook-landing-page.json';
const BASE_URL = 'https://threeui.com';

const BINARY_ASSETS = [
  { path: 'public/landing-pages/meng-to-sketchbook/bg-wash.jpg', sha256: '3e8bbb177216bcb41ddc75cdaca38f732b9cd7ff4aaa409921623356072eb1f6' },
  { path: 'public/landing-pages/meng-to-sketchbook/bloom.png', sha256: '7786aef42d10f1fbeca055b3ed14f51a47cb2a390b360eae92119f046989943e' },
  { path: 'public/landing-pages/meng-to-sketchbook/botanic-gardens.png', sha256: '48ab10869e7afd4519cdc78d62625cd529bd3b2b5ff1c3c2789a8d721733da15' },
  { path: 'public/landing-pages/meng-to-sketchbook/botany-left.png', sha256: 'b3ed9e8613ba8826a5e137a5f8ad4bd21b6e7a544bc25e6184891079eae0470c' },
  { path: 'public/landing-pages/meng-to-sketchbook/botany-right.png', sha256: '608025a35b8697b536e9ac668e51476c79072d1efb4a04316c068073f51cf655' },
  { path: 'public/landing-pages/meng-to-sketchbook/buddha-tooth.png', sha256: 'cf73e3fffd80a4c81b18ac83dfdba266c9f5c51e6a66047068a39c2885bc388a' },
  { path: 'public/landing-pages/meng-to-sketchbook/divider.png', sha256: 'ef8ed266a6ee6f2f6fb8f235657d9ea9e4d57af6d84e75e4e81373de9d3632bb' },
  { path: 'public/landing-pages/meng-to-sketchbook/gardens-by-the-bay.png', sha256: 'cf1d629d6a72d8cd4a98158fac44e9093a12e55257b43adcdaa07ae3ffbad7d3' },
  { path: 'public/landing-pages/meng-to-sketchbook/instrument-serif-italic.woff2', sha256: '6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702' },
  { path: 'public/landing-pages/meng-to-sketchbook/instrument-serif.woff2', sha256: '60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d' },
  { path: 'public/landing-pages/meng-to-sketchbook/joo-chiat.png', sha256: 'a46701ba26b5ee31fc6484a12d908cb25d70baea92dec3013260c516e1157a0b' },
  { path: 'public/landing-pages/meng-to-sketchbook/lau-pa-sat.png', sha256: 'bb020724a54e6dbf72c19bc2a8113393aae43408da2bcada4a62b53eeb3b0ddb' },
  { path: 'public/landing-pages/meng-to-sketchbook/marina-bay-sands.png', sha256: 'c9cb4423072d69c4177833fa3f92923ce50ab7b395a257349793de3840b88608' },
  { path: 'public/landing-pages/meng-to-sketchbook/marina-bay-skyline.png', sha256: '1cebb237d910a1429ff4f17f78efac059094c001629a579b598843eb0bdf363f' },
  { path: 'public/landing-pages/meng-to-sketchbook/merlion.png', sha256: 'bf5082288e212f62b2e15af766364d79e30050528a7ad48a020aa46d59d4666a' },
  { path: 'public/landing-pages/meng-to-sketchbook/newsreader.woff2', sha256: '01817351be3edfc1714fe6d60ddea6a22a169a5ebd033b50c7f9495e5d9c386a' },
  { path: 'public/landing-pages/meng-to-sketchbook/singapore-river.png', sha256: 'a3fc9cf2be0e3ce4b4630df6897d856ca49c6aca48f66a82e910367328bf667b' }
];

const REQUIRED_FILES = [
  'src/shaders/landing-pages/LandingPages.tsx',
  'src/shaders/landing-pages/pageTypography.ts',
  'src/shaders/landing-pages/pageRecipes.ts',
  'src/shaders/landing-pages/LandingPageFrame.tsx',
  'public/landing-pages/meng-to-sketchbook.html',
  'src/shaders/threeui.css'
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function getFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function main() {
  console.log('Downloading JSON source...');
  const jsonPath = path.join(process.cwd(), 'meng-to-sketchbook.json');
  await download(JSON_URL, jsonPath);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log('Extracting text files...');
  for (const file of data.files) {
    if (REQUIRED_FILES.includes(file.path)) {
      console.log(`Processing ${file.path}...`);
      fs.mkdirSync(path.dirname(file.path), { recursive: true });
      if (file.code !== undefined) {
        fs.writeFileSync(file.path, file.code, 'utf8');
      } else if (file.sourceUrl) {
        console.log(`Downloading ${file.path} from ${BASE_URL}${file.sourceUrl}`);
        await download(`${BASE_URL}${file.sourceUrl}`, file.path);
      }
      
      const actualHash = await getFileHash(file.path);
      if (actualHash !== file.sha256) {
        console.warn(`Warning: Hash mismatch for text file ${file.path}. Expected ${file.sha256}, got ${actualHash}`);
      } else {
        console.log(`Hash matched for ${file.path}`);
      }
    }
  }

  console.log('Downloading binary assets...');
  for (const asset of BINARY_ASSETS) {
    console.log(`Downloading ${asset.path}...`);
    const assetUrl = `${BASE_URL}/${asset.path.replace(/^public\//, '')}`;
    await download(assetUrl, asset.path);
    
    const hash = await getFileHash(asset.path);
    if (hash !== asset.sha256) {
      console.error(`ERROR: Hash mismatch for ${asset.path}. Expected ${asset.sha256}, got ${hash}`);
    } else {
      console.log(`Hash matched for ${asset.path}`);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
