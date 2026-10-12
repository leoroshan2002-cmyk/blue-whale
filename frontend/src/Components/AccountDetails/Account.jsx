import { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import SecuritySection from "./SecuritySection";
import Preferences from "./Preferences";
import OrderHistory from "./OrderHistory";
import Sidebar from "./SideBar";

export default function Account() {
  const [activePage, setActivePage] = useState("Personal Details");

  const renderPage = () => {
    switch (activePage) {
      case "Personal Details":
        return <PersonalInfo />;
      case "Security":
        return <SecuritySection />;
      case "Preferences":
        return <Preferences />;
      case "Order History":
        return <OrderHistory />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="min-h-[calc(100dvh-80px)] bg-[#FCFAF8]">
      {/* Fixed Sidebar */}
      <Sidebar
        activepage={activePage}
        setActivePage={setActivePage}
      />

      {/* Right Content */}
      <main className="ml-0 min-w-0 px-4 pb-8 sm:px-6 md:ml-[270px] md:h-[calc(100vh-80px)] md:overflow-y-auto md:px-10 lg:px-16">
        {renderPage()}
      </main>
    </div>
  );
}