"use client";

import Link from "next/link";
import Image from "next/image"; // <-- Image import add kiya hai
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone, 
  ArrowRight 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-gray-400 pt-16 pb-8 border-t border-white/10" id="contact">
      <div className="max-w-[1630px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* 1. Brand & About */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block group">
              {/* Text hta kar Logo image daal diya */}
              <div className="relative w-[130px] h-[50px] md:w-[90px] md:h-[60px]">
                <Image
                  src="/sme-event.png"
                  alt="SME Events Logo"
                  fill
                  className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              India's premier platform for business events, innovative ideas, and meaningful networking. We bring industry leaders together to shape the future.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white text-lg font-semibold tracking-wide">Explore</h4>
            <div className="flex flex-col gap-4">
              {[
                ["Upcoming Events", "/#upcoming"],
                ["Past Events", "/#past-events"],
                ["Partner with us", "/#partners"],
                ["About Us", "/#about"],
                ["FAQs & Help", "/#faq"]
              ].map(([label, href]) => (
                <Link 
                  key={href} 
                  href={href}
                  className="group flex items-center text-sm w-fit transition-colors duration-300 hover:text-orange-400"
                >
                  <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Contact Info */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white text-lg font-semibold tracking-wide">Contact Us</h4>
            <div className="flex flex-col gap-4 text-sm">
              <a href="mailto:events@smeevents.in" className="flex items-start gap-3 hover:text-orange-400 transition-colors">
                <Mail size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <span>events@smeevents.in</span>
              </a>
              <a href="tel:+919876543210" className="flex items-start gap-3 hover:text-orange-400 transition-colors">
                <Phone size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <span>+91 98765 43210</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <span>Bandra Kurla Complex (BKC),<br />Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* 4. Newsletter */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white text-lg font-semibold tracking-wide">Stay Updated</h4>
            <p className="text-sm">Subscribe to our newsletter for the latest event updates and early bird offers.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-orange-500 text-white font-medium py-3 rounded-md hover:bg-orange-600 transition-colors duration-300 flex items-center justify-center gap-2 group"
              >
                Subscribe
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} SME Events. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}