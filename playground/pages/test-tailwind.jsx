import { useState } from 'react'
import { useEffect } from 'react'
import satori from 'satori'
import { createSatoriTailwind } from '../utils/satori-tailwind'
import getTwemojiMap, { loadEmoji } from '../utils/twemoji'

const card = (
  <div className='flex w-full h-full items-center justify-center bg-[#f00]/50'>
    <div className='p-24 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100'>
      <div className='skew-y-12 rotate-12 text-9xl text-geist-success'>
        Tailwind!
      </div>
    </div>
  </div>
)

const { processClassName, preflight } = createSatoriTailwind({
  content: ['__'],
  theme: {
    extend: {
      colors: {
        'geist-success': '#0070F3',
      },
    },
  },
})

async function init() {
  if (typeof window === 'undefined') return []
  if (window.__initialized) return window.__initialized

  const [font, fontBold, fontIcon] = await Promise.all(
    (
      await Promise.all([
        fetch(
          'https://unpkg.com/@fontsource/inter@4.5.2/files/inter-latin-ext-400-normal.woff'
        ),
        fetch(
          'https://unpkg.com/@fontsource/inter@4.5.2/files/inter-latin-ext-700-normal.woff'
        ),
        fetch(
          'https://unpkg.com/@fontsource/material-icons@4.5.2/files/material-icons-base-400-normal.woff'
        ),
      ])
    ).map((res) => res.arrayBuffer())
  )

  return (window.__initialized = [
    {
      name: 'Inter',
      data: font,
      weight: 400,
      style: 'normal',
    },
    {
      name: 'Inter',
      data: fontBold,
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Material Icons',
      data: fontIcon,
      weight: 400,
      style: 'normal',
    },
  ])
}

const waitForResource = init()

const width = 400 * 2
const height = 255 * 2

export default function Playground() {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    ;(async () => {
      const fonts = await waitForResource
      const emojiCodes = getTwemojiMap('')
      const emojis = await Promise.all(
        Object.values(emojiCodes)
          .map(loadEmoji)
          .map((r) => r.then((res) => res.text()))
      )
      const graphemeImages = Object.fromEntries(
        Object.entries(emojiCodes).map(([key], index) => [
          key,
          `data:image/svg+xml;base64,` + btoa(emojis[index]),
        ])
      )

      const result = satori(card, {
        width,
        height,
        fonts,
        graphemeImages,
        styleInliner: (type, props) => {
          console.log(type, props)
          return {
            ...preflight(type),
            ...processClassName(props.className),
          }
        },
      })

      setSvg(result)
    })()
  }, [])

  return (
    <div id='container'>
      <div id='svg' dangerouslySetInnerHTML={{ __html: svg }}></div>
    </div>
  )
}
