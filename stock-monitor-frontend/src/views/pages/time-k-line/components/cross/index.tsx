/**
 * @fileOverview 十字准线
 * @date 2025-04-24
 * @author poohlaha
 */
import React, { memo, ReactElement } from 'react'
import { IShareCrossProps } from '../../types/share'
import Utils from '../../utils'
import { AxisDefaultProps, DefaultCrossProps } from '../../types/default'

const Cross: React.FC<IShareCrossProps> = memo((props: IShareCrossProps): ReactElement => {
  const padding = 5

  /**
   * 计算左边和右边显示文字
   */
  const getLeftRightLabel = () => {
    const price = props.isAxisLeft ? props.yLeftLabel || '' : props.yRightLabel || ''
    if (Utils.isBlank(price || '')) {
      return null
    }

    const p = parseFloat(Number(price).toFixed(2))
    const priceSize = Utils.onMeasureTextSize(`${p.toFixed(2)}`, props.fontSize, props.fontFamily)

    const { amplitude } = Utils.onCalculateRiseAndFall(p, props.closingPrice) // 计算涨跌幅
    const amplitudeSize = Utils.onMeasureTextSize(amplitude, props.fontSize, props.fontFamily)

    const yAmplitudes = props.yAmplitudes || []
    let leftLabel = ''
    let rightLabel = ''
    let leftTextWidth: number = 0
    let leftTextHeight: number = 0
    let rightTextWidth: number = 0
    let rightTextHeight: number = 0
    if (props.isAxisLeft) {
      leftLabel = price || ''
      rightLabel = yAmplitudes.length > 0 ? amplitude || '' : ''
      leftTextWidth = priceSize.width
      leftTextHeight = priceSize.height
      rightTextWidth = amplitudeSize.width
      rightTextHeight = amplitudeSize.height
    } else {
      leftLabel = yAmplitudes.length > 0 ? amplitude || '' : ''
      rightLabel = price || ''
      leftTextWidth = amplitudeSize.width
      leftTextHeight = amplitudeSize.height
      rightTextWidth = priceSize.width
      rightTextHeight = priceSize.height
    }

    return { leftLabel, rightLabel, leftTextWidth, rightTextWidth, leftTextHeight, rightTextHeight }
  }

  const getTopBottomLabel = () => {
    if (Utils.isBlank(props.xBottomLabel || '')) {
      return null
    }

    const bottomSize = Utils.onMeasureTextSize(`${props.xBottomLabel || ''}`, props.fontSize, props.fontFamily)

    let bX = props.x - bottomSize.width / 2 - padding
    if (bX < 0) {
      bX = props.x + padding
    }

    if (bX > props.width - padding - bottomSize.width) {
      bX = props.x - bottomSize.width - padding
    }

    const bY = props.innerHeight - bottomSize.height - padding
    return {
      bottomLabel: props.xBottomLabel,
      bX,
      bY,
      bottomTextHeight: bottomSize.height,
      bottomTextWidth: bottomSize.width
    }
  }

  const getLRLabelNode = () => {
    const labelProps = getLeftRightLabel()
    if (labelProps === null) return null

    const leftRectHeight = labelProps.leftTextHeight + padding
    const rightRectHeight = labelProps.rightTextHeight + padding

    return (
      <>
        {!Utils.isBlank(labelProps.leftLabel || '') && (
          <>
            <rect
              x={AxisDefaultProps.lineWidthOrHeight}
              y={(props.y || 0) - leftRectHeight / 2}
              width={(labelProps.leftTextWidth || 0) + padding}
              height={leftRectHeight || 0}
              fill={props.textBackgroundColor}
              rx={6}
              ry={6}
            />
            <text
              x={AxisDefaultProps.lineWidthOrHeight + padding / 2}
              y={props.y + leftRectHeight / 2 - padding}
              fill={props.textColor}
              textAnchor="start"
              fontSize={props.fontSize}
              fontFamily={props.fontFamily}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {labelProps.leftLabel || ''}
            </text>
          </>
        )}

        {!Utils.isBlank(labelProps.rightLabel || '') && (
          <>
            <rect
              x={props.width - (labelProps.rightTextWidth + AxisDefaultProps.lineWidthOrHeight + padding)}
              y={(props.y || 0) - (rightRectHeight || 0) / 2}
              width={(labelProps.rightTextWidth || 0) + padding}
              height={rightRectHeight || 0}
              fill={props.textBackgroundColor}
              rx={6}
              ry={6}
            />
            <text
              x={props.width - (labelProps.rightTextWidth + padding / 2 + AxisDefaultProps.lineWidthOrHeight)}
              y={props.y + rightRectHeight / 2 - padding}
              fill={props.textColor}
              textAnchor="start"
              fontSize={props.fontSize}
              fontFamily={props.fontFamily}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {labelProps.rightLabel || ''}
            </text>
          </>
        )}
      </>
    )
  }

  const getTBLabelNode = () => {
    const labelProps = getTopBottomLabel()
    if (labelProps === null) return null

    const bottomRectHeight = labelProps.bottomTextHeight + padding
    const rectBX = labelProps.bX - padding / 2
    const rectBY = props.innerHeight - bottomRectHeight

    return (
      !Utils.isBlank(labelProps.bottomLabel || '') && (
        <>
          <rect
            x={rectBX || 0}
            y={rectBY || 0}
            width={labelProps.bottomTextWidth + padding}
            height={(bottomRectHeight || 0) + padding}
            fill={props.textBackgroundColor}
            rx={6}
            ry={6}
          />
          <text
            x={rectBX + padding / 2}
            y={rectBY + padding + bottomRectHeight / 2}
            fill={props.textColor}
            textAnchor="start"
            fontSize={props.fontSize}
            fontFamily={props.fontFamily}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {labelProps.bottomLabel || ''}
          </text>
        </>
      )
    )
  }

  const render = () => {
    const show = props.show ?? true
    if (!show) return <div></div>

    const color = props.color ?? DefaultCrossProps.color
    const lineType = props.lineType ?? DefaultCrossProps.lineType
    const strokeDasharray = lineType === 'dashed' ? '4 2' : 'none'

    return (
      <svg width={props.width} height={props.height} className={`${props.prefixClassName || ''}-cross`}>
        {/* 纵向 */}
        <line x1={props.x} y1={0} x2={props.x} y2={props.height} stroke={color} strokeDasharray={strokeDasharray} />

        {/* 横向 */}
        <line x1={0} y1={props.y} x2={props.width} y2={props.y} stroke={color} strokeDasharray={strokeDasharray} />

        {/* 横向 */}
        {getLRLabelNode()}

        {/* 纵向 */}
        {getTBLabelNode()}
      </svg>
    )
  }

  return render()
})

export default Cross
