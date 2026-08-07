/**
 * 锚点
 */
import React, { ReactElement, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import useMount from '@hooks/useMount'

interface IMAnchorProps {
  columns: Array<IMAnchorColumnProps>
  contents: Array<React.ReactNode>
}

interface IMAnchorColumnProps {
  key: string
  href: string
  title: string
}
const MAnchor: React.FC<IMAnchorProps> = (props: IMAnchorProps): ReactElement => {
  const [leftActiveIndex, setLeftActiveIndex] = useState(0)

  const leftChangeRef = useRef(-1)
  useMount(() => {
    onScroll()
  })

  const onScroll = (hasRemove: boolean = false) => {
    if (props.columns.length === 0) return
    let dom = document.querySelector('.m-anchor-right')
    let domScroll = document.querySelector('.m-anchor-right-scroll')
    let contents: any = []
    if (!dom || !domScroll) {
      return
    }

    if (domScroll) {
      contents = dom.querySelectorAll('.m-anchor-content')
    }

    let newColumns: Array<{ [K: string]: any }> = []
    contents.forEach((content: any, index: number) => {
      let rect = content.getBoundingClientRect()
      newColumns.push({
        ...props.columns[index],
        rect
      })
    })

    if (hasRemove) {
      dom.removeEventListener('scroll', onRunScroll.bind(dom, dom, newColumns))
      return
    }

    if (dom) {
      dom.addEventListener('scroll', onRunScroll.bind(dom, dom, newColumns))
    }
  }

  // 防抖
  const debounce = (fn: Function, delay: number = 300) => {
    let timer: any = null
    let handler = function () {
      if (timer) {
        clearTimeout(timer)
      }

      // @ts-ignore
      let that = this
      let args = arguments
      timer = setTimeout(() => {
        fn.apply(that, args)
      }, delay)
    }

    // @ts-ignore
    handler.cancel = () => {
      if (timer) clearTimeout(timer)
    }

    return handler
  }

  const onRunScroll = debounce((dom: HTMLDivElement, leftList: Array<{ [K: string]: any }>) => {
    let domTop = dom.scrollTop

    // 判断 domTop 在哪个区间
    let totalTop: number = 0
    let totalBottom: number = 0
    for (let i = 0; i < leftList.length; i++) {
      let dom = leftList[i] || {}
      let rect = dom.rect || {}
      if (i === 0) {
        totalBottom = rect.height
      } else {
        totalTop += rect.height
        totalBottom += rect.height
      }

      let isInArea = domTop >= totalTop && domTop <= totalBottom
      if (isInArea) {
        if (leftChangeRef.current === -1) {
          setLeftActiveIndex(i)
        }
      }
    }
  }, 50)

  const render = () => {
    if (props.columns.length === 0 || props.contents.length === 0) {
      return <div className="m-anchor"></div>
    }

    return (
      <div className="m-anchor wh100 flex">
        <div className="m-anchor-left flex">
          <div className="m-anchor-links w100">
            {props.columns.map((item, index) => {
              return (
                <div
                  className={`m-anchor-link cursor-pointer ${leftActiveIndex === index ? 'active' : ''}`}
                  key={item.key || index}
                  onClick={() => {
                    if (leftActiveIndex === index) return
                    let dom = document.getElementById(item.href || '')
                    if (dom) {
                      onScroll(true)
                      setLeftActiveIndex(index)
                      leftChangeRef.current = index
                      dom.scrollIntoView({ behavior: 'smooth' })
                      setTimeout(() => {
                        leftChangeRef.current = -1
                      }, 500)
                    }
                  }}
                >
                  <div className="m-anchor-link-title">{item.title || ''}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="m-anchor-right flex-1">
          <div className="m-anchor-right-scroll">
            {props.contents.map((item, index) => {
              return (
                <div className="m-anchor-content" key={index}>
                  {item}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MAnchor)
