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

const dateAxis = content.append('g')
  .attr('id', 'date-axis')
  .style('transform', `translateY(${contentHeight}px)`)

const yesAxis = content.append('g')
  .attr('id', 'yes-axis')

// - 读取数据
d3.json('./assets/sh_day.json')
  .then(drawLineChart)

// 我们的日期格式是"2022-04-01",
// d3.scaleTime().domain([min,max])中min和max是代表定义域范围，
// 在scaleTime中，min的格式只接受标准时间格式，
// 所以我们需要借助这个工具函数去转换。
const parseTime = d3.timeParse('%Y-%m-%d')

function computeScale(dataset) {
  // - 时间比例尺
  const dateScale = d3.scaleTime()
    .domain(d3.extent(dataset, item => parseTime(item.date))) //定义域
    .range([0, contentWidth]) //值域
    .nice() //修改domain把数据变成最近的整数，更好看。

  // 📌笔记
  console.log(d3.extent(dataset, item => parseTime(item.date)))
  /*
    d3.extent(array[,accessor])：给定一个数组，返回[最小值, 最大值]
    本例给的不是一个一维数组，所以要用到 item => parseTime(item.date) 拿出date数据
    又因为我们的时间格式不是标准时间格式 extent 无法比较，所以要借助 parseTime 来转换。
    最后打印结果：["2022-03-31T16:00:00.000Z","2022-05-07T16:00:00.000Z"]
    我们的时区+8，对比 dataset 可知，最小值、最大值是正确的。
 */

  // - 确诊人数，线性比例尺
  const yesScale = d3.scaleLinear()
    .domain(d3.extent(dataset, item => item.yes))
    .range([contentHeight, dms.margin.top])
    .nice()
  /*
    nice()：
    如果域是根据实际数据自动计算的（例如，通过使用<code>d3.extent</code>），
    则开始值和结束值可能不是整数。
    这不一定是个问题，但它可能看起来有点不整洁。
    因此，D3.nice()提供了一个刻度函数，它将域四舍五入到“不错”的舍入值。
   */

  return {
    dateScale,
    yesScale,
  }
}

// 绘制确诊人数折线图
function drawYesLine(dataset, dateScale, yesScale) {
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
    .curve(d3.curveCatmullRom) //曲线

  yesLine.append('path')
    .attr('d', lineGenerator(dataset)) // lineGenerator(dataset) 返回的就是路径信息
}

// 绘制时间、确诊人数坐标轴
function drawAxis(dateScale, yesScale) {
  // - date坐标轴
  const dateAxisGenerator = d3.axisBottom()
    .scale(dateScale)
    .ticks(6, d3.timeFormat('%m-%d'))

  dateAxis.call(dateAxisGenerator)

  dateAxis.append('text')
    .attr('id', 'date-title')
    .attr('x', contentWidth + 30)
    .attr('y', 0)
    .text('日期')

  // - 确诊人数坐标轴
  const yesAxisGenerator = d3.axisLeft()
    .scale(yesScale)
    .ticks(6)
  yesAxis.call(yesAxisGenerator)

  yesAxis.append('text')
    .attr('id', 'yes-title')
    .attr('x', 0)
    .attr('y', 30)
    .text('确诊人数')
}

function drawLineChart(dataset) {
  console.log(dataset)
  const { dateScale, yesScale } = computeScale(dataset)
  drawYesLine(dataset, dateScale, yesScale)
  drawAxis(dataset, dateScale, yesScale)
}

