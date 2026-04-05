import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import type { ZodError } from 'zod'

/**
 * Zod の issue を react-hook-form の setError に反映する。
 * path が複数セグメントの場合は `a.b` 形式で結合する。
 */
export function applyZodIssuesToForm<T extends FieldValues>(
  error: ZodError,
  setError: UseFormSetError<T>,
): void {
  for (const issue of error.issues) {
    const segments = issue.path.filter(
      (p): p is string | number => p !== undefined && p !== '',
    )
    const key =
      segments.length > 0 ? segments.map(String).join('.') : 'root'

    if (key === 'root') {
      setError('root', {
        type: issue.code ?? 'validate',
        message: issue.message,
      })
      continue
    }

    setError(key as FieldPath<T>, {
      type: issue.code ?? 'validate',
      message: issue.message,
    })
  }
}
