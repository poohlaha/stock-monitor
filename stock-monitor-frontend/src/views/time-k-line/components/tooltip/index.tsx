/**
 * @fileOverview Tooltip
 * @date 2025-04-24
 * @author poohlaha
 */
import React, { memo, PropsWithChildren, ReactElement, useEffect, useRef, useState } from 'react'
import { TooltipDefaultDataProps } from '../../types/default'
import { IShareTooltipProps, ITooltipDataProps } from '../../types/share'
import ReactDOM from 'react-dom'
import Utils from '../../utils'

const Tooltip: React.FC<IShareTooltipProps> = memo((props: PropsWithChildren<IShareTooltipProps>): ReactElement => {
  const [point, setPoint] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  const tooltipRef = useRef(null)

  /**
   * 计算坐标, 判断是否超越边界
   */
  useEffect(() => {
    const current = tooltipRef.current
    if (!current) return

    requestAnimationFrame(() => {
      let x = props.x ?? 0
      let y = props.y ?? 0
      const rect = (current as HTMLElement).getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      const clientWidth = window.innerWidth ?? document.documentElement.clientWidth
      const clientHeight = window.innerHeight ?? document.documentElement.clientHeight

      const padding = 10 // 偏移量 10
      // 超出边界
      if (x + width + padding > clientWidth) {
        x = clientWidth - width - padding - (clientWidth - x) - padding
      }

      if (y + height + padding > clientHeight) {
        y = clientHeight - height - padding - (clientHeight - y) - padding
      }

      setPoint({ x, y })
      setVisible(true)
    })
  }, [props.x, props.y])

  const render = () => {
    const show = props.show ?? TooltipDefaultDataProps.show
    if (!show || props.data.length === 0) return <div></div>

    const className = Utils.isBlank(props.className || '') ? TooltipDefaultDataProps.className : props.className || ''
    const fontClassName = Utils.isBlank(props.fontClassName || '')
      ? TooltipDefaultDataProps.fontClassName
      : props.fontClassName || ''
    return ReactDOM.createPortal(
      <div
        className={`${props.prefixClassName || ''}-tooltip ${className || ''} p-2 absolute md:block w-40 rounded shadow-lg z-50 ${fontClassName || ''}`}
        style={{
          left: point.x,
          top: point.y,
          visibility: visible ? 'visible' : 'hidden'
        }}
        ref={tooltipRef}
      >
        {props.data.map((item: ITooltipDataProps, index: number) => {
          return (
            <div
              className="timer-tooltip-item h-6 flex items-center justify-between cursor-pointer text-gray-900"
              key={index}
            >
              <p className="mr-1">{item.label || ''}</p>
              <p className="" style={{ color: item.color || '' }}>
                {item.value || '-'}
              </p>
            </div>
          )
        })}
      </div>,
      document.body
    )
  }

  return render()
})

export default Tooltip
