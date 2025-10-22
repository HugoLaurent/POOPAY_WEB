import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Groupe from "./pages/Groupe";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
