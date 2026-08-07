/**
 * table
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'
import useMount from '@hooks/useMount'
import NoData from '@views/components/noData'
import { Tooltip } from 'antd'

interface IMTableProps {
  className?: string
  columns: Array<{ [K: string]: any }>
  dataSource: Array<{ [K: string]: any }>
  actions?: Array<{ [K: string]: any }>
}

const MTable: React.FC<IMTableProps> = (props: IMTableProps): ReactElement => {
  useMount(async () => {})

  const getCellHtml = (item: { [K: string]: any } = {}) => {
    let columns = props.columns || []
    let actions = props.actions || []
    if (columns.length === 0) return []

    let cells: Array<React.ReactNode> = []
    for (const column of columns) {
      let style: { [K: string]: any } = {}
      let needTooltip = column.needTooltip
      if (needTooltip === null || needTooltip === undefined) {
        needTooltip = true
      }

      if (!Utils.isBlank(column.width)) {
        style.width = column.width || ''
      }

      if (column.key === 'actions') {
        cells.push(
          <div key="m-cell m-cell-actions" className="m-cell m-cell-actions flex-align-center" style={style}>
            {actions.length > 0 &&
              actions.map((action, i: number) => {
                let render = action.render(item)
                return <div key={i}>{render}</div>
              })}
          </div>
        )
        continue
      }

      if (column.multiLine) {
        style.whiteSpace = 'pre-line'
        if (needTooltip) {
          cells.push(
            getToolTipHtml(
              item[column.dataIndex] || '',
              column.key,
              <div
                key={`m-cell-${column.key}`}
                className="m-cell over-ellipsis"
                style={style}
                dangerouslySetInnerHTML={{ __html: item[column.dataIndex] || '' }}
              />,
              'tooltip-multi-line'
            )
          )
        } else {
          cells.push(
            <div
              key={`m-cell-${column.key}`}
              className="m-cell over-ellipsis"
              style={style}
              dangerouslySetInnerHTML={{ __html: item[column.dataIndex] || '' }}
            />
          )
        }
      } else if (column.render) {
        let render = column.render(item)
        if (needTooltip) {
          cells.push(
            getToolTipHtml(
              render,
              column.key,
              <div key={`m-cell-${column.key}`} className="m-cell over-ellipsis" style={style}>
                {render}
              </div>
            )
          )
        } else {
          cells.push(
            <div key={`m-cell-${column.key}`} className="m-cell over-ellipsis" style={style}>
              {render}
            </div>
          )
        }
      } else if (needTooltip) {
        cells.push(
          getToolTipHtml(
            item[column.dataIndex] || '',
            column.key,
            <div key={`m-cell-${column.key}`} className="m-cell over-ellipsis" style={style}>
              {item[column.dataIndex] || ''}
            </div>
          )
        )
      } else {
        cells.push(
          <div key={`m-cell-${column.key}`} className="m-cell over-ellipsis" style={style}>
            {item[column.dataIndex] || ''}
          </div>
        )
      }
    }

    return cells
  }

  const getToolTipHtml = (
    title: string | React.ReactNode = '',
    key: string = '',
    dom: React.ReactNode,
    overlayClassName: string = ''
  ) => {
    return (
      <Tooltip rootClassName={`${overlayClassName || ''} m-ant-tooltip`} title={title} key={`m-cell-${key}`}>
        {dom}
      </Tooltip>
    )
  }

  const render = () => {
    let columns = props.columns || []
    let dataSource = props.dataSource || []

    return (
      <div className={`m-table ${props.className || ''}`}>
        {columns.length > 0 && (
          <div className="m-header flex-align-center">
            {columns.map((column: { [K: string]: any } = {}, index: number) => {
              let style: { [K: string]: any } = {}
              if (!Utils.isBlank(column.width)) {
                style.width = column.width || ''
              }
              return (
                <div className="m-column over-two-ellipsis" key={`column-${index}`} style={style}>
                  {column.title || ''}
                </div>
              )
            })}
          </div>
        )}

        {dataSource.length > 0 ? (
          <div className="m-body flex-direction-column">
            {dataSource.map((item: { [K: string]: any } = {}, index: number) => {
              return (
                <div className="m-row flex-align-center" key={`row-${index}`}>
                  {getCellHtml(item)}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="m-body">
            <NoData />
          </div>
        )}
      </div>
    )
  }

  return render()
}

export default observer(MTable)
