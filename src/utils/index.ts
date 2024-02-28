import * as d3 from 'd3'
import { Multer, SliderArgs } from '../type'

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
      const selection = event.selection

      if (!selection) return

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

        node.dispatchEvent(new CustomEvent('input'))
      }
    })

  const gBrush = svg
    .append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const gThumbnail = gBrush.append('g').attr('class', 'thumbnails')
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

    return `M${0.5 * x},${y}A6,6 0 0 ${e} ${6.5 * x},${y + 6}V${2 * y - 6}A6,6 0 0 ${e} ${0.5 * x},${2 * y}ZM${2.5 * x},${y + 8}V${2 * y - 8}M${4.5 * x},${y + 8}V${2 * y - 8}`
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
      cx = d3.pointer(event.target)[0]
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

  // select entire range
  gBrush.call(brush.move, (starting_range as any).map(xAxis))

  return svg.node()
}
/**
 * @description
 * multiple brush example
 * 1. 처음 브러쉬는 전체를 Focus 한다.
 * 2. 더블클릭시 Focus한 브러쉬는 해제되어야 한다.
 * 3.
 */
export const D3BrushExample1 = () => {
  const margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom

  const svg = d3
    .select('.test-d3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  svg.append('rect').attr('class', 'grid-background').attr('width', width).attr('height', height)
  const gBrushes = svg.append('g').attr('class', 'brushes')

  const brushes: { id: number; brush: d3.BrushBehavior<any> }[] = []

  function newBrush() {
    const brush = d3.brushX().on('end', brushend)

    brushes.push({ id: brushes.length, brush })
    function brushend() {
      // Figure out if our latest brush has a selection

      const lastBrushID = brushes[brushes.length - 1].id
      const lastBrush = document.getElementById('brush-' + lastBrushID)
      const selection = d3.brushSelection(lastBrush as any)
      if (selection) {
        selection[0] !== selection[1] && newBrush()
      }

      drawBrushes()
    }
  }

  function drawBrushes() {
    const brushSelection = gBrushes.selectAll('.brush').data(brushes, function (d: any) {
      return d
    })

    // Set up new brushes
    brushSelection
      .enter()
      .insert('g', '.brush')
      .attr('class', 'brush')
      .attr('id', function (brush) {
        const isElementById = `brush-${brush.id}`

        return isElementById
      })
      .each(function (brushObject) {
        //call the brush
        brushObject.brush(d3.select(this))
      })

    brushSelection.each(function (brushObject) {
      d3.select(this)
        .attr('class', 'brush')
        .selectAll('.overlay')
        .style('pointer-events', function () {
          const brush = brushObject.brush
          if (brushObject.id === brushes.length - 1 && brush !== undefined) {
            return 'all'
          } else {
            return 'none'
          }
        })
    })
  }

  newBrush()
  drawBrushes()
}

/** @description example d3-brush */
export const D3BrushExample2 = () => {
  function contains([[x0, y0], [x1, y1]]: number[][], [x, y]: number[]) {
    return x >= x0 && x < x1 && y >= y0 && y < y1
  }
  function brushed(selection: any) {
    point.attr('fill', selection && ((d) => (contains(selection, d) ? 'red' : null)))
  }
  function brushended(event: d3.D3BrushEvent<SVGElement>) {
    if (!event.sourceEvent) return
    const brushEl = document.querySelector('.brush-group')
    d3.select(brushEl)
      .transition()
      .delay(100)
      .duration(event.selection ? 750 : 0)
      .call(brush.move as any, defaultExtent)
  }
  const width = 600,
    height = 600,
    data = Array.from({ length: 1000 }, () => [Math.random() * width, Math.random() * height]),
    defaultExtent = [
      [width * 0.1, width * 0.1],
      [width * 0.3, width * 0.3],
    ]
  const brush = d3
    .brush()
    .on('start brush', ({ selection }) => brushed(selection))
    .on('end', brushended)
  const svg = d3.create('svg').attr('viewBox', [0, 0, width, height])
  const point = svg
    .append('g')
    .attr('fill', '#ccc')
    .attr('stroke', '#777')
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', (d) => d[0])
    .attr('cy', (d) => d[1])
    .attr('r', 3.5)

  svg
    .append('g')
    .attr('class', 'brush-group')
    .call(brush as any)
    .call(brush.move as any, defaultExtent)

  const containerNode = document.querySelector('.test-d3')
  if (containerNode instanceof HTMLDivElement) {
    containerNode.style.cssText = `
        ${containerNode.style.cssText}
        width: 500px;
        height: 300px;
      `
    const svgNode = svg.node()
    svgNode && containerNode.appendChild(svgNode)
  }
}
