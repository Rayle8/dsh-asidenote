/** Newer published version, or null when this build is current. */
import React from 'react'
import { PLUGIN_VERSION } from '../constants'
import { fetchLatestVersion, isNewerVersion } from '../update/latest'

export function useNewerVersion(): string | null {
  const [latestVersion, setLatestVersion] = React.useState<string | null>(null)

  React.useEffect(() => {
    // A local build carries a tag (`-dev`, `-rc`); it never nags.
    if (PLUGIN_VERSION.includes('-')) return undefined
    let active = true
    fetchLatestVersion().then(version => {
      if (active && version !== null) setLatestVersion(version)
    })
    return () => {
      active = false
    }
  }, [])

  return latestVersion !== null && isNewerVersion(latestVersion, PLUGIN_VERSION) ? latestVersion : null
}
