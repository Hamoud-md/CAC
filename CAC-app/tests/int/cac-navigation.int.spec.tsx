import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HeaderClient } from '@/Header/Component.client'
import { dir, type Locale } from '@/lib/locales'

vi.mock('next/navigation', () => ({ usePathname: () => '/fr', useRouter: () => ({ push: vi.fn() }) }))
vi.mock('next/link', () => ({ default: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a> }))
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
afterEach(cleanup)

const categories = [
  { id: 1, title: 'Architecture', slug: 'architecture', hasPage: false, services: [
    { id: 2, title: 'Service B', slug: 'b' },
    { id: 3, title: 'Service A', slug: 'a' },
  ] },
  { id: 4, title: 'Conseil', slug: 'conseil', hasPage: true, services: [] },
  { id: 5, title: 'Aménagement', slug: 'amenagement', hasPage: false, services: [
    { id: 6, title: 'Service C', slug: 'c' },
  ] },
]
const props = { contact: { phone: null, email: null, address: null }, logoUrl: null, secondaryNav: [], categories }

describe('CAC public navigation', () => {
  it.each(['fr', 'en', 'ar'] as Locale[])(
    'keeps category relationships and main page sequence in %s',
    (locale) => {
      const { container } = render(<HeaderClient {...props} locale={locale} />)
      const desktop = container.querySelector<HTMLElement>('.cac-desktop-nav')!
      const categoryButtons = within(desktop).getAllByRole('button')
      expect(categoryButtons.map((button) => button.textContent)).toEqual(['Architecture', 'Aménagement'])
      expect(categoryButtons.every((button) => button.getAttribute('aria-haspopup') === 'menu')).toBe(true)
      expect(within(desktop).getByRole('link', { name: 'Conseil' }).getAttribute('href')).toBe(`/${locale}/services/conseil`)
      const main = [...desktop.querySelectorAll<HTMLAnchorElement>('.cac-main-nav a')]
      expect(main.map((link) => link.getAttribute('href'))).toEqual([`/${locale}/projets`, `/${locale}/a-propos`, `/${locale}/contact`])
      expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/cac-logo-original.png')
      expect(dir(locale)).toBe(locale === 'ar' ? 'rtl' : 'ltr')
    },
  )

  it('opens the matching category only, keeps service order and preserves Voir tout', () => {
    const { container } = render(<HeaderClient {...props} locale="fr" />)
    const desktop = container.querySelector<HTMLElement>('.cac-desktop-nav')!
    fireEvent.click(within(desktop).getByRole('button', { name: /Architecture/ }))
    const menu = within(desktop).getByRole('menu')
    expect(within(menu).getAllByRole('menuitem').map((link) => link.getAttribute('href'))).toEqual([
      '/fr/services/architecture/b', '/fr/services/architecture/a', '/fr/services/architecture',
    ])
    expect(within(menu).getByRole('menuitem', { name: /Tout voir/ })).toBeTruthy()
    expect(within(menu).queryByText('Service C')).toBeNull()
  })

  it('opens a category dropdown on pointer hover', () => {
    const { container } = render(<HeaderClient {...props} locale="fr" />)
    const item = container.querySelector('.cac-category-item')!
    fireEvent.mouseEnter(item)
    expect(within(container.querySelector<HTMLElement>('.cac-desktop-nav')!).getByRole('menu')).toBeTruthy()
  })

  it('supports keyboard opening, arrow navigation and Escape focus return', async () => {
    const { container } = render(<HeaderClient {...props} locale="fr" />)
    const desktop = container.querySelector<HTMLElement>('.cac-desktop-nav')!
    const trigger = within(desktop).getByRole('button', { name: /Architecture/ })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const items = within(within(desktop).getByRole('menu')).getAllByRole('menuitem')
    await waitFor(() => expect(document.activeElement).toBe(items[0]))
    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('uses nested mobile groups and closes them in stages with Escape', () => {
    render(<HeaderClient {...props} locale="ar" />)
    const menuButton = screen.getByRole('button', { name: 'القائمة' })
    fireEvent.click(menuButton)
    const mobile = document.getElementById('cac-mobile-nav')!
    const group = within(mobile).getByRole('button', { name: /Architecture/ })
    expect(group.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(group)
    expect(group.getAttribute('aria-expanded')).toBe('true')
    expect(within(mobile).getByRole('link', { name: 'Service B' }).getAttribute('href')).toBe('/ar/services/architecture/b')
    expect(within(mobile).getByRole('link', { name: 'عرض الكل' }).getAttribute('href')).toBe('/ar/services/architecture')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(group)
    expect(group.getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(menuButton)
    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
  })

  it.each(['fr', 'en', 'ar'] as Locale[])('offers all primary routes after categories on mobile in %s', (locale) => {
    render(<HeaderClient {...props} locale={locale} />)
    fireEvent.click(screen.getByRole('button', { name: locale === 'ar' ? 'القائمة' : 'Menu' }))
    const mobile = document.getElementById('cac-mobile-nav')!
    const links = [...mobile.querySelectorAll<HTMLAnchorElement>('a')].map((link) => link.getAttribute('href'))
    expect(links.slice(-3)).toEqual([`/${locale}/projets`, `/${locale}/a-propos`, `/${locale}/contact`])
    expect(dir(locale)).toBe(locale === 'ar' ? 'rtl' : 'ltr')
  })

  it('handles long labels and variable category counts without flattening child services', () => {
    const longCategories = Array.from({ length: 6 }, (_, index) => ({
      id: index + 10,
      title: `Service ${index + 1} — conception, fourniture et réalisation de structures architecturales contemporaines`,
      slug: `service-${index + 1}`,
      hasPage: index === 1,
      services: index === 1 ? [] : [{ id: `${index + 1}-child`, title: `Prestation — études détaillées, coordination et exécution des travaux ${index + 1}`, slug: `prestation-${index + 1}` }],
    }))
    const { container } = render(<HeaderClient {...props} categories={longCategories} locale="fr" />)
    const desktop = container.querySelector<HTMLElement>('.cac-desktop-nav')!
    expect(within(desktop).getAllByRole('button')).toHaveLength(5)
    expect(within(desktop).getByRole('link', { name: /Service 2/ }).getAttribute('href')).toBe('/fr/services/service-2')
    expect(desktop.querySelector('.cac-service-dropdown')).toBeNull()
    fireEvent.click(within(desktop).getAllByRole('button')[4]!)
    expect(within(desktop).getByRole('menuitem', { name: /Prestation/ }).getAttribute('href')).toBe('/fr/services/service-6/prestation-6')
    expect(container.querySelector('.cac-desktop-nav')?.querySelector('.cac-service-dropdown')?.getAttribute('style')).toContain('left:')
  })
})
