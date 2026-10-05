import { NavLink, useLocation } from "react-router-dom";
import { Heart, LayoutGrid, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useWishlist } from "../Context/WhislistContext";
import { useCart } from "../Context/CartContext";
import logotransparent from "../assets/HaierahLogoTransparent.png";
import CategoriesSidebar from "./CategoriesSidebar";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { fetchCategories } from "../services/api";

const staticNavItems = [
  // { name: "ALL CATEGORIES", path: "/products", type: "page" },
];

export default function Navbar() {
  const { wishlist } = useWishlist();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const location = useLocation();
  const isHomePage = ["/", "/home"].includes(location.pathname);

  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("MEN");
  const [search, setSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  const categoryNavItems = categories
    .filter(
      (cat) =>
        !staticNavItems.some((item) => item.name === cat.name?.toUpperCase()) &&
        cat.slug,
    )
    .map((cat) => ({
      name: cat.name?.toUpperCase(),
      path: `/category/${cat.slug}`,
      type: "category-page",
    }));

  const navItems = [...staticNavItems, ...categoryNavItems].filter(
    (item, index, array) =>
      index ===
      array.findIndex(
        (other) => other.name === item.name && other.path === item.path,
      ),
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const response = await fetchCategories();
      setCategories(response);
    };

    loadCategories();
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isHomePage
          ? isScrolled
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "bg-black/25 shadow-sm backdrop-blur-md"
          : "bg-white/95 shadow-md backdrop-blur-md"
      }`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-6">
        {/* LOGO */}
        <NavLink to="/home" className="shrink-0">
          <img
            src={logotransparent}
            alt="HAIERAH Logo"
            className="h-9 w-auto object-contain transition-all duration-300 sm:h-14"
          />
        </NavLink>
        {/* NAVIGATION */}
        <nav className="hidden md:flex gap-6 lg:gap-10 text-sm font-medium">
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ y: -2 }}
              className="serif"
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative py-1 transition-all duration-300 ${
                    isHomePage
                      ? isScrolled
                        ? isActive
                          ? "text-amber-700"
                          : "text-gray-900 hover:text-amber-700"
                        : isActive
                          ? "text-white"
                          : "text-white hover:text-gray-300"
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
                      className={`absolute left-0 -bottom-1 h-[2px] bg-amber-700 transition-all duration-300 ${
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
            isHomePage
              ? isScrolled
                ? "text-gray-800"
                : "text-white"
              : "text-gray-800"
          }`}
        >
          <button
            onClick={() => {
              setActiveMenu("MEN");
              setOpen(true);
            }}
            className="hidden cursor-pointer hover:text-amber-700 transition md:block"
            aria-label="Open categories"
            type="button"
          >
            <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

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

          <NavLink to="/account" className="rounded-full p-1.5 hover:text-amber-700 transition">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
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
                className={({ isActive }) =>
                  `border-b border-gray-100 px-1 py-3 text-sm font-medium ${
                    isActive ? "text-amber-700" : "text-gray-800"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("MEN");
                setOpen(true);
                setMobileMenuOpen(false);
              }}
              className="border-b border-gray-100 px-1 py-3 text-left text-sm font-medium text-gray-800"
            >
              ALL CATEGORIES
            </button>
          </div>
        </nav>
      )}

      {/* CATEGORY SIDEBAR */}
      <CategoriesSidebar
        open={open}
        setOpen={setOpen}
        activeMenu={activeMenu}
      />

      {/* SEARCH */}
      {search && <SearchBar open={search} setOpen={setSearch} />}
    </header>
  );
}
