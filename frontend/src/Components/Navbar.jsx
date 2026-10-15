import { NavLink, useLocation } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useWishlist } from "../Context/WhislistContext";
import { useCart } from "../Context/CartContext";
import logotransparent from "../assets/BlueWhaleLogoTransparent.png";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";

const navItems = [
  { name: "Home", path: "/", end: true },
  { name: "Men", path: "/category/men" },
  { name: "Women", path: "/category/women" },
  { name: "Combo", path: "/category/combo" },
];

export default function Navbar() {
  const { wishlist } = useWishlist();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const location = useLocation();
  const isHomePage = ["/", "/home"].includes(location.pathname);
  const isWomenPage = location.pathname === "/category/women";

  const [search, setSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Transparent over the hero until the page is scrolled
  const overHero = (isHomePage || isWomenPage) && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        overHero
          ? "bg-gradient-to-b from-black/60 via-black/20 to-transparent"
          : "bg-white/95 shadow-md backdrop-blur-md"
      }`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6">
        {/* LOGO */}
        <NavLink to="/" className="shrink-0">
          <img
            src={logotransparent}
            alt="Blue Whale Collection Logo"
            className={`h-9 w-auto object-contain transition-all duration-300 sm:h-14 ${overHero ? "brightness-0 invert" : ""}`}
          />
        </NavLink>
        {/* NAVIGATION */}
        <nav className={`hidden md:flex gap-4 lg:gap-10 font-medium ${overHero ? "text-[10px] lg:text-[11px] uppercase tracking-[0.16em] lg:tracking-[0.24em]" : "text-sm"}`}>
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ y: -2 }}
              className="serif"
            >
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `relative py-1 transition-all duration-300 ${
                    overHero
                      ? isActive
                        ? "text-white"
                        : "text-white/85 hover:text-white"
                      : isActive
                        ? "text-amber-700"
                        : "text-gray-900 hover:text-amber-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    <span
                      className={`absolute left-0 -bottom-1 h-[1px] ${overHero ? "bg-[#c9a46a]" : "bg-amber-700"} transition-all duration-300 ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* ICONS */}
        <div
          className={`flex items-center gap-2 sm:gap-4 transition-colors duration-300 ${
            overHero ? "text-white" : "text-gray-800"
          }`}
        >
          <button
            onClick={() => setSearch(true)}
            className="cursor-pointer rounded-full p-1.5 hover:text-amber-700 transition"
            aria-label="Search"
            type="button"
          >
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <NavLink
            to="/wishlist"
            className="relative rounded-full p-1.5 hover:text-amber-700 transition"
          >
            <Heart className="h-5 w-5 sm:h-6 sm:w-6" />

            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/cart"
            className="relative rounded-full p-1.5 hover:text-amber-700 transition"
          >
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            className="md:hidden rounded-full p-1.5 hover:text-amber-700 transition"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-black/10 bg-white px-5 py-4 shadow-lg text-gray-900">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `border-b border-gray-100 px-1 py-3 text-sm font-medium ${
                    isActive ? "text-amber-700" : "text-gray-800"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      )}

      {/* SEARCH */}
      {search && <SearchBar open={search} setOpen={setSearch} />}
    </header>
  );
}
