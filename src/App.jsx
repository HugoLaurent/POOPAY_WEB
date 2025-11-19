import { Routes, Route } from "react-router-dom";
import { AppLayout, AuthLayout } from "@/components";
import {
  ConditionsGeneralesVente,
  Groupe,
  Home,
  Leaderboard,
  Login,
  MentionsLegales,
  PolitiqueConfidentialite,
  Settings,
  SignUp,
  Timer,
} from "@/pages";
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
      {/* �Y"� Pages publiques */}
      <Route path="/mentions-legales" element={<MentionsLegales />} />
      <Route
        path="/politique-de-confidentialite"
        element={<PolitiqueConfidentialite />}
      />
      <Route path="/cgv" element={<ConditionsGeneralesVente />} />
    </Routes>
  );
}

export default App;
