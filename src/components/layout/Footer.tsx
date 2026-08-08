import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--color-background)] border-t border-white/5 pt-20 flex flex-col text-fg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex flex-col mb-6">
              <span className="text-2xl font-black tracking-tighter leading-none text-white">KBL</span>
              <span className="text-[10px] tracking-[0.3em] font-light opacity-60 uppercase text-white">Electronics</span>
            </Link>
            <p className="text-fg0 mb-8 max-w-sm text-sm">
              Your premium destination for the latest consumer electronics, gaming consoles, and smart home devices. 
              Authorized retailer for top global brands.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors text-white border border-white/10">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors text-white border border-white/10">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors text-white border border-white/10">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors text-white border border-white/10">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-display font-semibold mb-6">Shop Categories</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/categories/smartphones" className="hover:text-brand-primary transition-colors">Smartphones</Link></li>
              <li><Link to="/categories/gaming" className="hover:text-brand-primary transition-colors">Gaming Consoles</Link></li>
              <li><Link to="/categories/audio" className="hover:text-brand-primary transition-colors">Audio & Headphones</Link></li>
              <li><Link to="/categories/wearables" className="hover:text-brand-primary transition-colors">Smart Watches</Link></li>
              <li><Link to="/categories/accessories" className="hover:text-brand-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-display font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/support" className="hover:text-brand-primary transition-colors">Help Center</Link></li>
              <li><Link to="/warranty" className="hover:text-brand-primary transition-colors">Warranty & Returns</Link></li>
              <li><Link to="/repair-services" className="hover:text-brand-primary transition-colors">Repair Services</Link></li>
              <li><Link to="/trade-in" className="hover:text-brand-primary transition-colors">Trade-In Program</Link></li>
              <li><Link to="/faq" className="hover:text-brand-primary transition-colors">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-display font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                <a 
                  href="https://www.google.com/maps/place/KBL+ELECTRONICS/@4.0691649,9.756851,17z/data=!3m1!4b1!4m6!3m5!1s0x10610d00119e8edb:0x2cf5571c24fe9b40!8m2!3d4.0691649!4d9.756851!16s%2Fg%2F11wfz18p8g!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDgwNC4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-brand-primary transition-colors underline decoration-brand-primary/40 underline-offset-4"
                >
                  KBL ELECTRONICS (View on Google Maps)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-primary shrink-0" />
                <a href="tel:+237694469246" className="hover:text-brand-primary transition-colors">
                  +237 694 469 246
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-primary shrink-0" />
                <span>support@kblelectronics.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Enterprise Status Bar */}
      <div className="bg-black/40 border-t border-white/5 py-4 px-4 sm:px-8 mt-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-500 font-mono gap-4">
          <div>STATUS: <span className="text-green-500 font-semibold">SYSTEMS_OPTIMAL</span></div>
          <div className="flex gap-4 sm:gap-8 uppercase tracking-widest flex-wrap justify-center">
            <span>Latency: 24ms</span>
            <span className="hidden sm:inline">Region: Global_Edge_A</span>
            <span className="hidden sm:inline">Build: 1.9.0-Enterprise</span>
          </div>
          <div>&copy; {new Date().getFullYear()} KBL ELECTRONICS ENTERPRISE GROUP</div>
        </div>
      </div>
    </footer>
  );
}
