import * as d3 from 'd3'
import { Multer, SliderArgs } from '../type'
import CursorIconSvg from '../lib/svgs/CursorIconSvg'

export const convertMillisecondsToTime = (time: number) => {
  // 총 밀리초 수 계산
  const totalMilliseconds = time * 1000
  // 분 계산
  const minutes = Math.floor(totalMilliseconds / 60000)
  // 남은 밀리초 수 계산
  const remainingMilliseconds = totalMilliseconds % 60000
  // 초 계산
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000)
  // 밀리초 계산
  const milliseconds = Math.round((remainingMilliseconds % 1000) / 10)

  // 시:분:초 형식으로 반환
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`
}

/**
 * create Element brush slider
 * @return {SVGSVGElement | null}
 */
export const slider = (
  ref: React.MutableRefObject<SVGSVGElement>,
  { layout, min, max, starting_min = min, starting_max = max }: SliderArgs,
  thumbnails: Multer.MulterFile[]
): SVGSVGElement | null => {
  const { width: initWidth, height: initHeight, margin } = layout

  const range = [min, max]
  const starting_range = [starting_min, starting_max]
  const [width, height] = [
    initWidth - margin.left - margin.right,
    initHeight - margin.top - margin.bottom,
  ]

  const xAxis = d3.scaleLinear().domain(range).range([0, width])
  const svg = d3.select(ref.current).attr('viewBox', `0, 0, ${initWidth}, ${initHeight}`)

  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on('brush', function (event: d3.D3BrushEvent<SVGElement>) {
      const { selection } = event

      if (!selection) return

      const hasUndefinedOrNull = selection.some(
        (num) => num === undefined || (typeof num === 'number' && isNaN(num)) || num === null
      )
      if (hasUndefinedOrNull) return

      // move brush handles
      handle.attr('display', null).attr('transform', function (_, i: number) {
        return `translate(${selection[i]}, ${-height})`
      })

      // update view
      // if the view should only be updated after brushing is over,
      // move these two lines into the on('end') part below
      const node = svg.node()
      if (node instanceof SVGSVGElement) {
        // eslint-disable-next-line no-extra-semi
        ;(node as any).value = selection.map<number>(function (d) {
          const temp = typeof d === 'number' ? xAxis.invert(d) : 0
          return +temp.toFixed(2)
        })

        console.log(d3.select('.selection').attr('x'), node.value)

        node.dispatchEvent(new CustomEvent('input'))
      }
    })

  const gBrush = svg
    .append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // create thumbnail group
  const gThumbnail = gBrush.append('g').attr('id', 'thumbnails')
  const imageWidth = width / thumbnails.length
  for (const index in thumbnails) {
    const buffer = Buffer.from(thumbnails[index].buffer.data)
    const blob = new Blob([buffer])
    gThumbnail
      .append('svg:image')
      .attr('class', 'thumbnail')
      .attr('width', `${imageWidth}`)
      .attr('height', height)
      .attr('x', `${imageWidth * +index}`)
      .attr('y', '0')
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('xlink:href', URL.createObjectURL(blob))
  }

  gBrush.call(brush)

  const brushResizePath = (data: { type: string }) => {
    const e = +(data.type === 'e'),
      x = e ? 1 : -1,
      y = height

    return `M${0.5 * x},${y}A6,6 0 0 ${e} ${6.5 * x},${y + 6}V${2 * y - 6}A6,6 0 0 ${e} ${0.5 * x},${2 * y}ZM${2.5 * x},${Math.floor(y + y / 3)}V${Math.floor(y + y / 1.5)}M${4.5 * x},${Math.floor(y + y / 3)}V${Math.floor(y + y / 1.5)}`
  }

  /** @description 좌우 양쪽끝 핸들 인터페이스 */
  const handle = gBrush
    .selectAll('.handle-custom')
    .data([{ type: 'w' }, { type: 'e' }])
    .enter()
    .append('path')
    .attr('class', 'handle-custom')
    .attr('stroke', '#000')
    .attr('fill', '#eee')
    .attr('cursor', 'ew-resize')
    .attr('d', brushResizePath)

  const brushcentered = (event: React.MouseEvent) => {
    const dx = xAxis(1) - xAxis(0),
      cx = d3.pointer(event)[0]
    const x0 = cx - dx / 2,
      x1 = cx + dx / 2

    console.log('brushcentered')
    d3.select((event.target as any).parentNode).call(
      brush.move,
      x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]
    )
  }

  gBrush
    .selectAll('.overlay')
    .each(function (data: unknown) {
      // eslint-disable-next-line no-extra-semi
      ;(data as { type: string }).type = 'selection'
    })
    .on('mousedown touchstart', brushcentered)

  // select entire range
  gBrush.call(brush.move, (starting_range as any).map(xAxis))

  return svg.node()
}
