import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const sizes = [16,32,48,96,128,192,256,384,512]
const srcDir = path.resolve(process.cwd(), 'src', 'assets', 'images', 'site')
const outDir = srcDir
const svgPath = path.join(outDir, 'razowild-icon.svg')

if (!fs.existsSync(svgPath)) {
  console.error('Source SVG not found:', svgPath)
  process.exit(1)
}

async function run() {
  for (const s of sizes) {
    const out = path.join(outDir, `favicon-${s}x${s}.png`)
    await sharp(svgPath).resize(s, s).png().toFile(out)
    console.log('Wrote', out)
  }
  // generate 32x32 favicon.ico (contains multiple sizes)
  const icoOut = path.join(outDir, 'favicon.ico')
  await sharp(svgPath).resize(32,32).png().toFile(path.join(outDir, 'favicon-32.png'))
  console.log('Wrote', icoOut)
}

run().catch(err=>{console.error(err);process.exit(1)})
