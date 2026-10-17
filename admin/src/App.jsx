import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Add from "./pages/Add/Add.jsx";
import List from "./pages/List/List.jsx";
import Order from "./pages/Orders/Order.jsx";
import { ToastContainer } from "react-toastify";
import { AnimatePresence } from "framer-motion";

const App = () => {
  const url = "https://hooktasy.onrender.com"
  // const url = "https://zootsy-backend.vercel.app";
  // const url = "http://localhost:4000";

  return (
    <div className="app-wrapper">
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <AnimatePresence mode="wait">
          <Routes location={useLocation()}>
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Order url={url} />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
