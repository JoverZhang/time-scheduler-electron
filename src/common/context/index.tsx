import * as path from 'path'
import * as fs from 'fs'
import React, { useState } from 'react'


const APP_DATA = process.env.APP_DATA as string
const CONFIG = path.join(APP_DATA, 'config.json')


export enum Category {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  LONG_TERM = 'LONG_TERM',
}

interface PTask {
  id: number
  category: Category
  title: string
  requiredTime: number
}

interface PLog {
  taskId: number
  runtime: number
  endTime: string
}

interface PConfig {
  tasks: PTask[]
  logs: PLog[]
}


export class Log {
  public taskId: number
  public title: string
  public runtime: number
  public endTime: Date

  constructor(taskId: number, title: string, runtime: number, endTime: Date) {
    this.taskId = taskId
    this.title = title
    this.runtime = runtime
    this.endTime = endTime
  }
}

export class Logger {
  public logs: Log[] = []

  public sumRuntimeByTaskId(taskId: number) {
    return this.logs
      .filter(l => l.taskId === taskId)
      .map(l => l.runtime)
      .reduce((a, b) => a + b, 0)
  }
}

export class Task {
  public id: number
  public category: Category
  public title: string
  public children: Task[] = []
  private readonly requiredTime?: number

  private logger: Logger

  constructor(logger: Logger, id: number, category: Category, title: string, requiredTime?: number) {
    this.logger = logger
    this.id = id
    this.category = category
    this.title = title
    this.requiredTime = requiredTime
  }

  public getTotalRequiredTime(): number {
    if (this.children.length !== 0) {
      return this.children.map(c => c.getTotalRequiredTime()).reduce((a, b) => a + b, 0)
    }
    return this.requiredTime || 0
  }

  public getRequiredTime(): number {
    return this.getTotalRequiredTime() - this.getRuntime()
  }

  public getRuntime(): number {
    if (this.children.length !== 0) {
      return this.children.map(c => c.getRuntime()).reduce((a, b) => a + b, 0)
    }
    return this.logger.sumRuntimeByTaskId(this.id)
  }
}


export class Config {
  public dailyTasks: Task[]
  public weeklyTasks: Task[]
  public longTermTasks: Task[]

  public logger: Logger
  public _updater?: Function


  constructor()
  constructor(config: Config)

  constructor(config?: Config) {
    // copy constructor
    if (config instanceof Config) {
      const { dailyTasks, weeklyTasks, longTermTasks, logger } = config
      this.dailyTasks = dailyTasks
      this.weeklyTasks = weeklyTasks
      this.longTermTasks = longTermTasks
      this.logger = logger
      return
    }

    // default constructor
    const { dailyTasks, weeklyTasks, longTermTasks, logger } = this.loadFromDisk()
    this.dailyTasks = dailyTasks
    this.weeklyTasks = weeklyTasks
    this.longTermTasks = longTermTasks
    this.logger = logger
  }

  public getTaskById(taskId: number): Task | undefined {
    const tasks = [...this.dailyTasks, ...this.weeklyTasks, ...this.longTermTasks]
    const map = new Map<number, Task>(tasks.map(t => [t.id, t]))
    return map.get(taskId)
  }

  public pushLog(log: Log) {
    this.logger.logs.unshift(log)
  }

  public flush(toDisk = true) {
    if (toDisk) {
      this.flushToDisk()
    }

    // update reactive state
    (this._updater as Function)()
  }

  protected flushToDisk() {
    const pconfig: PConfig = {
      tasks: [],
      logs: [],
    }

    // populate tasks
    for (const task of [...this.dailyTasks, ...this.weeklyTasks, ...this.longTermTasks]) {
      let p: PTask = {
        id: task.id,
        category: task.category,
        title: task.title,
        requiredTime: task.getTotalRequiredTime(),
      }
      pconfig.tasks.push(p)
    }

    // populate logs
    for (const log of this.logger.logs) {
      let p: PLog = {
        taskId: log.taskId,
        runtime: log.runtime,
        endTime: log.endTime.toISOString(),
      }
      pconfig.logs.push(p)
    }

    console.warn('write to disk')
    fs.writeFileSync(CONFIG, JSON.stringify(pconfig, null, 2))
  }

  protected loadFromDisk(): { dailyTasks: Task[], weeklyTasks: Task[], longTermTasks: Task[], logger: Logger } {
    console.warn('load from disk')
    const text = fs.readFileSync(CONFIG)
    const pconfig: PConfig = JSON.parse(text.toString())


    const dailyTasks = []
    const weeklyTasks = []
    const longTermTasks = []
    const logger = new Logger()

    // populate logger
    const ptaskMap = new Map<number, PTask>(pconfig.tasks.map(t => [t.id, t]))
    for (const p of pconfig.logs) {
      const log = new Log(
        p.taskId,
        ptaskMap.get(p.taskId)?.title || '',
        p.runtime,
        new Date(p.endTime),
      )
      logger.logs.push(log)
    }

    // populate tasks
    for (const p of pconfig.tasks) {
      const task = new Task(logger, p.id, p.category, p.title, p.requiredTime)
      switch (task.category) {
        case Category.DAILY:
          dailyTasks.push(task)
          break
        case Category.WEEKLY:
          weeklyTasks.push(task)
          break
        case Category.LONG_TERM:
          longTermTasks.push(task)
          break
        default:
          throw Error(`unmatch category: ${task.category}`)
      }
    }

    return {
      dailyTasks,
      weeklyTasks,
      longTermTasks: longTermTasks,
      logger,
    }
  }
}


// single instance
let configInstance: Config

export const useCoreContext = (): Config => {
  let [wrapper, dispatch] = useState({ config: configInstance })

  const updater = () => dispatch({ ...wrapper })

  if (!configInstance) {
    configInstance = new Config()
    wrapper.config = configInstance
  }

  wrapper.config._updater = updater
  return wrapper.config
}
