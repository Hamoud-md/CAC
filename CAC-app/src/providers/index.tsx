import React from 'react'

// Public site is light-only and locale-driven; no theme providers needed.
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>
