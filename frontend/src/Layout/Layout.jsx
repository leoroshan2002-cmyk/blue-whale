import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import HomeFooter from "../Components/home/HomeFooter";

export default function Layout() {
  const location = useLocation();
  const isHomePage = ["/", "/home"].includes(location.pathname);
  const isWomenPage = location.pathname === "/category/women";
  const isMenPage = location.pathname.startsWith("/category/men");
  const isComboPage = location.pathname === "/products";
  const useHomeFooter = isHomePage || isWomenPage || isMenPage || isComboPage;

  return (
    <>
      <Navbar />

      <main className={`${isHomePage || isWomenPage ? "" : "pt-16 sm:pt-20"} overflow-x-hidden`}>
        <Outlet />
      </main>
      {useHomeFooter ? <HomeFooter /> : <Footer />}
    </>
  );
}