import React from 'react'
import styles from './index.module.scss'

interface Props {
  options: string[]
}

export const Selector: React.FC<Props> = ({ options }: Props) => {
  return (
    <div className={styles.selector}>{
      options.map(option => <div key={option}>{option}</div>)
    }</div>
  )
}

export default Selector
