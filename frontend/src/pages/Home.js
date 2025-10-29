import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    axios.get("/api")
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus("Backend not reachable"));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>☕ Welcome to WolfCafe+</h1>
      <p>{status}</p>
      <p>Explore our menu and enjoy smarter, personalized campus dining!</p>
    </div>
  );
}
