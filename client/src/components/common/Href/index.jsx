import React from 'react'


function Href({ href, children }) {
  let url = `http://${href}`

  return (
    <a target='_blank' rel='noreferrer noopener' href={url}>
      {children}
    </a>
  )
}

export default Href
