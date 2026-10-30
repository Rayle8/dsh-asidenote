/**
 * Minimal ambient types for the parts of the DSH browser client this plugin
 * touches.
 *
 * Deliberately hand-written for now: the official `@deepseek-ai/dsh-client-*`
 * packages pin a host version, and a mismatch fails typecheck for reasons that
 * have nothing to do with this plugin. P5 can swap these for the real packages
 * once the toolchain and the module split are stable.
 */

/** The browser half is a classic script; the build wraps it in the loader's closure factory. */
declare const module: { exports: unknown }

/** Chromium exposes the platform hint behind this non-standard shape. */
interface Navigator {
  userAgentData?: { platform?: string }
}

interface DshLocaleService {
  bind(namespace: string): (key: string) => string
  register(namespace: string, dictionary: unknown): void
  getLocale(): { id?: string; locale?: string } | null
}

interface DshSlotMeta {
  name: string
  id: string
  order?: number
  locale?: string
  label?: () => string
}

interface DshSlotsService {
  inject(name: string, factory: () => unknown): void
  register(meta: DshSlotMeta, component: unknown): unknown
}

interface DshClientCtx {
  get(service: string): any
  effect(effect: () => (() => void) | void, label?: string): void
  slots: DshSlotsService
}

/** Seeded by the shell; the bundle keeps the module external and never ships a copy. */
declare module '@deepseek-ai/dsh-client-ui-primitives' {
  export const Tooltip: any
  export const Toast: any
  const primitives: Record<string, any>
  export default primitives
}

/** `?inline` stylesheets arrive as a string, not as a side-effectful import. */
declare module '*.css?inline' {
  const css: string
  export default css
}
