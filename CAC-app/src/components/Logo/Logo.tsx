import React from 'react'

export const DEFAULT_LOGO_SRC = '/images/cac-logo-primary.png'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/** The CAC logo used whenever Site Settings does not provide an override. */
export const Logo = ({ className, loading = 'eager' }: Props) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={DEFAULT_LOGO_SRC}
      alt="CAC — Contemporary Artistic Construction"
      width={592}
      height={771}
      loading={loading}
      className={className}
    />
  )
}
