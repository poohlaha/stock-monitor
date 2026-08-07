/**
 * @fileOverview 网格背景, 使用 svg 画制
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { memo } from 'react'
import { IShareGridProps } from '../../types/share'
import { GridDefaultProps } from '../../types/default'

const Grid: React.FC<IShareGridProps> = memo((props: IShareGridProps) => {
  const render = () => {
    const lineType = props.lineType ?? GridDefaultProps.lineType
    // 如果是 `dashed`, 那么画线时绘制 4 像素的实线, 然后间隔 2 像素, 依次类推....
    const strokeDasharray = lineType === 'dashed' ? '4 2' : 'none'

    // 颜色
    let lineColor = props.color ?? GridDefaultProps.color
    const xPoints = props.xPoints || []
    const yPoints = props.yPoints || []
    const isYLeft = props.isYLeft
    return (
      <svg width={props.width} height={props.height} className={`${props.prefixClassName || ''}-grid`}>
        {/* 纵向 */}
        {xPoints.map((point, i) => {
          const line = point.line || {}
          let needLine = true
          if (isYLeft && i === 0) {
            needLine = false
          } else if (!isYLeft && i === xPoints.length - 1) {
            needLine = false
          }

          if (!needLine) return null

          return (
            <line
              key={`h-${i}`}
              x1={line.x1}
              y1={0}
              x2={line.x2}
              y2={props.height}
              stroke={lineColor}
              strokeDasharray={strokeDasharray}
            />
          )
        })}

        {/* 横向 */}
        {yPoints.map((point, i) => {
          const line = point.line || {}
          let needLine = true
          if (isYLeft && i === 0) {
            needLine = false
          }

          if (!needLine) return null

          let newLineColor = lineColor

          // 最高线
          const highest = point.highest || {}
          if (highest.show && highest.isHighest) {
            newLineColor = highest.lineColor
          }

          // 基线
          const basic = point.basic || {}
          if (basic.show && basic.isBasic) {
            newLineColor = basic.lineColor
          }

          let y1 = line.y1
          let y2 = line.y2
          if (i === yPoints.length - 1) {
            y1 = 0
            y2 = 0
          }

          return (
            <line
              key={`v-${i}`}
              x1={0}
              y1={y1}
              x2={props.width}
              y2={y2}
              stroke={newLineColor}
              strokeDasharray={strokeDasharray}
            />
          )
        })}
      </svg>
    )
  }

  return render()
})

export default Grid
