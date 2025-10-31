import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", backgroundColor: "#f5f5f5" }}>
        <Link to="/">Home</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;