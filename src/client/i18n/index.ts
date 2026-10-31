import { NS } from '../constants'
import { en } from './en'
import { zh, type MessageKey } from './zh'

/** Both locales, in the shape `locale.register` expects. */
export const DICT = { zh, en }

/** Interpolate `{name}` placeholders; an absent value leaves the placeholder alone. */
export function fill(template: string, vars?: Record<string, any>): string {
  return String(template).replace(/\{(\w+)\}/g, (match, name) => {
    return vars && vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : match
  })
}

/**
 * Translate through the locale service, falling back to the bundled copy.
 *
 * `say` stays string-keyed for now: the panel passes keys through props and
 * literal objects, so a stricter key type waits until those call sites settle.
 */
export function makeSay(ctx: DshClientCtx, getLocaleId: () => string) {
  const locale = ctx.get('locale')
  const bound = locale && typeof locale.bind === 'function' ? locale.bind(NS) : null
  return (key: string) => {
    if (bound) {
      try {
        const value = bound(key)
        if (typeof value === 'string' && value && value !== key) return value
      } catch {
        /* fall through */
      }
    }
    const language = String(getLocaleId()).split('-')[0]
    const dict = (DICT as Record<string, Record<string, string>>)[language] || DICT.zh
    return dict[key] || DICT.zh[key as MessageKey] || key
  }
}
