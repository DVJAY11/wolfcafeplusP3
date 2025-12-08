# 🐺 WRIKICAFE+ — Smart Campus Café Ordering Platform

[![DOI](https://zenodo.org/badge/1080009756.svg)](https://doi.org/10.5281/zenodo.17547164)
[![Build](https://github.com/rishitharamesh/wolfcafeplus/actions/workflows/build.yml/badge.svg)]
[![Lint](https://github.com/rishitharamesh/wolfcafeplus/actions/workflows/lint.yml/badge.svg)]
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![codecov](https://codecov.io/gh/DVJAY11/wolfcafeplusP3/graph/badge.svg?token=0V60J6NUHG)](https://codecov.io/gh/DVJAY11/wolfcafeplusP3)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.0-646cff?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-0.28.0-6DA83F?logo=vitest&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-43853D?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)
![formatter](https://img.shields.io/badge/formatter-Prettier-ff69b4)
> A smarter, personalized, and social campus food-ordering system for NC State University. || Funfact: WrikiCafe+ is derived from the Sanskrit word vṛkī (वृकी) meaning she-wolf ||

🎯 Mission Statement

Campus cafés often struggle with long queues, manual order tracking, and miscommunication.
WrikiCafe+ solves this with a real-time, smart, and personalized ordering system.

Why: Students & staff lose time waiting for orders

What: A role-based ordering platform with instant notifications & recommendations

So What: Faster pickups, smoother operations, and a connected campus dining experience

Each order is tracked from pending → preparing → ready, with instant alerts to users.

📽️ Demo Video (2 min)

🎥 Watch the Version 1 Demo

Showcasing ordering workflow, role-based access, and real-time pickup notifications.

🚀 Project Overview

WrikiCafe+ is a full-stack MERN application that streamlines campus café ordering.

Roles & Capabilities
Role	Features
🧑‍💼 Admin	Manage menu, track orders, update statuses, analytics, tax controls
🧑‍🎓 Customer	Browse, customize, add to cart, order, get instant pickup notifications
🧩 Key Features (v1)

🔐 JWT-based authentication

📋 Menu CRUD for admins

🛒 Cart + checkout flow

📬 Instant “order ready” email notifications

☁️ Cloudinary uploads

📊 Real-time state updates with Socket.IO

📈 Next Milestones (v2)

🤖 AI-powered “Surprise Me” recommendations

👥 Social Group Ordering (now fully implemented in your project)

⏱️ Budget & time–based smart suggestions

🔍 Performance & accessibility enhancements

⚙️ Installation & Setup

Same as original — unchanged.

git clone https://github.com/RishithaRamesh/WrikiCafeplus.git
cd WrikiCafeplus
npm install && cd frontend && npm install
npm run dev


Backend → 5000
Frontend → 3000
Requires .env with MongoDB URI.

👥 Team 19
Name	GitHub
Vanaja Agarwal 

📜 Policies & Standards
File	Description
.gitignore	Files excluded from version control
LICENSE.md	Software license
CODE-OF-CONDUCT.md	Collaboration guidelines
CONTRIBUTING.md	Branching, PR, code-style rules
INSTALL.md	Setup & environment instructions
🧰 Tech Stack

Frontend: React 19 · Vite · Axios · TailwindCSS
Backend: Node · Express · MongoDB (Mongoose) · Socket.IO
Auth: JWT, bcrypt
Storage: Cloudinary
Testing: Jest, Supertest, React Testing Library

💡 Why This Stack?

The MERN stack provides a scalable full-stack architecture with:

Flexible schemas

Fast REST APIs

Interactive UI

Real-time capabilities

🧾 License

This project is released under the terms in LICENSE.md.
© 2025 WrikiCafe+ Team 19 · North Carolina State University

## 🧾 License
This project is released under the terms described in [LICENSE.md](LICENSE.md).

© 2025 WrikiCafe+ Team 16 · North Carolina State University
