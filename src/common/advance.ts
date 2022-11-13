export {}
declare global {
  interface Date {
    toPrettyString(): string
  }
}

Date.prototype.toPrettyString = function (): string {
  const year = this.getFullYear()
  const month = this.getMonth() + 1
  const date = this.getDate()
  const hours = this.getHours()
  const minutes = this.getMinutes()
  const seconds = this.getSeconds()
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}
