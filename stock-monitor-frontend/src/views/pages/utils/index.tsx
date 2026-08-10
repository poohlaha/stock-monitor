/**
 * 计算收益率的样式, 负-绿，正-红
 * @param rate
 */
export function getRateClassName(rate: string | number = 0) {
  if (rate === '-' || rate === '--') {
    return 'color-gray'
  }

  let newRate = 0
  if (typeof rate === 'string') {
    rate = rate.replace('%', '')
    newRate = Number(rate.trim())
  } else {
    newRate = rate
  }

  if (newRate === 0) {
    return 'color-gray'
  }

  if (newRate > 0) {
    return 'red'
  }

  return 'green'
}
