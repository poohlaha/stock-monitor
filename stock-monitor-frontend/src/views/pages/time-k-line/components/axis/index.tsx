/**
 * @fileOverview X 轴 | Y 轴坐标
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, memo } from 'react'
import { AxisDefaultProps, AxisTextOffset, TimeKDefaultProps } from '../../types/default'
import Utils from '../../utils'
import { IShareAxisProps } from '../../types/share'

const Axis: React.FC<IShareAxisProps> = memo((props: IShareAxisProps): ReactElement => {
  /**
   * 获取涨跌幅
   */
  const getAmplitudeValue = (index: number) => {
    const yAmplitudes = props.yAmplitudes || []
    if (yAmplitudes.length === 0) {
      return ''
    }

    if (index > yAmplitudes.length - 1) {
      return ''
    }

    return yAmplitudes[index] || ''
  }

  const render = () => {
    let lineColor = props.lineColor ?? AxisDefaultProps.lineColor
    let textColor = props.textColor ?? AxisDefaultProps.textColor
    let fontSize = props.fontSize ?? 0
    if (fontSize === 0) {
      fontSize = TimeKDefaultProps.fontSize
    }
    const fontFamily = Utils.isBlank(props.fontFamily || '') ? TimeKDefaultProps.fontFamily : props.fontFamily || ''

    const isYLeft = props.isYLeft
    const xPoints = props.xPoints || []
    const yPoints = props.yPoints || []

    return (
      <>
        <svg
          width={props.width}
          height={props.height}
          className={`${props.prefixClassName || ''}-axis ${props.className || ''}`}
        >
          {/* x 轴线(减去1避免覆盖 Y 轴 */}
          {props.needAxisXLine && (
            <line x1={0} y1={props.height - 0.5} x2={props.width} y2={props.height - 0.5} stroke={lineColor} />
          )}

          {/* y 轴线一侧价格线(不画到底，避免与 X 轴重合) */}
          {props.needAxisYLine && (
            <line
              x1={isYLeft ? 0 : props.width}
              y1={0}
              x2={isYLeft ? 0 : props.width}
              y2={props.height}
              stroke={lineColor}
            />
          )}

          {/* y 轴线一侧涨跌幅线(不画到底，避免与 X 轴重合) */}
          {props.needAxisYLine && (props.yAmplitudes || []).length > 0 && (
            <line
              x1={isYLeft ? props.width : 0}
              y1={0}
              x2={isYLeft ? props.width : 0}
              y2={props.height}
              stroke={lineColor}
            />
          )}
        </svg>

        {/* y轴刻度线和文字(价格) */}
        <svg width={props.width} height={props.height} className={`${props.prefixClassName || ''}-axis-y`}>
          {yPoints.length > 0 &&
            yPoints.map((point, i) => {
              const line = point.line || {}
              const text = point.text || {}
              const needLine = point.needLine
              let newLineColor = lineColor

              // 最高线
              const highest = point.highest || {}
              let newTextColor = textColor
              if (highest.show && highest.isHighest) {
                newLineColor = highest.lineColor
                newTextColor = highest.textColor
              }

              // 基线
              const basic = point.basic || {}
              if (basic.show && basic.isBasic) {
                newLineColor = basic.lineColor
                newTextColor = basic.textColor
              }

              const amplitude = getAmplitudeValue(i) || ''
              return (
                <g key={`y-${i}`}>
                  {/* 第一个不要显示刻度线(价格) */}
                  {needLine && props.needYLabelLine && (
                    <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={newLineColor} />
                  )}

                  {/* 第一个不要显示刻度线(涨跌幅) */}
                  {needLine && props.needYLabelLine && (
                    <line
                      x1={props.isYLeft ? props.width - AxisDefaultProps.lineWidthOrHeight : 0}
                      y1={line.y1}
                      x2={props.isYLeft ? props.width : AxisDefaultProps.lineWidthOrHeight}
                      y2={line.y2}
                      stroke={newLineColor}
                    />
                  )}

                  {/* 价格 */}
                  <text
                    x={text.x}
                    y={text.y}
                    fill={newTextColor}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    textAnchor={text.anchor}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {point.label || ''}
                  </text>

                  {/* 涨跌幅 */}
                  {!Utils.isBlank(amplitude || '') && (
                    <text
                      x={
                        props.isYLeft
                          ? props.width - AxisDefaultProps.lineWidthOrHeight - AxisTextOffset / 2
                          : AxisDefaultProps.lineWidthOrHeight + AxisTextOffset / 2
                      }
                      y={text.y}
                      fill={newTextColor}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                      textAnchor={text.anchor}
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >
                      {amplitude || ''}
                    </text>
                  )}
                </g>
              )
            })}
        </svg>

        {/* y轴刻度线和文字(比例) */}

        {/* x 轴刻度线和文字, 第一个和最后一个要单独处理, 防止遮挡 */}
        <svg width={props.width} height={props.totalHeight} className={`${props.prefixClassName || ''}-axis-x`}>
          {xPoints.map((point, i: number) => {
            const line = point.line || {}
            const text = point.text || {}
            let needLine = point.needLine

            if (needLine) {
              // 单独处理第一个和最后一个
              if (props.needAxisYLine) {
                if (i === 0 || i === xPoints.length - 1) {
                  needLine = false
                }
              }
            }

            return (
              <g key={`x-${i}`}>
                {needLine && props.needXLabelLine && (
                  <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={lineColor} />
                )}
                <text
                  x={text.x}
                  y={text.y}
                  fill={textColor}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                  textAnchor={text.anchor}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {point.label || ''}
                </text>
              </g>
            )
          })}
        </svg>
      </>
    )
  }

  return render()
})

export default Axis
