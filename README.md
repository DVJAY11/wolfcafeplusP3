# 🐺 WolfCafe+

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1234567.svg)](https://doi.org/10.5281/zenodo.1234567)
[![Style Check – ESLint](https://img.shields.io/badge/code%20style-eslint-blue.svg)](https://eslint.org/)
[![Formatter – Prettier](https://img.shields.io/badge/formatter-prettier-ff69b4.svg)](https://prettier.io/)
[![Syntax – Babel](https://img.shields.io/badge/syntax-babel-yellow.svg)](https://babeljs.io/)
> A smarter, personalized, and social campus food-ordering system for NC State University.

---

## 📽️ Demo Video (2 min)
🎥 **[Watch the Version 1 Demo](https://youtu.be/placeholder)**  
_Showing new functionality: role-based permissions, order tracking, and real-time pickup notifications._

---

## 🚀 Project Overview
**WolfCafe+** is a full-stack MERN application built for CSC 326 that integrates menu management, ordering, and personalized recommendations across **Admin**, **Staff**, and **Customer** roles.

| Role | Capabilities |
|------|---------------|
| **Admin** | Manage staff/customers, set tax rate, view analytics |
| **Staff** | Add menu items, fulfill orders, update inventory |
| **Customer** | Browse menu, add to cart, checkout, receive pickup alerts |

> Built with accessibility, security, and scalability in mind — aligned with NC State CSC 326 “Done Criteria.”

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
- [ ] Frontend test automation (React Testing Library)  
- [ ] Code coverage ≥ 80 % with GitHub Actions badge  
- [ ] AI-powered “Surprise Me” recommendations  
- [ ] Group shared cart and budget/time optimizers  
- [ ] Accessibility audit and performance enhancements  

---

## ⚙️ Installation & Setup
See [INSTALL.md](INSTALL.md) for full setup details.  
In short:

```bash
git clone https://github.com/RishithaRamesh/wolfcafeplus.git
cd wolfcafeplus
npm install && cd frontend && npm install
npm run dev
```

> Default backend runs on port 5000, frontend on 3000.  
> Requires MongoDB URI in `.env`.

---

## 👥 Team 16
| Name | Role | GitHub |
|------|------|--------|
| **Rishitha Ramesh** | Full-Stack Developer | [@RishithaRamesh](https://github.com/RishithaRamesh) |
| **Dhruva Kamble** | Backend Engineer | [@dhruvakamble](https://github.com/dhruvakamble) |
| **Rujuta Budke** | Frontend Engineer | [@rujutabudke](https://github.com/rujutabudke) |

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

© 2025 WolfCafe+ Team 16 · North Carolina State University
