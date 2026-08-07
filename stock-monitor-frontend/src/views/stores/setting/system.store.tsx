/**
 * @fileOverview system store
 * @date 2023-07-03
 * @author poohlaha
 */
import BaseStore from '../base/base.store'
import { action, makeObservable, observable } from 'mobx'
import {
  disable as disableAutostart,
  isEnabled as isAutostartEnabled,
  enable as enableAutoStart
} from '@tauri-apps/plugin-autostart'
import { invoke } from '@tauri-apps/api/core'
import { TOAST } from '@utils/base'
import Utils from '@utils/utils'

class SystemStore extends BaseStore {
  readonly FONT_FAMILY_LIST: Array<{ [K: string]: any }> = [
    {
      label: 'PingFangSC-Regular',
      value: 'PingFangSC-Regular'
    },
    {
      label: 'PingFang SC',
      value: 'PingFangSC'
    },
    {
      label: '阿里妈妈方圆体',
      value: 'Alimama'
    },
    {
      label: '阿里健康体2.0',
      value: 'AlibabaHealthFont2'
    },
    {
      label: '阿里妈妈刀隶体',
      value: 'AlimamaDaoLiTi'
    },
    {
      label: '阿里妈妈东方大楷',
      value: 'Alimama_DongFangDaKai'
    }
  ]

  readonly FONT_LIST: Array<any> = [
    {
      label: 'text-xs',
      value: 'text-xs',
      desc1: 'font-size: 0.75rem(12px)',
      desc2: 'line-height: 1rem(16px)'
    },
    {
      label: 'text-sm',
      value: 'text-sm',
      desc1: 'font-size: 0.875rem(14px)',
      desc2: 'line-height: 1.25rem(20px)'
    },
    {
      label: 'text-base',
      value: 'text-base',
      desc1: 'font-size: 1rem(16px)',
      desc2: 'line-height: 1.5rem(24px)'
    },
    {
      label: 'text-lg',
      value: 'text-lg',
      desc1: 'font-size: 1.125rem(18px)',
      desc2: 'line-height: 1.75rem(28px)'
    },
    {
      label: 'text-xl',
      value: 'text-xl',
      desc1: 'font-size: 1.25rem(20px)',
      desc2: 'line-height: 1.75rem(28px)'
    },
    {
      label: 'text-2xl',
      value: 'text-2xl',
      desc1: 'font-size: 1.5rem(24px)',
      desc2: 'line-height: 2rem(32px)'
    }
  ]

  readonly DEFAULT_FONT = {
    titleFontSize: 'text-base',
    fontSize: 'text-sm',
    descFontSize: 'text-xs',
    fontFamily: this.FONT_FAMILY_LIST[0].value
  }

  readonly DEFAULT_SYSTEM = {
    autoStart: false,
    closeType: '0', // 0: 最小化到程序坞(Dock 栏), 不退出程序 , 1: 直接退出程序
    nodeJsDir: ''
  }

  @observable font: { [K: string]: any } = Utils.deepCopy(this.DEFAULT_FONT)

  @observable system: { [K: string]: any } = Utils.deepCopy(this.DEFAULT_SYSTEM)

  constructor() {
    super()
    makeObservable(this)
  }

  @action
  async onAutoStart(theme: string = '') {
    this.system.autoStart = !this.system.autoStart
    if (this.system.autoStart) {
      if (await isAutostartEnabled()) {
        await this.onSave(theme)
        return
      }

      await enableAutoStart()
      await this.onSave(theme)
      return
    }

    // disabled
    if (await isAutostartEnabled()) {
      await disableAutostart()
    }

    await this.onSave(theme)
  }

  @action
  async onClose(value: string = '') {
    this.system.closeType = value || '0'
    await this.onSave()
  }

  async onGetNodeJsDir(value: string = '') {
    if (Utils.isBlank(value || '')) {
      return
    }
    this.system.nodeJsDir = value || ''
    await this.onSave()
  }

  @action
  async onSave(theme: string = '') {
    try {
      this.loading = true
      let result: { [K: string]: any } = await invoke('save_setting', {
        settings: {
          ...this.font,
          autoStart: `${this.system.autoStart}`,
          closeType: this.system.closeType || '0',
          theme,
          nodeJsDir: this.system.nodeJsDir || ''
        }
      })

      this.loading = false
      console.log('save setting:', result)

      this.handleResult(result)
    } catch (e: any) {
      this.loading = false
      TOAST.show({ message: `保存设置失败: ${e}`, type: 4 })
      throw new Error(e)
    }
  }

  @action
  async getConfig() {
    try {
      this.loading = true
      let result: { [K: string]: any } = (await invoke('get_setting', {})) || {}
      console.log('get setting:', result)

      this.loading = false
      let data = this.handleResult(result) || {}
      if (Utils.isObjectNull(data || {})) {
        this.font = Utils.deepCopy(this.DEFAULT_FONT)
        this.system.autoStart = false
        return
      }

      this.font = {
        titleFontSize: data.titleFontSize || '',
        fontSize: data.fontSize || '',
        descFontSize: data.descFontSize || '',
        fontFamily: data.fontFamily || ''
      }

      this.system = {
        autoStart: data.autoStart === 'true',
        closeType: data.closeType || '0',
        nodeJsDir: data.nodeJsDir || ''
      }
    } catch (e: any) {
      this.loading = false
      TOAST.show({ message: `获取设置失败: ${e}`, type: 4 })
      throw new Error(e)
    }
  }

  @action
  async onHideDock() {
    try {
      this.loading = true
      let result: { [K: string]: any } = await invoke('hide_dock', {})

      this.loading = false
      this.handleResult(result)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }

  async onShowDock() {
    try {
      this.loading = true
      let result: { [K: string]: any } = await invoke('show_dock', {})
      this.loading = false
      this.handleResult(result)
    } catch (e: any) {
      this.loading = false
      throw new Error(e)
    }
  }
}

export default new SystemStore()
