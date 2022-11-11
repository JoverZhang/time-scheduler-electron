import * as path from 'path'
import * as fs from 'fs'

export interface Task {
  title: string
  expectRuntime: number
  runtime?: number
}

export interface Config {
  daily: Task[]
  weekly: Task[]
  tasks: Task[]
}


const APP_DATA = process.env.APP_DATA as string
const CONFIG = path.join(APP_DATA, 'config.json')
const LOG = path.join(APP_DATA, 'log.json')

class Persistent {

  public getConfig(): Config {
    const text = fs.readFileSync(CONFIG)
    return JSON.parse(text.toString()) as Config
  }

  public saveConfig(config: Config) {
    fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2))
  }

}

export const persistent = new Persistent()
