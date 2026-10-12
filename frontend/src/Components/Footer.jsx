import { ArrowRight, AtSign, Camera, FactoryIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import logotransparent from "../assets/BlueWhaleLogoTransparent.png";

export default function Footer() {
  return (
    <footer className="mx-2 overflow-hidden rounded-t-[22px] bg-white text-[#071329]">
      <div className="mx-auto px-4 py-4 sm:px-8 sm:py-2 lg:px-6 lg:pb-[80px] lg:pt-[60px]">
        <div className="grid gap-6 p-4 sm:gap-2 sm:p-15 lg:grid-cols-2 lg:gap-[10px]">
          <div>
            <Link to="/home">
              <img
                src={logotransparent}
                alt="Blue Whale Collection Logo"
                className="h-10 w-auto object-contain transition-all duration-300 sm:h-14"
              />
            </Link>
            <p className="mt-5 max-w-[510px] text-sm leading-6 text-[#344054] sm:mt-7 sm:text-[17px] sm:leading-7">
              Bringing timeless Indian weaves to your wardrobe. Rooted in tradition,<br className="hidden sm:block" />
              crafted for today.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-10">
              <span className="mr-1 text-sm sm:mr-3 sm:text-[17px]">Follow us on</span>
              {[
                [Camera, "Instagram"],
                [X, "X"],
                [AtSign, "Facebook"],
                [FactoryIcon, "LinkedIn"],
              ].map(([Icon, label]) => (
                <a
                  key={label}
                  href="#social"
                  aria-label={label}
                  className="grid size-[42px] place-items-center rounded-[10px] bg-[#f4f6f7] transition hover:bg-[#e9edef] sm:size-[50px]"
                >
                  <Icon size={18} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[24px] font-medium sm:text-[31px]">Newsletter</h2>
            <p className="mt-4 max-w-[500px] text-sm leading-6 text-[#344054] sm:mt-5 sm:text-[17px] sm:leading-7">
              Get exclusive drops, styling notes, and early access to new<br className="hidden sm:block" />
              collections, straight to your inbox.
            </p>
            <form className="mt-6 flex h-[52px] items-center rounded-full border border-[#e9edef] bg-[#f4f6f7] p-1.5 sm:mt-9 sm:h-[60px]">
              <input
                type="email"
                aria-label="Your email address"
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[#071329] outline-none placeholder:text-[#344054] sm:px-5 sm:text-[16px]"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f47c20] text-white transition hover:bg-[#df6810] sm:size-11"
              >
                <ArrowRight size={20} strokeWidth={1.7} />
              </button>
            </form>
          </div>
        </div>

        <div className="my-8 border-t border-[#dfe3e6] sm:my-10" />

        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-5 lg:gap-10">
          <FooterColumn title="Company" links={[["About Us", "/brand-story"], ["Our Story", "/brand-story"], ["Careers", "/contact"]]} />
          <FooterColumn title="Customer Support" links={[["FAQ", "/contact"], ["Track Order", "/orders"], ["Shipping & Returns", "/shipping-returns"]]} />
          <FooterColumn title="Shop" links={[["NEW ARRAIVAL", "/category/new-arraival"], ["KIDS", "/category/kids"], ["WOMEN", "/category/women"], ["MEN", "/category/men"], ["UNISEX", "/category/unisex"]]} />
          <FooterColumn title="Quick Links" links={[["Categories", "/categories"], ["Wishlist", "/wishlist"], ["Cart", "/cart"], ["My Account", "/account"]]} />
          <div>
            <h3 className="text-[17px] font-medium">Contact</h3>
            <address className="mt-5 space-y-3 text-[15px] not-italic leading-6 text-[#526071] sm:mt-7 sm:text-[16px]">
              <a href="mailto:contact@yourdomain.com" className="block hover:text-[#071329]">contact@yourdomain.com</a>
              <a href="tel:+15550000000" className="block hover:text-[#071329]">+1 (555) 000-0000</a>
              <p>Tiruppur, Palladam, Mangalam Road,<br />Sriram Opposite, Bhavendhar Street,<br />Palladam - 641664</p>
              <p>Mon–Fri, 9am–6pm</p>
            </address>
          </div>
        </div>
      </div>

    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-[17px] font-medium">{title}</h3>
      <ul className="mt-7 space-y-4 text-[16px] leading-6 text-[#526071]">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="hover:text-[#071329]">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}