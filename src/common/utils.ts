export function padLeft(str: string, size: number): string
export function padLeft(num: number, size: number): string
export function padLeft(val: string | number, size: number): string {
  let str = val.toString()
  while (str.length < size) str = '0' + str
  return str
}
