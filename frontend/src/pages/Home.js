import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("/api")
      .then((res) => setMsg(res.data.message))
      .catch(() => setMsg("Backend not reachable 😢"));
  }, []);

  return (
    <div className="App">
      <h1>☕ WolfCafe+</h1>
      <p>{msg}</p>
    </div>
  );
}