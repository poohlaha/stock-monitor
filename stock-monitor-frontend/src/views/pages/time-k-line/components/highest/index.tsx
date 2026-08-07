/**
 * @fileOverview 价格最高线/价格基线
 * @date 2025-04-24
 * @author poohlaha
 */
import React, { memo } from 'react'
import { IShareHighestProps } from '../../types/share'
import Utils from '../../utils'
import { HighestDefaultProps, AxisTextOffset, getLabelLeftPadding, getLabelRightPadding } from '../../types/default'

const Highest: React.FC<IShareHighestProps> = memo((props: IShareHighestProps) => {
  const render = () => {
    const lineColor = props.lineColor ?? HighestDefaultProps.lineColor
    const textColor = props.textColor ?? HighestDefaultProps.textColor
    const lineType = props.lineType ?? HighestDefaultProps.lineType
    const strokeDasharray = lineType === 'dashed' ? '4 2' : 'none'

    // 计算 y 坐标
    const price = props.price
    const y = props.y || 0

    const label = `${price.toFixed(2)}`
    const { width, height } = Utils.onMeasureTextSize(`${label}`, props.fontSize, props.fontFamily)
    const textX = props.isAxisLeft ? width + AxisTextOffset : props.width - AxisTextOffset
    let amplitude = ''
    if (props.closingPrice > 0) {
      const fa = Utils.onCalculateRiseAndFall(price, props.closingPrice)
      amplitude = fa.amplitude
    }

    let amplitudeWidth: number = 0
    if (!Utils.isBlank(amplitude || '')) {
      const amplitudeSize = Utils.onMeasureTextSize(amplitude, props.fontSize, props.fontFamily)
      amplitudeWidth = amplitudeSize.width
    }

    const needAnotherSide = props.needAnotherSide ?? true
    return (
      <g className={`${props.prefixClassName || ''}-highest ${props.className || ''}`}>
        {/* 水平线 */}
        <line
          x1={0}
          y1={y}
          x2={props.width}
          y2={y}
          stroke={lineColor}
          strokeDasharray={strokeDasharray}
          strokeWidth={1}
        />

        {/* 文字标签(价格) */}
        {!props.hasHighest && (
          <text
            x={textX}
            y={y + height}
            fill={textColor}
            textAnchor="end"
            fontSize={props.fontSize}
            fontFamily={props.fontFamily}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {label || ''}
          </text>
        )}

        {/* 文字标签(百分比) */}
        {!props.hasHighest && !Utils.isBlank(amplitude || '') && needAnotherSide && (
          <text
            x={props.isAxisLeft ? getLabelRightPadding(props.width) : getLabelLeftPadding(amplitudeWidth)}
            y={y + height}
            fill={textColor}
            textAnchor="end"
            fontSize={props.fontSize}
            fontFamily={props.fontFamily}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {amplitude || ''}
          </text>
        )}
      </g>
    )
  }

  return render()
})

export default Highest
