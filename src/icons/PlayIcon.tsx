import { SVGProps } from '../type'

export default function PlayIcon({
  width = '2.5rem',
  height = '2.5rem',
  fill = 'currentColor',
  stroke = 'currentColor',
  strokeWidth = '2',
}: SVGProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <g
        fill={fill}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}>
        <path d="M9 18L7 18L7 6L9 6L9 18" />
        <path d="M15 6L17 6L17 18L15 18L15 6" />
      </g>
    </svg>
  )
}
