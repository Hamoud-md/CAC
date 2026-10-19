import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SiteFooter } from '@/Footer/Component'

const { getSiteSettings } = vi.hoisted(() => ({ getSiteSettings: vi.fn() }))
vi.mock('@/lib/data', () => ({ getSiteSettings, getNav: async () => [] }))
vi.mock('next/link', () => ({ default: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a> }))
afterEach(cleanup)

it('renders the selected logo and owner navigation labels without changing their routes', async () => {
  getSiteSettings.mockResolvedValue({ logo: { url: '/api/media/file/owner-logo.png' }, secondaryNav: [{ href: '/contact', label: 'Owner contact' }] })
  const { container } = render(await SiteFooter({ locale: 'en' }))
  expect(container.querySelector('img')?.getAttribute('src')).toBe('/api/media/file/owner-logo.png')
  expect(screen.getByRole('link', { name: 'Owner contact' }).getAttribute('href')).toBe('/en/contact')
})

it('keeps the verified CAC logo when no logo is selected', async () => {
  getSiteSettings.mockResolvedValue({ logo: null })
  const { container } = render(await SiteFooter({ locale: 'en' }))
  expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/cac-logo-original.png')
})
