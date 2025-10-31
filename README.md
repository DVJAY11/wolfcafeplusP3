# ☕ WolfCafe+

**WolfCafe+** is a full-stack MERN (MongoDB, Express, React, Node.js) web application for smart campus food ordering and menu personalization.  
It provides a modular backend API and a dynamic React frontend for students, staff, and administrators.

---

## 🚀 Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend** | React, Axios, React Router DOM |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (via Mongoose) |
| **Runtime / Dev Tools** | Nodemon, dotenv, CORS |

---

## 📁 Project Structure

wolfcafeplus/
├── backend/ – Express + MongoDB API
│ ├── server.js
│ ├── .env
│ └── package.json
├── frontend/ – React app
│ ├── src/
│ ├── public/
│ └── package.json
└── README.md

⚙️ Getting Started

1. Clone the repository

git clone https://github.com/rishitharamesh/wolfcafeplus.git
cd wolfcafeplus


2. Setup backend
cd backend
npm install
npm install express mongoose dotenv cors nodemon

Create .env:
PORT=5000
MONGO_URI=mongodb://localhost:27017/wolfcafeplus

Run:
npm run dev

Backend → http://localhost:5000

3. Setup frontend

cd ../frontend
npm install
npm start

Frontend → http://localhost:3000