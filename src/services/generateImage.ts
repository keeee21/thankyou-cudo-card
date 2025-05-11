import sharp from 'sharp'
import path from 'path'

export async function generateImage(text: string, username: string): Promise<Buffer> {
  const backgroundPath = path.resolve('src/assets/image/kudo-card-temp.jpeg')

  // 背景画像サイズを取得
  const { width, height } = await sharp(backgroundPath).metadata()

  if (!width || !height) {
    throw new Error('背景画像のサイズを取得できませんでした')
  }

  // SVG を背景画像と同じサイズで生成
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: sans-serif; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="24" fill="#000">
        ${text}
      </text>
      <text x="50%" y="${height - 40}" text-anchor="middle" dominant-baseline="middle" font-size="18" fill="#555">
        from: ${username}
      </text>
    </svg>
  `

  const svgBuffer = Buffer.from(svg)

  return await sharp(backgroundPath)
    .composite([{ input: svgBuffer, top: 0, left: 0 }])
    .jpeg()
    .toBuffer()
}