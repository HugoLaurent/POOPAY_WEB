import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout, AuthLayout } from "@/components";
import { Groupe, Home, Leaderboard, Login, Settings, SignUp, Timer } from "@/pages";
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
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="timer" element={<Timer />} />
        <Route path="group" element={<Groupe />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
