/**
 * @fileOverview 基本信息
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { Popover } from 'antd'

interface IMarketDetailBasicInfoProps {
  info: Record<string, any>
}

const MarketDetailEtfBasicInfo = (props: IMarketDetailBasicInfoProps): ReactElement => {
  const render = () => {
    const info = props.info || {}

    return (
      <div className="info flex-direction-column flex-1 border rounded-lg p-4 mt-8">
        <p className="font-bold text-xl">基本信息</p>

        <div className="flex-direction-column mt-4">
          <div className="flex-align-start">
            <p className="font-bold shrink-0">公司简介: </p>
            <Popover
              trigger={['hover']}
              classNames={{
                root: 'm-table-sortable-popover'
              }}
              placement="bottomRight"
              arrow={false}
              content={<p>{info.introduction || ''}</p>}
            >
              <div className="overflow-hidden over-two-ellipsis ml-2">{info.introduction || ''}</div>
            </Popover>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">首席顾问: </p>
            <div className="ml-2">{info.primaryAdvisor || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">发布机构: </p>
            <div className="ml-2">{info.publisher || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">发行日期: </p>
            <div className="ml-2">{info.publishDate || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">注册地: </p>
            <div className="ml-2">{info.country || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">净值: </p>
            <div className="ml-2">{info.netWorth || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">设立规模(份): </p>
            <div className="ml-2">{info.aum || '-'}</div>
          </div>

          <div className="flex-align-center mt-2">
            <p className="font-bold shrink-0">货币: </p>
            <div className="ml-2">{info.currency || '-'}</div>
          </div>
        </div>
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailEtfBasicInfo)
