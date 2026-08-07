/**
 * 升级 mobx 6 后, 解决以下问题:
 * [MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed.
 */
import { configure } from 'mobx'

configure({
  enforceActions: 'never'
})
