# 🐺 WRIKICAFE+

![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.0-646cff?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-0.28.0-6DA83F?logo=vitest&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-43853D?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)
![formatter](https://img.shields.io/badge/formatter-Prettier-ff69b4)
> A smarter, personalized, and social campus food-ordering system for NC State University. || Funfact: WrikiCafe is derived from the Sanskrit word vṛkī (वृकी) meaning she-wolf ||

---

## 📽️ Demo Video (2 min)
🎥 **[Watch the Version 1 Demo](https://youtu.be/placeholder)**  
_Showing new functionality: role-based permissions, order tracking, and real-time pickup notifications._

---

## 🚀 Project Overview
**WrikiCafe+** is a full-stack MERN application built for CSC 326 that integrates menu management, ordering, and personalized recommendations across **Admin**, **Staff**, and **Customer** roles.

| Role | Capabilities |
|------|---------------|
| **Admin** | Manage staff/customers, set tax rate, view analytics |
| **Staff** | Add menu items, fulfill orders, update inventory |
| **Customer** | Browse menu, add to cart, checkout, receive pickup alerts |

---

## 🧩 Key Features (v1)
- ✅ Role-based access for Admins, Staff, Customers  
- ✅ Menu management (CRUD)  
- ✅ Customer orders with tip and tax computation  
- ✅ Real-time order fulfillment and pickup notifications  
- ✅ Cloud image uploads via Cloudinary  
- ✅ Secure JWT authentication + Express middleware  

---

## 📈 Next Milestones (v2)
- [ ] AI-powered “Surprise Me” recommendations  
- [ ] Group shared cart and budget/time optimizers  
- [ ] Accessibility audit and performance enhancements  

---

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

---

## 👥 Team 16
| Name | GitHub |
|------|--------|
| **Dhruva Kamble** | [@DhruvaKamble](https://github.com/Dhruva0101) |
| **Rishitha Ramesh** |  [@RishithaRamesh](https://github.com/RishithaRamesh) |
| **Rujuta Budke** |  [@RujutaBudke](https://github.com/rujuta13) |

---

## 📜 Policies & Standards
| File | Description |
|------|--------------|
| [.gitignore](.gitignore) | Lists files excluded from version control |
| [LICENSE.md](LICENSE.md) | Usage rights and open-source license |
| [CODE-OF-CONDUCT.md](CODE-OF-CONDUCT.md) | Expected behavior in collaboration |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guidelines for coding, PRs, testing, and branching |
| [INSTALL.md](INSTALL.md) | Detailed installation and environment setup instructions |

---

## 🧰 Tech Stack
**Frontend:** React 19 · Vite · Axios · TailwindCSS  
**Backend:** Node · Express · MongoDB (Mongoose)  
**Auth:** JWT · bcrypt  
**Storage:** Cloudinary · MongoDB Atlas  
**Testing:** Jest · Supertest · React Testing Library  

---

## 🧾 License
This project is released under the terms described in [LICENSE.md](LICENSE.md).

---

© 2025 WrikiCafe+ Team 16 · North Carolina State University
