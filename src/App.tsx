import React, { useState } from 'react'
import styles from 'styles/app.module.scss'
import { Config, persistent } from '@/common/persistent'
import Counter from '@/modules/Counter'
import Selector from '@/modules/Selector'

const App: React.FC = () => {
  const [count, setCount] = useState(0)

  let config: Config = persistent.getConfig()
  persistent.saveConfig(config)

  const options = Object.keys(config)


  return (
    <div className={styles.app}>
      <Selector options={options}></Selector>
      <Counter config={config}></Counter>
    </div>
  )
}

export default App
