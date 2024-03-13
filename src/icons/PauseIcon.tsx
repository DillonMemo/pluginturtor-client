import { SVGProps } from '../type'

export default function PauseIcon({
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
        <path d="M8 6L18 12L8 18z" />
      </g>
    </svg>
  )
}
