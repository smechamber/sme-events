import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="site-shell footer-grid">
        <div><Link className="footer-brand" href="/"><span>SME</span> EVENTS</Link><p>India's platform for business events, ideas, and meaningful conversations.</p></div>
        <div><h4>Explore</h4><Link href="/#upcoming">Upcoming events</Link><Link href="/#past-events">Past events</Link><Link href="/#partners">Partner with us</Link></div>
        <div><h4>Contact</h4><a href="mailto:events@smeevents.in">events@smeevents.in</a><span>Mumbai, India</span></div>
      </div>
      <div className="site-shell footer-bottom"><span>© 2026 SME Events. All rights reserved.</span><span>Privacy · Terms</span></div>
    </footer>
  );
}
