import { useState, useRef, useEffect, useCallback, useId } from 'react';
import logo from '../assets/001_HOOKTASY_Logo_a04e109e-6770-4265-bae0-f313fb1d6ed3 (1).png';
import './Navbar.css';
import CartDrawer from './Cartdrawer';
import FloatingButtons from './FloatingButtons';
import bestseller from '../assets/bestseller.jpeg';
import Bundle from '../assets/Bundle-main-image.jpg';
import children from '../assets/children.jpg';
import chrismis from '../assets/chrismis.jpeg';
import Easter_Day from '../assets/Easter_Day.jpg';
import halloween from '../assets/halloween.jpeg';
import nurse from '../assets/nurse.png';
import Valentine from '../assets/Valentine.jpeg';
import dogs from "../assets/Navbar/dogs.jpg"
import cats from "../assets/Navbar/cats.jpg"
import goose from "../assets/Navbar/Goose.png"
import bird from "../assets/Navbar/bird.jpg"
import baphomet from "../assets/Navbar/baphomet.png"
import bunny from "../assets/Navbar/bunny.png"
import animals from "../assets/Navbar/wild_animal.jpeg"
import sea_animals from "../assets/Navbar/sea_animal.jpeg"
import dragon from "../assets/Navbar/dragons.jpg"
/* =====================================================================
   NAV DATA
   ===================================================================== */
const NAV_ITEMS = [
  { id: 'new', label: 'NEW', href: '/collections/new' },
  {
    id: 'explore', label: 'EXPLORE ALL',
    children: [
      { img: bestseller, label: 'Best Sellers', href: '/collections/best-sellers' },
      { img: Bundle, label: 'Bundle', href: '/collections/bundle' },
    ],
  },
  {
    id: 'collections', label: 'COLLECTIONS',
    children: [
      { img: Valentine, label: 'Valentine', href: '/collections/seasonal' },
      { img: Easter_Day, label: 'Easter Day', href: '/collections/holiday' },
      { img: nurse, label: 'Nurse & Lab Chrochet', href: '/collections/beginner' },
      { img: children, label: 'School Children', href: '/collections/limited' },
      { img: halloween, label: 'Halloween', href: '/collections/limited' },
      { img: chrismis, label: 'Chrismis', href: '/collections/limited' },
    ],
  },
  {
    id: 'animals', label: 'ANIMALS',
    children: [
      { img: dogs, label: 'Farm', href: '/collections/animals/farm' },
      { img: cats, label: 'Ocean', href: '/collections/animals/ocean' },
      { img: goose, label: 'Forest', href: '/collections/animals/forest' },
      { img: bird, label: 'Pets', href: '/collections/animals/pets' },
      { img: baphomet, label: 'Pets', href: '/collections/animals/pets' },
      { img: animals, label: 'Pets', href: '/collections/animals/pets' },
      { img: sea_animals, label: 'Pets', href: '/collections/animals/pets' },
      { img: dragon, label: 'Pets', href: '/collections/animals/pets' },

    ],
  },
  {
    id: 'gifts', label: 'GIFTS',
    children: [
      { img: chrismis, label: 'Gifts for Kids', href: '/collections/gifts/kids' },
      { img: chrismis, label: 'Gifts for Adults', href: '/collections/gifts/adults' },
      { img: chrismis, label: 'Gift Cards', href: '/products/gift-card' },
    ],
  },
  {
    id: 'family', label: 'FAMILY SUBSCRIPTION',
    children: [
      { img: chrismis, label: 'How It Works', href: '/subscription/how-it-works' },
      { img: chrismis, label: 'Plans & Pricing', href: '/subscription/plans' },
      { img: chrismis, label: 'Manage Subscription', href: '/account/subscription' },
    ],
  },
  { id: 'reviews', label: 'REVIEWS', href: '/reviews' },
  { id: 'earn', label: 'EARN MONEY', href: '/earn' },
  { id: 'about', label: 'ABOUT US', href: '/about' },
];

/* =====================================================================
   ICONS
   ===================================================================== */
