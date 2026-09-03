/**
 * @fileOverview 基金信息/基金经理
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import Utils from '@utils/utils'
import { Popover, Tabs } from 'antd'

interface IMarketDetailFundManagerProps {
  fundManagerList: Array<Record<string, any>>
  fundInfo: Record<string, any>
}

const MarketDetailFundInfo = (props: IMarketDetailFundManagerProps): ReactElement => {
  // 基金经理列表
  const getFundList = (list: Array<Record<string, any>> = []) => {
    return (
      <div className="flex-direction-column text-base">
        <div className="flex-align-center h-8 border-bottom pl-4 pr-4">
          <p className="flex-1">基金名称</p>
          <p className="flex-1">管理时间</p>
          <p className="flex-1">任期年化回报</p>
        </div>

        <div className="mt-2 overflow-y-auto h-64 no-scrollbar">
          {(list || []).map((l: Record<string, any> = {}, index: number) => {
            return (
              <div className="flex-align-start pt-1 pb-1 border-bottom bg-line-hover rounded-md pl-4 pr-4" key={index}>
                <div className="flex-direction-column flex-1 theme-hover">
                  <p className="">{l.fundName || ''}</p>
                  <div className="flex-align-center mt-1 color-gray text-xs">
                    <p>{l.fundCode || ''}</p>
                    <p className="ml-1 text-xs">{l.fundType || ''}</p>
                  </div>
                </div>

                <div className="flex-direction-column flex-1">
                  <p className="">{l.manageDays || ''}</p>
                  <p className="mt-1 color-gray text-xs">{l.managePeriod || ''}</p>
                </div>

                <div className="flex-direction-column flex-1">
                  <p className="">{l.periodAnnReturn || ''}</p>
                  <p className="mt-1 color-gray text-xs">
                    {Utils.isBlank(l.earningRate || '') ? '-' : `${Number(l.earningRate || '0').toFixed(2)}%`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getTabsItems = (currentList: Array<Record<string, any>> = [], historyList: Array<Record<string, any>> = []) => {
    const currentItem = {
      key: '1',
      label: '在管基金',
      children: getFundList(currentList || [])
    }

    const historyItem = {
      key: '2',
      label: '离任基金',
      children: getFundList(historyList || [])
    }

    const items = []
    if (currentList.length > 0) {
      items.push(currentItem)
    }

    if (historyList.length > 0) {
      items.push(historyItem)
    }

    return items
  }

  const render = () => {
    const fundManagerList = props.fundManagerList || []
    const fundInfo = props.fundInfo || {}
    return (
      <div className="flex-direction-column mt-4">
        {/* 基金基本信息 */}
        <div className="basic-info bg-[#f5f6fa] p-4 flex-wrap rounded-md">
          <div className="pr-4 flex-align-center">
            <p className="mr-2 whitespace-nowrap">成立日期:</p>
            <p className="whitespace-nowrap">{fundInfo.establishDate || '-'}</p>
          </div>

          <div className="pr-4 flex-align-center">
            <p className="mr-2 whitespace-nowrap">最新规模:</p>
            <p className="whitespace-nowrap">{fundInfo.fund_scale_text || '-'}</p>
          </div>

          <div className="pr-4 flex-align-center">
            <p className="mr-2 whitespace-nowrap">管理公司:</p>
            <p className="whitespace-nowrap">{fundInfo.fundCompany || '-'}</p>
          </div>

          <div className="pr-4 flex-align-center">
            <p className="mr-2 whitespace-nowrap">基金托管人:</p>
            <p className="whitespace-nowrap">{fundInfo.custodian || '-'}</p>
          </div>

          <div className="pr-4 flex-align-center">
            <p className="mr-2 whitespace-nowrap">净值(元):</p>
            <p className="whitespace-nowrap">{fundInfo.latestNav || '-'}</p>
          </div>
        </div>

        {/* 基金经理 */}
        {(fundManagerList || []).map((fundManager: Record<string, any> = {}, index: number) => {
          const manager = fundManager.manager || {}
          const currentList = fundManager.currentList || []
          const historyList = fundManager.historyList || []
          const tabsItems = getTabsItems(currentList, historyList)
          return (
            <div className="flex-direction-column border w100 rounded-md p-4 mt-4" key={index}>
              <p className="text-2xl font-bold">基金经理</p>
              <div className="mt-4 flex-wrap">
                <div className="flex-direction-column flex-1">
                  <div className="bg-[#f5f6fa] rounded-lg p-4 flex-align-center">
                    <div className="flex-1 flex-direction-column">
                      <div className="flex-align-center">
                        <p className="font-bold font-lg">{manager.name || ''}</p>
                        <p className="font-bold font-base ml-1">{manager.company || ''}</p>
                      </div>

                      <p>{manager.description || ''}</p>
                    </div>
                    {!Utils.isBlank(manager.avatar || '') && (
                      <div className="w-24 h-24">
                        <img src={manager.avatar || null} className="wh100 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* 回报率 */}
                  <div className="mt-4 flex-direction-column">
                    <div className="flex-align-center">
                      <div className="flex-direction-column flex-1">
                        <p className="font-bold text-base">任期最高回报</p>
                        <p className="color-gray">
                          {Utils.isBlank(manager.topReport || '')
                            ? '-'
                            : `${Number(manager.topReport || '0').toFixed(2)}%`}
                        </p>
                      </div>
                      <div className="flex-direction-column flex-1">
                        <p className="font-bold text-base">平均年化回报</p>
                        <p className="color-gray">
                          {Utils.isBlank(manager.averageReturn || '')
                            ? '-'
                            : `${Number(manager.averageReturn || '0').toFixed(2)}%`}
                        </p>
                      </div>
                    </div>

                    <div className="flex-align-center mt-4">
                      <div className="flex-direction-column flex-1">
                        <p className="font-bold text-base">从业时间</p>
                        <p className="color-gray">{manager.workingYears || '-'}</p>
                      </div>
                      <div className="flex-direction-column flex-1">
                        <p className="font-bold text-base">在管基金</p>
                        <p className="color-gray">{(manager.currentList || []).length}只</p>
                      </div>
                    </div>

                    <div className="flex-align-center mt-4">
                      <div className="flex-direction-column flex-1">
                        <p className="font-bold text-base">在管规模</p>
                        <p className="color-gray">{manager.manageScale || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Popover trigger={['hover']} placement="top" arrow={false} content={manager.resume || ''}>
                      <p className="over-two-ellipsis cursor-pointer">{manager.resume || ''}</p>
                    </Popover>
                  </div>
                </div>

                {tabsItems.length > 0 && (
                  <div className="pb-4 pl-4 pr-4 flex-1">
                    <Tabs className="m-ant-tabs" items={tabsItems} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return render()
}

export default observer(MarketDetailFundInfo)
