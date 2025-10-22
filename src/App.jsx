import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import AuthLayout from "./components/AuthLayout";
import Home from "./pages/Home";
import Groupe from "./pages/Groupe";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* 🔹 PAGE SANS LAYOUT */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>
      {/* 🔹 TOUTES LES AUTRES DANS LE LAYOUT */}
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="leaderboard" element={<p>Leaderboard</p>} />
        <Route path="group" element={<Groupe />} />
        <Route path="settings" element={<p>Settings</p>} />
      </Route>
    </Routes>
  );
}

export default App;
