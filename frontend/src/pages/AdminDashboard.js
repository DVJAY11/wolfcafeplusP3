import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/admin")
      .then(res => setMessage(res.data))
      .catch(err => setMessage(err.response?.data?.message || "Access denied"));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-3">Admin Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}
