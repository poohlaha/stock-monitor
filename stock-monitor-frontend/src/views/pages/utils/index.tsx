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

// 生成 spartline 图
export function createSparkline(data: number[] = [], color: string = '') {
  if (data.length === 0) {
    return
  }

  const width = 100
  const height = 40

  const max = Math.max(...data)
  const min = Math.min(...data)

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((item - min) / (max - min)) * height
      return `${x},${y}`
    })
    .join(' ')

  const svg = `
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 ${width} ${height}"
        >
            <polyline
                fill="none"
                stroke="${color}"
                stroke-width="2"
                points="${points}"
            />
        </svg>
    `
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
}

export function getColor(value: number | string) {
  if (typeof value === 'string') {
    value = (value || '0').replace('%', '').trim()
    value = Number(value)
  }
  return value > 0 ? '#f5222d' : value < 0 ? '#52c41a' : '#999'
}

export function formatTimestamp(timestamp: number, needSecond: boolean = true) {
  const date = new Date(timestamp * 1000)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}${needSecond ? `:${second}` : ''}`
}

export function isPositive(value: string = '') {
  const num = Number(value.match(/[+-]?\d+(\.\d+)?/)?.[0] || 0)
  return num > 0
}
