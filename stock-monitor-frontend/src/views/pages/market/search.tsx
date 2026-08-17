/**
 * @fileOverview 搜索
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Utils from '@utils/utils'
import { useStore } from '@views/stores'
import { useNavigate } from 'react-router'
import Loading from '@views/components/loading/loading'
import RouterUrls from '@route/router.url.toml'
import { getRateClassName } from '@pages/utils'
import AddSelectionModal from '@pages/market/addSelection'

const Search = (): ReactElement => {
  const { marketStore, homeStore } = useStore()
  const navigate = useNavigate()

  const [onOpenSelection, setOnOpenSelection] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<Record<string, any>>({})

  const getSearchContent = () => {
    if (!marketStore.showSearchDialog) {
      return null
    }

    const list = marketStore.search.list || []

    return (
      <div className="h-80 search-content overflow-y-auto absolute left-0 top-14 rounded-md shadow right-0 border w-[600px] bg-white z-10">
        {marketStore.loading && <Loading show={marketStore.loading} />}

        {!marketStore.loading && (
          <div className="search-body flex-direction-column">
            {list.map((item: Record<string, any> = {}, index: number) => {
              const hasCollect = item.hasCollect ?? false
              return (
                <div
                  className="search-item flex-align-center cursor-pointer pt-2 pb-2 pl-4 pr-4 border-bottom bg-line-hover"
                  key={index}
                  onMouseDown={() => {
                    const type = item.type || '' // 类型: etf | fund | stock
                    const market = item.market || '' // 市场: ab | hk | us | sg
                    const exchange = item.exchange || ''
                    homeStore.selectedMenu = `${RouterUrls.MARKET.KEY || ''}-${homeStore.MENU_LIST[2].key || ''}`
                    navigate(
                      `${RouterUrls.MARKET.URL}${RouterUrls.MARKET.DETAIL.URL}/${item.code || ''}?code=${item.code || ''}&type=${type || ''}&market=${market || ''}&exchange=${exchange || ''}`
                    )
                  }}
                >
                  <div className="flex-align-center w100 text-base">
                    <div className="flex-direction-column flex-1">
                      <p className="font-bold">{item.name || ''}</p>
                      <div className="flex-align-center ml-1">
                        <p className="bg-purple-500 rounded-md text-xs text-white pt-0.5 pb-0.5 pl-1 pr-1">
                          {item.exchange || ''}
                        </p>
                        <p className="pl-1">{item.code || ''}</p>
                      </div>
                    </div>
                    <p className="pl-1 w-24 font-bold text-center">{item.price}</p>
                    <p className={`pl-1 w-24 font-bold text-center ${getRateClassName(item.ratio)}`}>{item.ratio}</p>
                    <p className="w-8 ml-2 text-right">
                      {!hasCollect && (
                        <svg
                          className="w-4 h-4 color-svg"
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={async () => {
                            setSelectedItem(item)
                            console.log('item: ', item)
                            await marketStore.onGetWatchGroupList(() => {
                              setOnOpenSelection(true)
                            })
                          }}
                          onMouseDown={e => {
                            e.stopPropagation()
                            e.preventDefault()
                          }}
                        >
                          <path
                            d="M953.37931 512C953.37931 268.232939 755.767084 70.62069 512 70.62069 268.232934 70.62069 70.62069 268.232939 70.62069 512 70.62069 755.767061 268.232934 953.37931 512 953.37931 755.767084 953.37931 953.37931 755.767061 953.37931 512ZM547.310345 476.689655 547.310345 264.858364C547.310345 245.21731 531.501374 229.517241 512 229.517241 492.362681 229.517241 476.689655 245.340001 476.689655 264.858364L476.689655 476.689655 264.858359 476.689655C245.217315 476.689655 229.517241 492.498635 229.517241 512 229.517241 531.637326 245.340001 547.310345 264.858359 547.310345L476.689655 547.310345 476.689655 759.141636C476.689655 778.78269 492.498626 794.482759 512 794.482759 531.637319 794.482759 547.310345 778.659999 547.310345 759.141636L547.310345 547.310345 759.141694 547.310345C778.78272 547.310345 794.482759 531.501365 794.482759 512 794.482759 492.362674 778.660017 476.689655 759.141694 476.689655L547.310345 476.689655ZM0 512C0 229.230209 229.230204 0 512 0 794.769832 0 1024 229.230209 1024 512 1024 794.769791 794.769832 1024 512 1024 229.230204 1024 0 794.769791 0 512Z"
                            fill="currentColor"
                          ></path>
                        </svg>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const render = () => {
    return (
      <div className="search-box border-bottom h-16 flex-align-center">
        <img
          src="https://psstatic.cdn.bcebos.com/aladdin/finance_pc/logo_1764579212000.png"
          className="mr-4 h100 w-32"
        />
        <div className="flex-direction-column flex-1 relative">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            className="rounded-lg m-ant-input h-10 pl-2 pr-2 bg-[#f5f6fa] w-[600px]"
            placeholder={marketStore.search.placeholder || ''}
            value={marketStore.search.value}
            onChange={async e => {
              marketStore.search.value = e.target.value || ''

              if (Utils.isBlank(marketStore.search.value)) {
                marketStore.search.list = []
                marketStore.showSearchDialog = false
              }
            }}
            onBlur={e => {
              if (e.currentTarget.parentElement?.contains(e.relatedTarget)) {
                return
              }

              marketStore.showSearchDialog = false
            }}
            onPressEnter={async () => {
              if (!Utils.isBlank(marketStore.search.value)) {
                await marketStore.onSearch()
              }
            }}
          />

          {getSearchContent()}
        </div>

        <AddSelectionModal
          open={onOpenSelection}
          name={selectedItem.name || ''}
          code={selectedItem.code || ''}
          market={selectedItem.market || ''}
          type={selectedItem.type || ''}
          exchange={selectedItem.exchange || ''}
          onOk={async () => {
            setOnOpenSelection(false)
          }}
          onCancel={() => {
            setOnOpenSelection(false)
          }}
        />
      </div>
    )
  }

  return render()
}

export default observer(Search)
