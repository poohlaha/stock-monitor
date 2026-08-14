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
    if (value === '-') {
      return '#999999'
    }

    value = (value || '0').replace('%', '').trim()
    value = Number(value)
  }
  return value > 0 ? '#f5222d' : value < 0 ? '#037b66' : '#999999'
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

export function getToday() {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

export function getWidth(value: number = 0, largest: number = 0, needSqrt: boolean = false) {
  if (largest === 0) {
    return 0
  }

  if (needSqrt) {
    return Math.sqrt(Math.abs(value) / largest) * 100
  }

  return (Math.abs(value) / largest) * 100
}

export function parseCNNumber(value: string = '') {
  const match = value.match(/^([-+]?\d*\.?\d+)(万|亿)?/)

  if (!match) {
    return 0
  }

  const num = Number(match[1])
  const unit = match[2]

  if (unit === '万') {
    return num * 10000
  }

  if (unit === '亿') {
    return num * 100000000
  }

  return num
}

export function getNumberType(value: string) {
  if (!value) return 0

  const str = value.replace(/,/g, '').trim()

  // 转换中文单位
  let num = 0

  if (str.includes('亿')) {
    num = parseFloat(str.replace('亿', '')) * 100000000
  } else if (str.includes('万')) {
    num = parseFloat(str.replace('万', '')) * 10000
  } else {
    num = parseFloat(str)
  }

  if (num > 0) return 1 // 正数
  if (num < 0) return -1 // 负数
  return 0 // 0
}

export function getTodayText() {
  const date = new Date()

  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日${week[date.getDay()]}`
}
