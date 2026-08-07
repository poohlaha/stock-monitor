import React from 'react'
import hljs from 'highlight.js'

export interface INavigationProps {
  rightNode?: React.ReactNode
  leftNode?: React.ReactNode
  needLogo?: boolean
  needBack?: boolean
  onBack?: () => void
}

export const SyntaxHighlightedCode = (props: any) => {
  const ref = React.useRef<any>(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && hljs) {
      hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}
