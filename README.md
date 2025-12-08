# 🐺 WRIKICAFE+ — Smart Campus Café Ordering Platform

[![DOI](https://zenodo.org/badge/1080009756.svg)](https://doi.org/10.5281/zenodo.17547164)
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

## 📌 Overview

WrikiCafe+ provides:

- A simple, intuitive ordering interface for students  
- A full admin panel for menu, ingredients, and order flow  
- Real-time order notifications  
- Social group ordering  
- Build-your-own custom item flow  
- Order history and insights (extended features)

Originally built for **NCSU**, the system is adaptable for any university café environment.

---

## ✨ Features

### User Features
- Browse/search menu items  
- Personalized build-your-own café items  
- Add to cart & checkout  
- Real-time order-ready alerts  
- Social Group Ordering (create, join, split, finalize)  
- Order history & reorder option  

### Admin Features
- Manage menu items  
- Manage ingredients  
- Track active orders  
- Trigger pickup notifications  
- View café performance (extended)

---

## 🛠️ Tech Stack

### Frontend
- React  
- Vite  
- React Router  
- React Testing Library  
- TailwindCSS  
- Axios  

### Backend
- Node.js  
- Express  
- MongoDB (Mongoose)  
- Cloudinary  
- JWT Authentication  
- Nodemailer  
- Jest + Supertest  

---

## 📽️ Demo Video (2 min)
🎥 **[Watch the Version 1 Demo](https://drive.google.com/file/d/1rF2Nw3hMvygaE4dNnrE-KzBt6mMmS3zz/view?usp=drive_link)**  
_Showing new functionality: role-based permissions, order tracking, and real-time pickup notifications._


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


## 👥 Team 19
| Name | GitHub |
|------|--------|
| **Digvijay Sonvane** | [@DigvijaySonvane](https://github.com/DVJAY11) |
| **Suyesh Jadhav** |  [@SuyeshJadhav](https://github.com/SuyeshJadhav) |
| **Vanaja Agarwal** |  [@VanajaAgarwal](https://github.com/PositivelyBookish) |


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
