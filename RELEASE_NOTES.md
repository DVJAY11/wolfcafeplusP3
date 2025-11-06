# 🧾 WrikiCafe+ Release Notes

This document summarizes all official releases of **WrikiCafe+**, including version numbers, dates, and key changes.

---

## 🚀 v1.1.0 — Feature Expansion & Stability Improvements  
**Release Date:** November 2025  

### ✨ New Features
- Added **real-time order notifications** using Socket.IO.  
- Implemented **AI-based recommendations** for trending drinks via `/api/recommend/popular`.  
- Enhanced **Admin Dashboard** with live order status updates and analytics.  
- Introduced soft-delete and restore endpoints for menu management.  

### 🧹 Improvements
- Optimized MongoDB queries for better performance.  
- Improved input validation and error handling.  
- UI/UX polish on menu and order tracking components.  

### 🐛 Fixes
- Fixed order status update delays on production.  
- Resolved menu caching issues during restore operations.  

---

## ☕ v1.0.0 — Initial Release (MVP)  
**Release Date:** October 2025  

### ✨ Key Features
- Full **MERN-stack** application with user authentication (JWT).  
- Core modules for:
  - **Menu Management** (`/api/menu`)
  - **Cart System** (`/api/cart`)
  - **Order Management** (`/api/orders`)
  - **Admin Controls** (`/api/admin`)
- Added responsive UI using **React + Tailwind CSS**.  
- Database integration via **MongoDB + Mongoose**.  
- Basic **GitHub Actions CI/CD** setup for automated builds and testing.  

---

## 📦 Planned Upcoming Release — v1.2.0  
**Target Date:** December 2025  

### 🎯 Planned Features
- Add **Staff View** for baristas to manage active orders.  
- Integrate **Advanced Personalization AI** (user-based suggestions).  
- Expand admin metrics dashboard with revenue visualization.  
- Improve accessibility and localization support.  

---

### 🔖 Release Summary Table

| Version | Date | Highlights |
|----------|------|-------------|
| **v1.2.0 (Planned)** | Dec 2025 | Staff view, advanced AI, dashboard analytics |
| **v1.1.0** | Nov 2025 | Real-time notifications, recommendations, admin analytics |
| **v1.0.0** | Oct 2025 | Initial release — full MERN app with auth, cart, and orders |

---

> 🩵 **WrikiCafe+** — continually brewing smarter, faster café experiences ☕
