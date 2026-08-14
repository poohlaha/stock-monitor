/**
 * @fileOverview 分组: 一行一个
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { PropsWithChildren, ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'

interface IGroupTemplateProps {
  className?: string
  bodyClassName?: string
  bodyNeedMargin?: boolean
  title?: string
  titleRight?: React.ReactNode
  needBorder?: boolean
  needRounded?: boolean
  titleSizeClassName?: string
}

const GroupTemplate = (props: PropsWithChildren<IGroupTemplateProps>): ReactElement => {

  const getTitle = () => {
    let titleSizeClassName = props.titleSizeClassName || ''
    if (Utils.isBlank(titleSizeClassName || '')) {
      titleSizeClassName = 'text-2xl'
    }

    if (props.titleRight) {
      return (
          <div className="flex-align-center flex-jsc-between">
            <p className={`${titleSizeClassName || ''} font-bold mr-2`}>{props.title || ''}</p>
            {props.titleRight}
          </div>
      )
    }

    if (Utils.isBlank(props.title || '')) {
      return null
    }

    return  <p className={`${titleSizeClassName || ''} font-bold`}>{props.title || ''}</p>
  }

  const render = () => {
    const bodyNeedMargin = props.bodyNeedMargin ?? true
    return (
      <div
        className={`one-template flex-direction-column ${props.className || ''} ${props.needBorder ? 'border' : ''} ${props.needBorder ? 'rounded-lg' : ''}`}
      >
        {getTitle()}
        <div className={`${bodyNeedMargin ? 'mt-4' : ''} ${props.bodyClassName || ''}`}>{props.children}</div>
      </div>
    )
  }

  return render()
}

export default observer(GroupTemplate)
