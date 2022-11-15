import { padLeft } from '@/common/utils'

export {}
declare global {
  interface Date {
    toPrettyString(): string
  }
}

Date.prototype.toPrettyString = function (): string {
  const year = padLeft(this.getFullYear(), 4)
  const month = padLeft(this.getMonth() + 1, 2)
  const date = padLeft(this.getDate(), 2)
  const hours = padLeft(this.getHours(), 2)
  const minutes = padLeft(this.getMinutes(), 2)
  const seconds = padLeft(this.getSeconds(), 2)
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}
