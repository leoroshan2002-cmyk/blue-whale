import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function Layout() {
  const location = useLocation();
  const isHomePage = ["/", "/home"].includes(location.pathname);
  const isWomenPage = location.pathname === "/category/women";

  return (
    <>
      <Navbar />

      <main className={`${isHomePage || isWomenPage ? "" : "pt-16 sm:pt-20"} overflow-x-hidden`}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}