const Svg = ({ className = 'icon-md', children }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ChevronDown = ({ className = 'icon-sm' }) => <Svg className={className}><path d="M6 9l6 6 6-6" /></Svg>;
const CloseIcon = ({ className }) => <Svg className={className}><path d="M5 5l14 14M19 5L5 19" /></Svg>;
const SearchIcon = ({ className = 'icon-lg' }) => <Svg className={className}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Svg>;
const UserIcon = ({ className = 'icon-lg' }) => <Svg className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a5 5 0 015-5h6a5 5 0 015 5v1" /></Svg>;
const BagIcon = ({ className = 'icon-lg' }) => <Svg className={className}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></Svg>;
const MenuIcon = ({ className = 'icon-lg' }) => <Svg className={className}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;

/* =====================================================================
   NAVBAR
   ===================================================================== */
export default function Navbar({
  cartItems = [],
  accountHref = '/account',
  onSearch,
  onCartRemove,
  onCartQtyChange,
  onCheckout,
  onChatClick,
  continueShoppingHref = '/',
  checkoutHref = '/checkout',
  currency = 'Rs.',
  linkComponent: LinkComp = 'a',
  linkProp = 'href',
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpenId, setMobileOpenId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [navHidden, setNavHidden] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const navRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchBtnRef = useRef(null);
  const hamburgerRef = useRef(null);
  const lastScrollY = useRef(0);
  const uid = useId();

  /* Link helper */
  const L = useCallback(
    ({ to, children, ...rest }) => {
      const props = { ...rest, [linkProp]: to };
      return <LinkComp {...props}>{children}</LinkComp>;
    },
    [LinkComp, linkProp]
  );

  /* Close dropdowns on outside click / Escape */
  useEffect(() => {
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setDrawerOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [drawerOpen]);

  /* Close drawer at the same breakpoint the CSS switches to desktop nav (1200px) */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1200px)');
    const handler = (e) => e.matches && setDrawerOpen(false);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Focus search input when it opens */
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  /* Hide navbar on scroll-down, reveal on scroll-up */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (searchOpen || drawerOpen || cartOpen || openMenu !== null) {
        setNavHidden(false);
        lastScrollY.current = y;
        return;
      }

      if (y < 100) {
        setNavHidden(false);
      } else if (delta > 6) {
        setNavHidden(true);
      } else if (delta < -6) {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [searchOpen, drawerOpen, cartOpen, openMenu]);

  /* Desktop dropdown keyboard handling */
  const focusMenuItem = (menuEl, index) => {
    const items = menuEl?.querySelectorAll('a');
    if (!items || !items.length) return;
    items[(index + items.length) % items.length].focus();
  };

  const onTriggerKeyDown = (e, id) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpenMenu(id);
      setTimeout(() => focusMenuItem(document.getElementById(`${uid}-menu-${id}`), 0), 0);
    }
  };

  const onMenuKeyDown = (e, id) => {
    const menuEl = e.currentTarget;
    const items = Array.from(menuEl.querySelectorAll('a'));
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); focusMenuItem(menuEl, idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusMenuItem(menuEl, idx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusMenuItem(menuEl, 0); }
    else if (e.key === 'End') { e.preventDefault(); focusMenuItem(menuEl, items.length - 1); }
    else if (e.key === 'Escape') {
      e.stopPropagation();
      setOpenMenu(null);
      document.getElementById(`${uid}-trigger-${id}`)?.focus();
    }
  };

  const onItemBlur = (e, id) => {
    if (!e.currentTarget.contains(e.relatedTarget) && openMenu === id) setOpenMenu(null);
  };

  /* Search */
  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    else window.location.assign(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery('');
  };

  const closeSearch = () => { setSearchOpen(false); searchBtnRef.current?.focus(); };
  const closeDrawer = () => { setDrawerOpen(false); hamburgerRef.current?.focus(); };

  return (
    <header className={`navbar-header${navHidden ? ' navbar-header--hidden' : ''}`}>
      {/* ── TOP PROMO BAR ── */}

      {/* ── MAIN NAV ── */}
      <div ref={navRef} className="navbar-main">
        <div className="navbar-main__inner">
          {/* LEFT — Hamburger (mobile) + Logo */}
          <div className="navbar-left">
            <button
              type="button"
              ref={hamburgerRef}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls={`${uid}-drawer`}
              onClick={() => setDrawerOpen(true)}
              className="icon-btn navbar-hamburger"
            >
              <MenuIcon />
            </button>

            <L to="/" aria-label="Home" className="navbar-logo-link">
              <img src={logo} alt="Hooktasy logo" className="navbar-logo-img" />
            </L>
          </div>

          {/* CENTER — Desktop nav */}
          <nav aria-label="Main" className="navbar-desktop-nav" onMouseLeave={() => setOpenMenu(null)}>
            <ul className="navbar-desktop-nav__list">
              {NAV_ITEMS.map((item) => {
                const hasChildren = !!item.children;
                const isOpen = openMenu === item.id;
                return (
                  <li
                    key={item.id}
                    className="navbar-desktop-nav__item"
                    onMouseEnter={hasChildren ? () => setOpenMenu(item.id) : undefined}
                    onBlur={hasChildren ? (e) => onItemBlur(e, item.id) : undefined}
                  >
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          id={`${uid}-trigger-${item.id}`}
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                          aria-controls={`${uid}-menu-${item.id}`}
                          onKeyDown={(e) => onTriggerKeyDown(e, item.id)}
                          className="navbar-link"
                        >
                          {item.label}
                          <span className={`navbar-link__chevron${isOpen ? ' navbar-link__chevron--open' : ''}`}>
                            <ChevronDown />
                          </span>
                        </button>

                        <ul
                          id={`${uid}-menu-${item.id}`}
                          onKeyDown={(e) => onMenuKeyDown(e, item.id)}
                          className="dropdown-panel"
                          data-open={isOpen ? 'true' : 'false'}
                        >
                          {item.children.map((child) => (
                            <li key={child.label} className="dropdown-panel__item">
                              <L to={child.href} onClick={() => setOpenMenu(null)} className="dropdown-panel__link">
                                <img src={child.img} alt="" className="dropdown-panel__img" />
                                {child.label}
                              </L>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <L to={item.href} className="navbar-link">{item.label}</L>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT — Action icons */}
          <div className="navbar-actions">
            <button
              type="button"
              ref={searchBtnRef}
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className="icon-btn"
            >
              <SearchIcon />
            </button>

            <L to={accountHref} aria-label="Account" className="icon-btn icon-btn--desktop-only">
              <UserIcon />
            </L>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart, ${cartCount} items`}
              aria-haspopup="true"
              aria-expanded={cartOpen}
              className="icon-btn"
            >
              <BagIcon />
              {cartCount > 0 && (
                <span aria-hidden="true" className="cart-badge">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search panel */}
        <div
          aria-hidden={!searchOpen}
          className={`search-panel${searchOpen ? ' search-panel--open' : ''}`}
        >
          <form role="search" onSubmit={submitSearch} className="search-panel__form">
            <SearchIcon className="icon-search-panel" />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              tabIndex={searchOpen ? 0 : -1}
              className="search-panel__input"
            />
            <button type="submit" tabIndex={searchOpen ? 0 : -1} className="search-panel__submit">
              Search
            </button>
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              tabIndex={searchOpen ? 0 : -1}
              className="search-panel__close"
            >
              <CloseIcon className="icon-close-search" />
            </button>
          </form>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div className={`drawer-root${drawerOpen ? ' drawer-root--open' : ''}`}>
        <div onClick={closeDrawer} className="drawer-overlay" />

        <aside
          id={`${uid}-drawer`}
          aria-label="Mobile menu"
          aria-hidden={!drawerOpen}
          className="drawer-panel"
          data-open={drawerOpen ? 'true' : 'false'}
        >
          <div className="drawer-panel__header">
            <img src={logo} alt="" className="drawer-panel__logo" />
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close menu"
              tabIndex={drawerOpen ? 0 : -1}
              className="icon-btn"
            >
              <CloseIcon className="icon-close-drawer" />
            </button>
          </div>

          <ul className="drawer-panel__list">
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.children;
              const open = mobileOpenId === item.id;
              const tab = drawerOpen ? 0 : -1;
              return (
                <li key={item.id} className="drawer-panel__item">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={open}
                        tabIndex={tab}
                        onClick={() => setMobileOpenId(open ? null : item.id)}
                        className="drawer-row"
                      >
                        {item.label}
                        <span className={`navbar-link__chevron${open ? ' navbar-link__chevron--open' : ''}`}>
                          <ChevronDown />
                        </span>
                      </button>

                      <div className="accordion-body" data-open={open ? 'true' : 'false'}>
                        <ul className="accordion-body__list">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <L
                                to={child.href}
                                tabIndex={open && drawerOpen ? 0 : -1}
                                onClick={closeDrawer}
                                className="accordion-body__link"
                              >
                                {child.label}
                              </L>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <L to={item.href} tabIndex={tab} onClick={closeDrawer} className="drawer-row">
                      {item.label}
                    </L>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="drawer-panel__footer">
            <L
              to={accountHref}
              tabIndex={drawerOpen ? 0 : -1}
              onClick={closeDrawer}
              className="drawer-panel__account-link"
            >
              <UserIcon className="icon-account-drawer" /> My account
            </L>
          </div>
        </aside>
      </div>

      {/* ── CART DRAWER ── */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        currency={currency}
        onRemove={onCartRemove}
        onQtyChange={onCartQtyChange}
        onCheckout={onCheckout}
        continueShoppingHref={continueShoppingHref}
        checkoutHref={checkoutHref}
        linkComponent={LinkComp}
        linkProp={linkProp}
      />

      {/* ── FLOATING CHAT + CART BUTTONS ── */}
      <FloatingButtons
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onChatClick={onChatClick}
      />
    </header>
  );
}