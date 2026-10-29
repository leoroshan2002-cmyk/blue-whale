import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import HomeFooter from "../Components/home/HomeFooter";

export default function Layout() {
  const location = useLocation();
  const isHomePage = ["/", "/home"].includes(location.pathname);
  const isWomenPage = location.pathname === "/category/women";
  const isMenPage = location.pathname === "/category/men";
  const isComboPage = location.pathname === "/products";
  const isCategoryProductsPage = ["/category/men/all", "/category/women/all"].includes(location.pathname);
  const isAccountPage = location.pathname === "/account";

  return (
    <>
      <Navbar />

      <main className={`${isHomePage || isWomenPage || isMenPage || isComboPage || isCategoryProductsPage ? "" : "pt-16 sm:pt-20"} overflow-x-hidden`}>
        <Outlet />
      </main>
      {!isAccountPage && <HomeFooter />}
    </>
  );
}