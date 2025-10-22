import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Groupe from "./pages/Groupe";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 PAGE SANS LAYOUT */}
        <Route path="/login" element={<Login />} />

        {/* 🔹 TOUTES LES AUTRES DANS LE LAYOUT */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="leaderboard" element={<p>Leaderboard</p>} />
          <Route path="group" element={<Groupe />} />
          <Route path="settings" element={<p>Settings</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
