"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // NAYA IMPORT
import { 
  Menu, 
  Search, 
  X, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Accessibility 
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

const links = [
  // ["Home", "/"],
  ["Upcoming Events", "/#upcoming"],
  ["Past Events", "/events/past-events"],
  ["Partner with us", "/partner-with-us"],
  ["About us", "/#about"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Read the current URL.
  const pathname = usePathname();
  
  // Mark event pages based on the current URL.
  const isEventPage = pathname?.includes("/events");
  
  // Keep the header white on event pages or after scrolling.
  const forceWhite = isEventPage || isScrolled;

  // Track scrolling.
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Keep the header fixed so it floats over the hero section.
    <header className="fixed top-0 z-50 w-full flex flex-col transition-all duration-500">
      
      {/* Top utility bar */}
      <div className="bg-[#0a0a0a] text-white/80 py-1 border-b border-white/10">
        <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs md:text-sm font-medium">
          
          
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={16} />
            </Link>
            <Link href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <Facebook size={16} />
            </Link>
            <Link href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <Twitter size={16} />
            </Link>
            <Link href="#" className="hover:text-white transition-colors" aria-label="Youtube">
              <Youtube size={16} />
            </Link>
          </div>

        
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Help</Link>
            <Link href="#" className="hover:text-white transition-colors">FAQs</Link>
            <button 
              className="bg-white text-black p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Accessibility options"
            >
              <Accessibility size={16} />
            </button>
          </div>
          
        </div>
      </div>

      {/* Main navigation uses forceWhite instead of isScrolled. */}
      <div 
        className={`transition-all duration-500 ease-in-out ${
          forceWhite ? "bg-white shadow-lg py-2" : "bg-transparent py-0"
        }`}
      >
        <div className="max-w-[1630px] mx-auto flex justify-between items-stretch h-16 md:h-20 px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo - Image */}
          <Link   
            href="/" 
            className="flex items-center group" 
            aria-label="SME Events home"
          >
            <div className="relative w-[100px] h-[55px] md:w-[130px] md:h-[80px] ml-0 md:-ml-2">
              <Image
                src="/Logos-SME-EVENTS.svg"
                alt="SME Events Logo"
                fill
                className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-stretch" aria-label="Primary navigation">
            {/* Links Container */}
            <div className="flex items-center gap-8 mr-8">
              {links.map(([label, href]) => (
                <Link 
                  key={href} 
                  href={href}
                  className={`text-[15px] font-medium transition-colors duration-300 whitespace-nowrap border-b-2 border-transparent hover:border-orange-400 ${
                    forceWhite 
                      ? "text-gray-700 hover:text-black" 
                      : "text-white hover:text-white/70 drop-shadow-md"
                  }`}
                > 
                  {label}
                </Link>
              ))}
            </div>
            
            {/* Search Icon */}
            <button
              className={`flex items-center justify-center px-6 transition-colors duration-300 ${
                forceWhite 
                  ? "hover:bg-gray-100 bg-gray-100 text-black" 
                  : "hover:bg-white/10 bg-gray-100/20 text-white"
              }`}
              aria-label="Search events"
            >
              <Search size={22} />
            </button>
          </nav>

          {/* Mobile Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              className={`flex items-center justify-center rounded-md transition-colors duration-300 ${
                forceWhite ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10"
              }`}
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile Drawer Menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-400 ease-out md:hidden flex flex-col pt-4 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex justify-end px-4 mb-8">
          <button 
            onClick={() => setOpen(false)} 
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={26} />
          </button>
        </div>
        
        <div className="flex flex-col px-8 gap-6">
          {links.map(([label, href]) => (
            <Link 
              key={href} 
              href={href} 
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-gray-800 hover:text-black transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="w-full h-px bg-gray-100 my-2" />
          <Link 
            href="/#upcoming" 
            onClick={() => setOpen(false)}
            className="text-lg font-bold text-[#e31837]"
          >
            Events Calendar
          </Link>
        </div>
      </nav>
    </header>
  );
}
