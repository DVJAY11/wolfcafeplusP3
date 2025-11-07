# 🐺 WRIKICAFE+ — Smart Campus Café Ordering Platform

[![DOI](https://zenodo.org/badge/1080009756.svg)](https://doi.org/10.5281/zenodo.17538134)
[![Build](https://github.com/rishitharamesh/wolfcafeplus/actions/workflows/build.yml/badge.svg)]
[![Lint](https://github.com/rishitharamesh/wolfcafeplus/actions/workflows/lint.yml/badge.svg)]
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![codecov](https://codecov.io/gh/rishitharamesh/wolfcafeplus/branch/main/graph/badge.svg)](https://codecov.io/gh/rishitharamesh/wolfcafeplus)
![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.0-646cff?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-0.28.0-6DA83F?logo=vitest&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-43853D?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)
![formatter](https://img.shields.io/badge/formatter-Prettier-ff69b4)
> A smarter, personalized, and social campus food-ordering system for NC State University. || Funfact: WrikiCafe+ is derived from the Sanskrit word vṛkī (वृकी) meaning she-wolf ||

## 🎯 Mission Statement

Campus cafés often struggle with **long queues, manual order tracking, and miscommunication** between customers and staff.  
**wrikicafe** addresses this challenge by building a **real-time, smart food ordering system** that enhances both the user experience and operational efficiency.

- **Why:** Students and faculty waste valuable time waiting in line or wondering when their order will be ready.  
- **What:** A role-based, web-based ordering system with instant order notifications, personalized menu recommendations, and admin analytics.  
- **So What:** This system **reduces waiting time, streamlines kitchen operations, and builds a connected campus café experience**.  
  Every order is tracked from “pending” to “ready,” and customers receive instant notifications when their drink or meal is ready for pickup — saving time and boosting satisfaction.

## 📽️ Demo Video (2 min)
🎥 **[Watch the Version 1 Demo](https://drive.google.com/file/d/1rF2Nw3hMvygaE4dNnrE-KzBt6mMmS3zz/view?usp=drive_link)**  
_Showing new functionality: role-based permissions, order tracking, and real-time pickup notifications._


## 🚀 Project Overview
**WrikiCafe+** is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed to modernize and simplify campus café operations. Our mission is to make campus dining **smarter, faster, and more personalized** — for students, staff, and administrators alike.

| **Role** | **Capabilities** |
|-----------|------------------|
| 🧑‍💼 **Admin** | • Manage menu inventory<br>• Track all orders<br>• Set tax rates<br>• Access live analytics dashboard<br>• Update order statuses in real time<br>• Oversee pickup workflow |
| 🧑‍🎓 **Customer** | • Browse menu<br>• Add items to cart<br>• Checkout securely<br>• Receive email alerts when orders are ready |


## 🧩 Key Features (v1)
- ✅ Role-based access for Admins and Users  
- ✅ Menu management (CRUD)  
- ✅ Customer orders with tip and tax computation  
- ✅ Real-time order fulfillment and pickup notifications  
- ✅ Cloud image uploads via Cloudinary  
- ✅ Secure JWT authentication + Express middleware  


## 📈 Next Milestones (v2)
- [ ] AI-powered “Surprise Me” recommendations  
- [ ] Group shared cart and budget/time optimizers  
- [ ] Accessibility audit and performance enhancements  


## ⚙️ Installation & Setup
See [INSTALL.md](INSTALL.md) for full setup details.  
In short:

```bash
git clone https://github.com/RishithaRamesh/WrikiCafeplus.git
cd WrikiCafeplus
npm install && cd frontend && npm install
npm run dev
```

> Default backend runs on port 5000, frontend on 3000.  
> Requires MongoDB URI in `.env`.


## 👥 Team 16
| Name | GitHub |
|------|--------|
| **Dhruva Kamble** | [@DhruvaKamble](https://github.com/Dhruva0101) |
| **Rishitha Ramesh** |  [@RishithaRamesh](https://github.com/RishithaRamesh) |
| **Rujuta Budke** |  [@RujutaBudke](https://github.com/rujuta13) |


## 📜 Policies & Standards
| File | Description |
|------|--------------|
| [.gitignore](.gitignore) | Lists files excluded from version control |
| [LICENSE.md](LICENSE.md) | Usage rights and open-source license |
| [CODE-OF-CONDUCT.md](CODE-OF-CONDUCT.md) | Expected behavior in collaboration |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guidelines for coding, PRs, testing, and branching |
| [INSTALL.md](INSTALL.md) | Detailed installation and environment setup instructions |


## 🧰 Tech Stack
**Frontend:** React 19 · Vite · Axios · TailwindCSS 
**Backend:** Node · Express · MongoDB (Mongoose) · socketio
**Auth:** JWT · bcrypt  
**Storage:** Cloudinary · MongoDB Atlas  
**Testing:** Jest · Supertest · React Testing Library  

## 💡 Why This Stack?

wrikicafe is built with the **MERN stack (MongoDB, Express.js, React, Node.js)** to demonstrate a complete, modern web application architecture:
- **MongoDB:** Flexible data modeling for users, menu items, and orders.  
- **Express + Node.js:** Efficient REST API with authentication and real-time Socket.IO communication.  
- **React:** Interactive, responsive frontend built with Vite and Tailwind CSS.  


## 🧾 License
This project is released under the terms described in [LICENSE.md](LICENSE.md).

© 2025 WrikiCafe+ Team 16 · North Carolina State University
