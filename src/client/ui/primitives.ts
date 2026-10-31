/**
 * Shared glyphs and the tooltip wrapper.
 *
 * Glyphs come from the product icon set; this plugin draws none of its own, so
 * stroke weight, optical size and currentColor stay consistent with the shell.
 * Tooltip and Toast are the seeded primitives — the bundle keeps them external.
 */
import React from 'react'
import * as PRIMITIVES_NS from '@deepseek-ai/dsh-client-ui-primitives'

const h = React.createElement

export const PRIMITIVES = PRIMITIVES_NS as unknown as Record<string, any>
export const Tooltip = typeof PRIMITIVES.Tooltip === 'function' ? PRIMITIVES.Tooltip : null
export const Toast = typeof PRIMITIVES.Toast === 'function' ? PRIMITIVES.Toast : null
export const icon = name => (typeof PRIMITIVES[name] === 'function' ? PRIMITIVES[name] : null)

/**
 * Glyphs come from the shared product icon set; this plugin draws none of
 * its own, so stroke weight, optical size and currentColor stay consistent
 * with the surrounding shell.
 */
export function Glyph(props) {
  const Component = icon(props.name)
  if (!Component) return null
  return h(Component, { size: props.size })
}

export const IconCheck = props => h(Glyph, { name: 'IconCheckOutlineMedium', size: props && props.size ? props.size : 12 })
export const IconCopy = () => h(Glyph, { name: 'IconCopyOutlineRegular', size: 14 })
export const IconForward = () => h(Glyph, { name: 'IconShareOutlineRegular', size: 14 })
export const IconGear = () => h(Glyph, { name: 'IconSettingsOutlineRegular', size: 14 })
export const IconPencil = () => h(Glyph, { name: 'IconEditOutlineRegular', size: 14 })
export const IconTrash = () => h(Glyph, { name: 'IconTrashOutlineRegular', size: 14 })

export const IconChevron = () => h(Glyph, { name: 'IconChevronRightOutlineRegular', size: 12 })
export const IconEmpty = () => h(Glyph, { name: 'IconChecklistOutlineRegular', size: 18 })
export const IconClose = () => h(Glyph, { name: 'IconCloseOutlineRegular', size: 14 })

/** Wrap one icon-only control in the shared tooltip; a bare button when absent. */
export function withTooltip(label, node) {
  if (!Tooltip) return node
  return h(Tooltip, { label, side: 'top', portal: true, gap: 6 }, node)
}
