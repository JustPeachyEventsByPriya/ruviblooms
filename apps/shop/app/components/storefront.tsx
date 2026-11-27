import {Link, NavLink} from 'react-router';
import {useEffect, useRef, useState, type ReactNode} from 'react';

const navigation = [
  {label: 'Collections', href: '/collections'},
  {label: 'Signature Edit', href: '/#signature-edit'},
  {label: 'Our Story', href: '/#story'},
  {label: 'Rentals', href: '/rentals'},
];

export type EditorialImage = {
  name: string;
  alt: string;
};

export function EditorialPhoto({image, eager = false, sizes}: {
  image: EditorialImage;
  eager?: boolean;
  sizes: string;
}) {
  const base = '/editorial/' + image.name;

  return (
    <img
      className="size-full object-cover"
      src={base + '-800.jpg'}
      srcSet={base + '-480.jpg 480w, ' + base + '-800.jpg 800w, ' + base + '-1200.jpg 1200w'}
      sizes={sizes}
      width={800}
      height={1000}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}

export function BrandLogo({footer = false}: {footer?: boolean}) {
  return (
    <img src="/brand/01_Desktop_Master.png" alt="Ruvi Blooms" width={1254} height={816}
      className={footer ? 'h-auto w-44' : 'masthead-logo h-20 w-auto md:h-23'} loading={footer ? 'lazy' : 'eager'} />
  );
}

function HeaderNavLink({href, label, onClick}: {href: string; label: string; onClick?: () => void}) {
  return href.includes('#') ? (
    <Link className="masthead-link" to={href} onClick={onClick} viewTransition>{label}</Link>
  ) : (
    <NavLink className="masthead-link" to={href} onClick={onClick} viewTransition>{label}</NavLink>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 48rem)');
    const close = () => setOpen(false);
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return (
    <header className="masthead relative z-10 bg-[#2a081e] text-ivory">
      <p className="border-b border-gold/20 bg-[#200715] px-4 py-1.5 text-center text-[0.7rem] font-semibold tracking-[0.14em] text-gold uppercase">
        Coming soon to the U.S. &amp; Canada
      </p>
      <div className="shell flex min-h-21 items-center gap-3 md:grid md:min-h-24 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="justify-self-start" aria-label="Ruvi Blooms home" viewTransition><BrandLogo /></Link>
        <nav className="hidden items-center gap-7 md:flex lg:gap-10" aria-label="Main navigation">
          {navigation.map(({label, href}) => <HeaderNavLink key={href} href={href} label={label} />)}
        </nav>
        <NavLink className="masthead-link ml-auto justify-self-end" to="/cart" viewTransition>Bag</NavLink>
        <button ref={button} className="masthead-link gap-2.5 px-1 md:hidden"
          type="button" aria-controls="mobile-navigation" aria-expanded={open}
          onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
          <span aria-hidden="true" className="menu-icon" />
        </button>
      </div>
      <nav inert={!open} id="mobile-navigation" aria-label="Main navigation"
        data-open={open} className="mobile-panel absolute inset-x-0 top-full border-b border-gold/30 bg-[#2a081e] shadow-lg">
        <div className="overflow-hidden">
          <ul className="shell py-2">
            {navigation.map(({label, href}) => (
              <li key={href}>
                <HeaderNavLink href={href} label={label} onClick={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export function SectionHeading({eyebrow, children, description}: {
  eyebrow: string;
  children: ReactNode;
  description: string;
}) {
  return (
    <div className="mb-6 grid gap-4 md:mb-8 md:grid-cols-[1.5fr_1fr] md:items-end">
      <div>
        <p className="eyebrow text-wine">{eyebrow}</p>
        <h2 className="display-heading mt-3">{children}</h2>
      </div>
      <p className="max-w-sm leading-relaxed text-muted md:justify-self-end">{description}</p>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="store-footer bg-[#2a081e] text-ivory">
      <div className="shell grid gap-6 py-9 sm:grid-cols-2 sm:items-center">
        <div>
          <Link className="inline-block" to="/" aria-label="Ruvi Blooms home" viewTransition><BrandLogo footer /></Link>
          <p className="mt-3 text-sm text-blush">Timeless floral art for beautiful spaces.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end" aria-label="Footer navigation">
          {navigation.map(({label, href}) => <Link className="text-sm underline-offset-4 hover:underline" key={href} to={href} viewTransition>{label}</Link>)}
        </nav>
        <p className="border-t border-white/20 pt-5 text-sm text-blush sm:col-span-2">© 2026 Ruvi Blooms</p>
      </div>
    </footer>
  );
}
