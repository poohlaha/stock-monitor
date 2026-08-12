/**
 * @fileOverview 新闻
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement, useState } from 'react'
import { observer } from 'mobx-react-lite'
import useMount from '@hooks/useMount'
import { ADDRESS } from '@utils/base'
import Page from '@views/modules/page'
import RouterUrls from '@route/router.url.toml'

const news = (): ReactElement => {
  const [url, setUrl] = useState('')

  useMount(() => {
    let u = ADDRESS.getAddressQueryString('url') || ''
    u = decodeURIComponent(u)
    console.log('news url: ', u)
    setUrl(u)
  })

  const render = () => {
    return (
      <Page
        contentClassName="market-newspage overflow-hidden flex-direction-column pt-4 pb-4 no-scrollbar"
        title={{
          show: true,
          label: RouterUrls.MARKET.NEWS.NAME || '',
          needBack: true
        }}
      >
        <div className="flex-1">
          <iframe src={url || ''} className="wh100" frameBorder="0"></iframe>
        </div>
      </Page>
    )
  }

  return render()
}

export default observer(news)
