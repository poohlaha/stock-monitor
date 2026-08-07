/**
 * @fileOverview 注册托盘
 * @date 2023-08-28
 * @author poohlaha
 */

import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import RouterUrls from '@route/router.url.toml'
import { listen } from '@tauri-apps/api/event'
import { LogicalPosition } from '@tauri-apps/api/dpi'
import { currentMonitor, Monitor } from '@tauri-apps/api/window'
import { IWindowProps } from '@communal/tray/window'
import { createWindow } from './window'

export const MenuWidth = 340
export const MenuHeight = 450

class TrayMenu {
  trayToggleTimer: NodeJS.Timeout | null = null

  async create() {
    await createWindow({
      url: RouterUrls.SDK.TRAY.MENU.URL,
      label: 'trayMenu',
      title: '',
      skipTaskbar: true,
      decorations: false,
      center: false,
      resizable: false,
      alwaysOnTop: true,
      focus: true,
      x: window.screen.width + 50,
      y: window.screen.height + 50,
      width: MenuWidth,
      height: MenuHeight,
      // minHeight: 96,
      // maxHeight: 400,
      visible: false
    } as IWindowProps)
  }

  // 监听
  async addListen() {
    await this.addListenClick()
    // await this.addListenBlur()
  }

  findMonitorByPosition(monitors: Array<Monitor>, x: number, y: number) {
    return monitors.find(m => {
      const pos = m.position
      const size = m.size
      return x >= pos.x && x <= pos.x + size.width && y >= pos.y && y <= pos.y + size.height
    })
  }

  async addListenClick() {
    await listen('tray_contextmenu', async event => {
      if (this.trayToggleTimer) return
      console.log('listen tray_contextmenu...', event)

      this.trayToggleTimer = setTimeout(() => {
        this.trayToggleTimer = null
      }, 300) // 300ms 内只触发一次

      const trayWindow = await WebviewWindow.getByLabel('trayMenu')
      if (!trayWindow) {
        await this.create()
      }

      let position: any = event.payload || { x: 100, y: 100 }
      if (trayWindow) {
        const isVisible = await trayWindow.isVisible()
        if (!isVisible) {
          await trayWindow.setAlwaysOnTop(true)
          console.log('logical position', position.x, position.y)

          /*
          const monitors = await availableMonitors()
          const monitor = this.findMonitorByPosition(monitors, position.x, position.y)
          if (!monitor) {
            console.warn('未找到当前点击位置所在的屏幕，使用默认位置')
          }
           */
          const monitor = await currentMonitor()
          let size: any = monitor?.size || {}
          let sizeWidth = size.width ?? 0
          let sizeHeight = size.height ?? 0

          // 计算托盘 x 轴和 y 轴
          let x = position.x - MenuWidth / 2
          if (x > sizeWidth && sizeWidth > 0) {
            // x = position.x - MenuWidth
          }

          let y = position.y
          if (y + +MenuHeight > sizeHeight && sizeHeight > 0) {
            // y = position.y - MenuHeight
          }

          await trayWindow.setPosition(new LogicalPosition(x, y))
          await trayWindow.show()
          setTimeout(async () => {
            await trayWindow.setFocus()
          }, 100)
        } else {
          await trayWindow.hide()
          await trayWindow.setAlwaysOnTop(false)
        }
      }
    })
  }
}

const createTrayMenu = async () => {
  const trayMenu = new TrayMenu()
  await trayMenu.create()
  await trayMenu.addListen()
}

export default createTrayMenu
