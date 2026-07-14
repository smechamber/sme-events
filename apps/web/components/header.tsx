"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["Home", "/"],
  ["Upcoming Events", "/#upcoming"],
  ["Past Events", "/#past-events"],
  ["Partner with us", "/#partners"],
  ["About us", "/#about"],
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="utility-bar">
        <div className="site-shell">
          <span>SME EVENTS</span>
          <span className="utility-links">
            LinkedIn &nbsp; X &nbsp; Instagram
          </span>
        </div>
      </div>
      <div className="main-nav">
        <div className="site-shell header-inner">
          <Link href="/" className="brand" aria-label="SME Events home">
            <span>SME</span>
            <small>EVENTS</small>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
            <Link className="nav-calendar" href="/#upcoming">
              Events Calendar
            </Link>
            <Link
              className="nav-search"
              href="/#upcoming"
              aria-label="Search events"
            >
              <Search size={20} />
            </Link>
          </nav>
          <button
            className="mobile-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          className={`mobile-drawer ${open ? "open" : ""}`}
          aria-label="Mobile navigation"
        >
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
