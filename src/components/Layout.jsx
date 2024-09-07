import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

const Layout = () => {
  return (
    <div className="w-full h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;