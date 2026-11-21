import logRules from '@/config/logLevel.json'

export type LogLevel = 'info' | 'warn' | 'error'

export interface ParsedLogLine {
  lineNumber: number
  level: LogLevel
  text: string
}

export function parseLogLevel(rawLog: string, executable: string): ParsedLogLine[] {
  if (!rawLog.trim()) return []

  const exeKey = executable.toLowerCase().split(/[\\/]/).pop() as keyof typeof logRules.services
  const rule = logRules.services[exeKey] ?? logRules.global

  return rawLog.split(/\r?\n/).map((line, index) => {
    const lower = line.toLowerCase()
    let level: LogLevel = 'info'
    const httpStatus =
      (exeKey === 'httpd.exe' || exeKey === 'nginx.exe') &&
      line.match(/"[^"]*"\s([1-5]\d{2})(?:\s|$)/)?.[1]

    if (httpStatus) {
      level = httpStatus.startsWith('5') ? 'error' : httpStatus.startsWith('4') ? 'warn' : 'info'
    } else if (rule.error.some((keyword) => lower.includes(keyword))) {
      level = 'error'
    } else if (rule.warn.some((keyword) => lower.includes(keyword))) {
      level = 'warn'
    }

    return {
      lineNumber: index + 1,
      level,
      text: line,
    }
  })
}
