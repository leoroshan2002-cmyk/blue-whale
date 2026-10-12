import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "../../assets/BlueWhaleLogoTransparent.png";

const COLUMNS = [
  { title: "Quick Links", links: [["Home", "/"], ["Shop", "/products"], ["Collections", "/category/women"], ["About Us", "/brand-story"], ["Contact", "/contact"]] },
  { title: "Shop by", links: [["Women", "/category/women"], ["Men", "/category/men"], ["Sarees", "/category/women"], ["Dhotis", "/category/men"], ["Accessories", "/products"]] },
  { title: "Customer Care", links: [["FAQ", "/contact"], ["Shipping & Delivery", "/shipping-returns"], ["Returns & Exchanges", "/shipping-returns"], ["Size Guide", "/products"], ["Track Order", "/orders"]] },
];

const YEAR = new Date().getFullYear();

export default function HomeFooter() {
  return (
    <footer className="bw-footer">
      <div className="bw-footer-main">
        <div className="bw-footer-brand">
          <Link to="/" aria-label="Blue Whale Collection home">
            <img src={logo} alt="Blue Whale Collection" />
          </Link>
          <p>Bringing timeless Indian weaves to your wardrobe.<br />Rooted in tradition, crafted for today.</p>
          <address className="bw-footer-address">Tiruppur, Palladam, Mangalam Road,<br />Sriram Opposite, Bhavendhar Street,<br />Palladam - 641664</address>
          <div className="bw-footer-social">
            <a href="#social" aria-label="Instagram">◎</a>
            <a href="#social" aria-label="Facebook">f</a>
            <a href="#social" aria-label="Pinterest">P</a>
            <a href="#social" aria-label="YouTube">▶</a>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div className="bw-footer-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map(([label, href]) => <Link to={href} key={label}>{label}</Link>)}
          </div>
        ))}

        <div className="bw-footer-newsletter" id="newsletter">
          <h3>Stay in Touch</h3>
          <p>Get exclusive updates, new arrivals<br />and special offers.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" aria-label="Email address" />
            <button type="submit" aria-label="Subscribe"><ArrowRight size={16} /></button>
          </form>
        </div>
      </div>
      <div className="bw-footer-bottom">
        <span>© {YEAR} Blue Whale Collection. All rights reserved.</span>
        <div><Link to="/privacy-policy">Privacy Policy</Link><i /> <Link to="/terms-of-service">Terms of Service</Link></div>
      </div>
    </footer>
  );
}
