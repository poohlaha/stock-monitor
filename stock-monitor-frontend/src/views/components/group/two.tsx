/**
 * @fileOverview 分组: 一行两个
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { PropsWithChildren, ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'

interface IGroupTwoTemplateProps {
  className?: string
  bodyClassName?: string
  bodyNeedMargin?: boolean
  title?: string
  titleNode?: React.ReactNode
  needBorder?: boolean
  needRounded?: boolean
  titleSizeClassName?: string
}

const GroupTwoTemplate = (props: PropsWithChildren<IGroupTwoTemplateProps>): ReactElement => {
  const render = () => {
    const bodyNeedMargin = props.bodyNeedMargin ?? true
    let titleSizeClassName = props.titleSizeClassName || ''
    if (Utils.isBlank(titleSizeClassName || '')) {
      titleSizeClassName = 'text-2xl'
    }

    return (
      <div
        className={`two-template flex-direction-column ${props.className || ''} ${props.needBorder ? 'border' : ''} ${props.needBorder ? 'rounded-lg' : ''}`}
      >
        {(!Utils.isBlank(props.title || '') || props.titleNode) && (
          <div className="flex-align-center">
            {!Utils.isBlank(props.title || '') && (
              <p className={`${titleSizeClassName || ''} font-bold ${props.titleNode ? 'mr-1' : ''}`}>
                {props.title || ''}
              </p>
            )}
            {props.titleNode}
          </div>
        )}

        <div className={`${bodyNeedMargin ? 'mt-4' : ''} ${props.bodyClassName || ''} flex flex-col lg:flex-row gap-5`}>
          {props.children}
        </div>
      </div>
    )
  }

  return render()
}

export default observer(GroupTwoTemplate)
