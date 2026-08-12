/**
 * @fileOverview Left
 * @date 2023-08-28
 * @author poohlaha
 */
import React, { ReactElement } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@views/stores'
import { Dropdown, MenuProps, Tooltip } from 'antd'
import AvatarImg from '@assets/images/avatar.jpeg'
import Utils from '@utils/utils'
import RouterUrls from '@route/router.url.toml'
import { useNavigate } from 'react-router-dom'

interface ILeftProps {
  userName: string
  onUpdatePwd: () => void
  onLogout: () => void
}

const Left = (props: ILeftProps): ReactElement => {
  const { homeStore } = useStore()

  const navigate = useNavigate()

  // 递归生成子菜单
  const generateMenuItems = (menuList: Array<{ [K: string]: any }> = [], parentPath: string = ''): Array<any> => {
    return menuList.map((menu: { [K: string]: any } = {}) => {
      let fullPath = parentPath + (menu.url || '')
      if (menu.children) {
        return {
          key: menu.key || '',
          fullPath,
          label: menu.label,
          icon: menu.icon,
          type: menu.type || '',
          children: generateMenuItems(menu.children, fullPath)
        }
      }

      return {
        key: menu.key || '',
        fullPath,
        label: menu.label,
        icon: menu.icon,
        type: menu.type || ''
      }
    })
  }

  const getMenuItems = (): MenuProps['items'] => {
    return [
      {
        key: Utils.generateUUID(),
        label: <p onClick={props.onUpdatePwd}>修改密码</p>
      },
      {
        key: Utils.generateUUID(),
        label: <p onClick={props.onLogout}>退出登录</p>
      }
    ]
  }

  const render = () => {
    const menuList =
      (homeStore.MENU_LIST || []).filter((menu: Record<string, any>) => menu.key !== RouterUrls.SETTING.SYSTEM.KEY) ||
      []
    return (
      <div className="left w-16 flex-align-center border-right flex-direction-column background-left absolute h100 top-0 z-100">
        <div className="person-info p-3 border-bottom flex-align-center">
          <Dropdown menu={{ items: getMenuItems() }} placement="bottom" trigger={['click']} arrow>
            <div className="avatar flex-align-center relative cursor-pointer">
              <img src={AvatarImg} alt="" className="wh100 rounded-full" />
            </div>
          </Dropdown>
        </div>

        <div className="menus w100 flex-1 pt-4 pb-4 overflow-y-auto">
          {/*
          <Menu
            className="wh100 m-ant-menu"
            onClick={(e: any) => {
              let obj = homeStore.findMenu(list, e.key)
              if (Utils.isObjectNull(obj || {})) {
                return
              }

              navigate(obj.fullPath || '')
            }}
            items={generateMenuItems(list)}
            mode="inline"
            selectedKeys={homeStore.selectedMenuKeys}
            onSelect={({ selectedKeys }) => (homeStore.selectedMenuKeys = selectedKeys || [])}
          />
          */}

          <div className="flex-align-center flex-direction-column">
            {menuList.map((item: { [K: string]: any } = {}, index: number) => {
              return (
                <div
                  className={`w-8 h-8 p-1.5 mb-4 cursor-pointer flex-center bg-menu-hover rounded color-svg ${item.key === homeStore.selectedMenu || homeStore.selectedMenu.indexOf(item.key) !== -1 ? 'bg-menu-active' : ''}`}
                  key={index}
                  onClick={() => {
                    homeStore.onSetSelectMenu(item.key || '')
                    navigate(`${item.parentUrl || ''}${item.url || ''}`)
                  }}
                >
                  <Tooltip rootClassName="m-ant-tooltip" title={item.label || ''} placement="right">
                    <div className="wh100">{item.icon || null}</div>
                  </Tooltip>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-direction-column flex-center border-top w100">
          {/* 偏好设置 */}
          <div
            className={`w-8 h-8 p-1.5 mb-4 cursor-pointer flex-center bg-menu-hover rounded mt-2 color-svg ${RouterUrls.SETTING.SYSTEM.KEY === homeStore.selectedMenu ? 'bg-menu-active' : ''}`}
            onClick={() => {
              homeStore.onSetSelectMenu(RouterUrls.SETTING.SYSTEM.KEY || '')
              navigate(RouterUrls.SETTING.SYSTEM.URL)
            }}
          >
            <Tooltip title={RouterUrls.SETTING.SYSTEM.NAME} placement="right" rootClassName="m-ant-tooltip">
              <div className="wh100">
                <svg className="wh100" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M512 671.72c-88.05 0-159.7-71.64-159.7-159.69 0-88.06 71.65-159.7 159.7-159.7s159.68 71.64 159.68 159.7c0 88.05-71.63 159.69-159.68 159.69z m0-265.67c-58.44 0-105.98 47.54-105.98 105.98C406.02 570.46 453.56 618 512 618c58.43 0 105.97-47.54 105.97-105.97 0-58.44-47.54-105.98-105.97-105.98z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M650.46 926.48c-20.51 0-40.5-10.64-51.48-29.65-17.46-30.22-49.94-48.97-84.83-48.97h-0.12l-3.82-0.01c-0.31-0.01-0.63-0.01-0.96-0.01-34.6 0-66.32 17.89-83.04 46.88-8.25 14.29-21.57 24.51-37.52 28.77-15.96 4.29-32.59 2.09-46.87-6.16L244.3 861c-13.81-7.97-23.69-20.84-27.81-36.24-4.12-15.4-2.01-31.48 5.97-45.29 17.72-30.69 17.74-68.84 0.06-99.55l-0.69-1.2c-17.62-30.61-50.5-49.62-85.8-49.62-33.12 0-60.07-26.95-60.07-60.07V457.81c0-34.63 28.17-62.8 62.8-62.8 33.66 0 65-18.12 81.79-47.28 18.92-32.85 18.9-73.65-0.05-106.48l-3.06-5.29c-13.7-23.74-5.54-54.16 18.16-67.84l105.79-61.08c29.77-17.17 67.93-6.93 85.1 22.8 16.6 28.78 48.07 46.54 82.26 46.54 0.35 0 0.71 0 1.05-0.01l3.53-0.02h0.12c35.57 0 68.03-18.73 85.44-48.91 8.08-14 20.84-23.79 36.12-27.88 15.24-4.12 31.2-2 44.89 5.91l100.25 57.89c13.69 7.89 23.48 20.65 27.57 35.92 4.09 15.26 1.99 31.21-5.9 44.89-17.22 29.82-16.58 67.77 1.68 99.04l1.08 1.87c17.7 30.73 50.03 49.91 84.31 49.91 32.63 0 59.17 26.54 59.17 59.17v115.87c0 32.56-26.49 59.05-59.06 59.05-34.31 0-66.69 19.21-84.48 50.13l-0.98 1.69c-18.26 31.29-18.89 69.27-1.65 99.11 16.26 28.2 6.57 64.37-21.61 80.65l-100.22 57.86c-9.35 5.4-19.54 7.96-29.6 7.96zM514.2 794.14c53.98 0 104.29 29.04 131.3 75.83 0.96 1.67 2.39 2.33 3.41 2.61 1.04 0.3 2.58 0.39 4.26-0.55l100.22-57.86c2.54-1.47 3.41-4.73 1.94-7.28-26.85-46.49-26.16-105.13 1.78-153.04l24.1 11.99-23.28-13.4c27.36-47.53 77.57-77.06 131.04-77.06 2.94 0 5.34-2.39 5.34-5.33V454.18c0-3-2.45-5.45-5.46-5.45-53.43 0-103.61-29.49-130.95-76.96l-0.84-1.46c-27.95-47.89-28.64-106.5-1.81-152.98 0.93-1.61 0.81-3.14 0.55-4.14-0.26-0.99-0.92-2.37-2.53-3.3L653.04 152a5.369 5.369 0 0 0-4.13-0.54c-1 0.26-2.37 0.92-3.3 2.53-27.17 47.07-77.46 76.09-131.44 76.09H514l-3.58 0.02c-54.11 0.52-103.99-27.55-130.45-73.4-1.53-2.68-3.92-3.65-5.21-3.99-1.3-0.34-3.84-0.68-6.5 0.85L266 212.6l1.01 1.76c28.52 49.4 28.55 110.76 0.09 160.17-26.35 45.76-75.53 74.19-128.34 74.19-5.01 0-9.08 4.07-9.08 9.08v111.22c0 3.5 2.85 6.35 6.35 6.35 54.47 0 105.18 29.32 132.35 76.53l0.69 1.19c27.21 47.28 27.18 105.99-0.09 153.22-1.02 1.78-0.89 3.44-0.6 4.54 0.29 1.08 1.01 2.6 2.77 3.61l97.55 56.31c3.84 2.22 8.79 0.92 11-2.94 26.31-45.58 75.84-73.74 129.51-73.74 0.5 0 0.97 0 1.46 0.01l3.36 0.01c0.04 0.03 0.11 0.03 0.17 0.03z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </Tooltip>
          </div>
        </div>

        <iframe
          style={{
            display: 'none'
          }}
          src="https://finance.baidu.com"
        />
      </div>
    )
  }

  return render()
}

export default observer(Left)
