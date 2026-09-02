/**
 * @fileOverview 输出默认属性
 * @date 2025-04-28
 * @author poohlaha
 */
// 分时图和K线图默认属性
export const TimeKDefaultProps = {
  fontSizeName: 'text-sm',
  prefixClassName: 'time-k',
  riseColor: '#f44336',
  fallColor: '#037B66',
  defaultColor: '#999999',
  flatColor: '#888888',
  fontSize: 12, //  默认字体大小
  fontFamily: 'Arial', // 默认字体名称
  barWidthScale: 0.8, // 成交量柱状图和k线图的宽度比例,保留 80% 显示，20% 留作间距，
  tabs: [
    {
      label: '分时',
      value: 'time'
    },
    {
      label: '五日',
      value: 'five'
    },
    {
      label: '日K',
      value: 'dailyK'
    },
    {
      label: '周K',
      value: 'weekK'
    },
    {
      label: '月K',
      value: 'monthK'
    }
  ]
}

// K 线图默认属性
export const KDefaultProps = {
  minCount: 25, // 展示最小的数量
  zoomStep: 0.8, // 滚轴滚动的最小步
  dragSpeed: 0.5, // 每拖动10px，平移多少个数据点
  rangeCount: 30 // 区间显示的数量
}

// 网格背景默认属性
export const GridDefaultProps = {
  color: 'rgba(186, 186, 186, 0.2)',
  lineType: 'dashed',
  horizontalLines: 4,
  verticalLines: 3
}

// x 轴 和 y 轴 默认属性
export const AxisDefaultProps = {
  lineColor: '#e0e0e0',
  textColor: '#bdc0c0',
  xLabels: ['09:30', '11:30/13:00', '15:00'],
  yPosition: 'left',
  padding: 30,
  needXLabelLine: false,
  needAxisXLine: true,
  needYLabelLine: false,
  needAxisYLine: true,
  lineWidthOrHeight: 5
}

// 价格最高线默认属性
export const HighestDefaultProps = {
  show: true,
  lineColor: '#333333',
  textColor: '#666666',
  lineType: 'dashed'
}

export const HighLowDefaultProps = {
  circleColor: '#666666',
  lineType: 'solid',
  lineWidth: 80
}

// 成交量柱状图默认属性
export const VolumeDefaultProps = {
  show: true,
  textColor: '#3D404D',
  height: 40
}

// 十字准线默认属性
export const DefaultCrossProps = {
  color: '#e0e0e0',
  lineType: 'dashed',
  textColor: '#848691',
  textBackgroundColor: 'rgba(132, 134, 145, 0.2)'
}

// Tooltip默认属性
export const TooltipDefaultDataProps = {
  className: 'bg-white',
  fontClassName: 'text-xs',
  show: true,
  width: 600
}

export type LineType = 'solid' | 'dashed'

export const XOffset: number = 0 // x 轴偏移量, 第一个元素需要向右偏移, 最后一个元素需要向左偏移
export const AxisTextOffset: number = 8 // 文字偏移量, x 轴和 y 轴第一个和最后一个元素需要偏移

// 标签左侧间距
export const getLabelLeftPadding = (width: number = 0) => {
  if (width > 0) {
    return AxisDefaultProps.lineWidthOrHeight + AxisTextOffset / 2 + width
  }

  return AxisDefaultProps.lineWidthOrHeight + AxisTextOffset / 2
}

// 标签右侧间距
export const getLabelRightPadding = (width: number) => {
  if (width === 0) return 0
  return width - AxisDefaultProps.lineWidthOrHeight - AxisTextOffset / 2
}

// 分时图和 K 线图整合默认属性
export const DefaultShareLineProps = {
  timeTitle: '分时',
  dailyTitle: '日K',
  weekTitle: '周K',
  monthTitle: '月K',
  tab: {
    className: 'bg-gray-100',
    activeIndex: 0,
    activeClassName: 'bg-white rounded',
    textColor: 'text-gray-500',
    activeTextColor: 'text-amber-600',
    fontClassName: 'text-sm font-serif'
  }
}

// 均线默认属性
export const DefaultMAProps = {
  fontClassName: 'text-xs',
  fiveColor: '#faa90e', // 5 日
  tenColor: '#ff6600', // 10 日
  twentyColor: '#416df9' // 20日
}
