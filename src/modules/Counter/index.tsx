import React from 'react'

export interface Props {
}

const Counter: React.FC<Props> = (props: Props) => {
  console.log(props)
  return (<div></div>)
}

export default Counter
