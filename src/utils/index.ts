import * as d3 from 'd3'
import { Multer, SliderArgs } from '../type'
import { CursorPointType } from '../recoil/atom'
import { SetterOrUpdater } from 'recoil'
import { isNumber } from 'lodash'

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
  { layout, min, max, starting_min = min, starting_max = max }: SliderArgs,
  thumbnails: Multer.MulterFile[],
  setCursorPoint: SetterOrUpdater<CursorPointType>
): SVGSVGElement | null => {
  const { width: initWidth, height: initHeight, margin } = layout

  const stroke = '#000'
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
        const timeValue = selection.map<number>(function (d) {
          const temp = typeof d === 'number' ? xAxis.invert(d) : 0
          return +temp.toFixed(2)
        })

        isNumber(+selection[0]) &&
          setCursorPoint((prev) => ({
            ...prev,
            position: selection as number[],
            time: timeValue,
          }))

        node.dispatchEvent(new CustomEvent('input'))
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
    const dx = xAxis(1) - xAxis(0),
      cx = d3.pointer(event)[0]
    const x0 = cx - dx / 2,
      x1 = cx + dx / 2

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
  gBrush.call(brush.move, (starting_range as any).map(xAxis))

  return svg.node()
}
