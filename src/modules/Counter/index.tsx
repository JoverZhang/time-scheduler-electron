import React from 'react'
import { Config } from '@/common/persistent'

export interface Props {
  config: Config
}

const Counter: React.FC<Props> = (props: Props) => {
  console.log(props)
  return (<div></div>)
}

export default Counter
