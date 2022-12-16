// - 前期准备工作
const dms = {
  width: 1000,
  height: 500,
  margin: {
    top: 50,
    right: 100,
    bottom: 50,
    left: 100,
  }
}

const contentWidth = dms.width - dms.margin.left - dms.margin.right
const contentHeight = dms.height - dms.margin.top - dms.margin.bottom

const svg = d3.select('#box-div')
  .append('svg')
  .attr('id', 'box')
  .attr('width', dms.width)
  .attr('height', dms.height)

const content = svg.append('g')
  .attr('id', 'content')
  .style('transform', `translate(${dms.margin.left}px, ${dms.margin.top}px)`)

const yesLine = content.append('g')
  .attr('id', 'yes-line')

// - 读取数据
d3.json('./assets/sh_day.json')
  .then(drawLineChart)

function drawLineChart(dataset) {
  console.log(dataset)
  // 我们的日期格式是"2022-04-01",
  // d3.scaleTime().domain([min,max])中min和max是代表定义域范围，
  // 在scaleTime中，min的格式只接受标准时间格式，
  // 所以我们需要借助这个工具函数去转换。
  const parseTime = d3.timeParse('%Y-%m-%d')

  // 时间比例尺
  const dateScale = d3.scaleTime()
    .domain(d3.extent(dataset, item => parseTime(item.date))) //定义域
    .range([0, contentWidth]) //值域

  // 笔记
  console.log(d3.extent(dataset, item => parseTime(item.date)))
  /*
  d3.extent(array[,accessor])：给定一个数组，返回[最小值, 最大值]
  本例给的不是一个一维数组，所以要用到 item => parseTime(item.date)
  又因为我们的时间格式不是标准时间格式它无法比较，所以要借助parseTime来转换。
  最后打印结果：["2022-03-31T16:00:00.000Z","2022-05-07T16:00:00.000Z"]
  我们的时区+8，对比dataset，可知最小值，最大值是正确的。
 */

  // 确诊人数，线性比例尺
  const yesScale = d3.scaleLinear()
    .domain(d3.extent(dataset, item => item.yes))
    .range([contentHeight, dms.margin.top])

  // 绘制确诊人数折线图
  // 绘制点
  yesLine.selectAll('circle')
    .data(dataset)
    .join('circle') // 简写，等于：.enter().append('circle')
    .attr('cx', item => dateScale(parseTime(item.date))) //用比例尺计算画布上的圆心x坐标
    .attr('cy', item => yesScale(item.yes))
    .attr('r', 5)
  // 绘制线
  const lineGenerator = d3.line()
    .x(item => dateScale(parseTime(item.date)))
    .y(item => yesScale(item.yes))
    // .curve(d3.curveBasis)

  yesLine.append('path')
    .attr('d', lineGenerator(dataset))
}
