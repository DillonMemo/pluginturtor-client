import * as d3 from 'd3'

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
    console.log('brushes', brushes)
    function brushend() {
      // Figure out if our latest brush has a selection

      const lastBrushID = brushes[brushes.length - 1].id
      const lastBrush = document.getElementById('brush-' + lastBrushID)
      console.log('brush end 1', `brush-${lastBrushID}`, lastBrush)
      const selection = d3.brushSelection(lastBrush as any)
      console.log('brush end 2', selection)
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
