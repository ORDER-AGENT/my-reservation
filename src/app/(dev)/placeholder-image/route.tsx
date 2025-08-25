import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const contentType = 'image/png'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const width = Number(searchParams.get('width')) || 1200
  const height = Number(searchParams.get('height')) || 630

  const background = searchParams.get('background') || 'white'
  const color = searchParams.get('color') || 'black'

  const text = `${width} x ${height}`
  // 横幅に合わせてフォントサイズを動的に計算
  // テキストが長くなるほどフォントサイズを小さくする
  // 経験的に係数を調整
  const fontSize = Math.max(12, Math.floor((width / text.length) * 1.5))

  return new ImageResponse(
    <div
      style={{
        fontSize,
        background,
        color,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {text}
    </div>,
    {
      width,
      height,
    },
  )
}
