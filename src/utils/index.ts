import * as d3 from 'd3'
import { CustomVideoElement, Multer, SliderArgs, SliderLayout } from '../type'
import { isNumber } from 'lodash'

/**
 * Find the closest aspect ratio based on width and height.
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
export const findClosestRatio = (width: number, height: number) => {
  const ratios: { [key: string]: number } = {
    '1:1': 1 / 1,
    '2:1': 2 / 1,
    '3:4': 3 / 4,
    '9:16': 9 / 16,
    '16:9': 16 / 9,
  }

  let minDiff = Infinity
  let closestRatio = ''

  for (const ratio in ratios) {
    const diff = Math.abs(ratios[ratio] - width / height)
    if (diff < minDiff) {
      minDiff = diff
      closestRatio = ratio
    }
  }

  return closestRatio.replace(':', '/')
}
/**
 * create Element brush slider
 * @return {SVGSVGElement | null}
 */
export const slider = (
  ref: React.MutableRefObject<SVGSVGElement>,
  videoRef: React.MutableRefObject<CustomVideoElement>,
  { layout, min, max, starting_min = min, starting_max = max }: SliderArgs,
  thumbnails: Multer.MulterFile[]
): void => {
  const { width: initWidth, height: initHeight, margin } = layout

  const stroke = '#000'
  const range = [min, max]
  const starting_range = [starting_min, starting_max]
  const [width, height] = [
    initWidth - margin.left - margin.right,
    initHeight - margin.top - margin.bottom,
  ]

  const xScale = d3.scaleLinear().domain(range).range([0, width])
  const svg = d3
    .select(ref.current)
    .attr('viewBox', `0, 0, ${initWidth}, ${initHeight}`)
    .attr('id', 'tool-content')

  // create cursor group
  const gCursor = drawCursor(layout, xScale, videoRef)
  // create brush group
  const gBrush = svg
    .append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  // create thumbnail group
  const gThumbnail = gBrush.append('g').attr('id', 'thumbnails')

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
      const gCursorNode = gCursor.node()

      if (gCursorNode instanceof SVGGElement) {
        /** 커서 너비, 높이 */
        const { width: gCursorWidth, height: gCursorHeight } = gCursorNode.getBoundingClientRect()
        /** [기본 X축, 기본 Y축] */
        const [defaultX, defaultY] = [
          Math.floor(margin.left - gCursorWidth / 2),
          Math.floor(margin.top - (gCursorHeight + layout.expandHeight)),
        ]
        /** 이동된 X축 */
        const curX = +selection[0] + defaultX
        /** 이전 X축 */
        const prevX = +gCursor.attr('x')

        /** [시작시간, 종료시간] */
        const timeRange = getTimeRange(selection, xScale)

        if (
          isNumber(prevX) &&
          (prevX < +selection[0] + defaultX || prevX > +selection[1] + defaultX)
        ) {
          gCursor.attr('transform', `translate(${curX}, ${defaultY})`).attr('x', curX)
          videoRef.current.currentTime = timeRange[0]
        }

        videoRef.current.timeRange = timeRange
        videoRef.current.positionRange = selection as number[]
      }
    })
    .on('end', function (event: d3.D3BrushEvent<SVGElement>) {
      const { selection } = event

      if (!selection) {
        const [mx] = d3.pointer(event, this)
        const calc = mx > width ? width : Math.max(mx, 10)
        d3.select(this).call(brush.move, [calc - 10, calc])
        return
      }
    })

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

    return `M${0.5 * x},${y}A10,10 0 0 ${e} ${9.5 * x},${y + 10}V${2 * y - 8}A10,10 0 0 ${e} ${0.5 * x},${2 * y}ZM${5 * x},${Math.floor(y + y / 3)}V${Math.floor(y + y / 1.5)}M${7 * x},${Math.floor(y + y / 3)}V${Math.floor(y + y / 1.5)}`
  }

  /** @description 좌우 양쪽끝 핸들 인터페이스 */
  const handle = gBrush
    .selectAll('.handle-custom')
    .data([{ type: 'w' }, { type: 'e' }])
    .enter()
    .append('path')
    .attr('class', 'handle-custom')
    .attr('stroke', stroke)
    .attr('fill', '#eee')
    .attr('cursor', 'ew-resize')
    .attr('d', brushResizePath)

  const brushcentered = (event: React.MouseEvent) => {
    const dx = xScale(1) - xScale(0),
      cx = d3.pointer(event)[0]
    const x0 = +(cx - dx / 2).toFixed(2),
      x1 = +(cx + dx / 2).toFixed(2)

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

  gBrush.select('.selection').attr('stroke', stroke)
  // select entire range
  gBrush.call(brush.move, (starting_range as any).map(xScale))
}

/**
 * 커서 생성
 * @param {SliderLayout} layout 레이아웃
 * @param {d3.ScaleLinear<number, number, never>} xAxis x축
 * @returns {d3.Selection<SVGGElement, unknown, HTMLElement, any>}
 */
export const drawCursor = (
  { expandHeight, margin }: SliderLayout,
  xScale: d3.ScaleLinear<number, number, never>,
  videoRef: React.MutableRefObject<CustomVideoElement>
) => {
  const cursorPath = () =>
    `M0 3C0 1.34314 1.34315 0 3 0H9C10.6569 0 12 1.34315 12 3V11.8287C12 12.7494 11.5772 13.6191 10.8531 14.1879L6 18L1.14686 14.1879C0.422795 13.6191 0 12.7494 0 11.8287V3Z`
  const svg = d3.select('#tool-content')
  const gCursor = svg
    .append('g')
    .attr('cursor', 'ew-resize')
    .attr('class', 'cursor')
    .attr('stroke', 'black')
    .attr('stroke-width', `${expandHeight}`)
    .attr('fill', 'white')

  gCursor.append('path').attr('d', cursorPath)

  const drag = d3
    .drag()
    .on('start', function () {
      d3.select(this).attr('fill', 'black')
    })
    .on(
      'drag',
      function (event: d3.D3DragEvent<SVGGElement, d3.SimulationNodeDatum, d3.SubjectPosition>) {
        const gBrush = document.querySelector('.brush')
        if (gBrush instanceof SVGGElement) {
          const selection = d3.brushSelection(gBrush)
          if (!selection) return

          const { width, height } = this.getBoundingClientRect()
          const [defaultX, defaultY] = [
            Math.floor(margin.left - width / 2),
            Math.floor(margin.top - (height + expandHeight)),
          ]
          const cx = Math.floor(event.x)

          if (cx < +selection[0] + defaultX || cx > +selection[1] + defaultX) return
          const curTime = getTimeRange([cx - defaultX, +selection[1]], xScale)[0]
          d3.select(this).raise().attr('transform', `translate(${cx}, ${defaultY})`).attr('x', cx)
          videoRef.current.currentTime = curTime
        }
      }
    )
    .on('end', function () {
      d3.select(this).attr('fill', 'white')
    })

  gCursor.call(drag as any).on('click', function (event, _) {
    if (event.preventDefault) return
  })

  return gCursor
}

const getTimeRange = (
  selection: d3.BrushSelection,
  xScale: d3.ScaleLinear<number, number, never>
) =>
  selection.map<number>(function (d) {
    const temp = typeof d === 'number' ? xScale.invert(d) : 0
    return +temp.toFixed(2)
  })
