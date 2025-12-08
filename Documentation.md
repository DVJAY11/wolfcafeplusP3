# ☕ WrikiCafe+ Documentation

## Quickstart
Follow **INSTALL.md** for setup instructions.

---

## 1. Overview

**WrikiCafe+** is a next-generation MERN-stack (MongoDB, Express, React, Node.js) web application built to modernize the campus café experience.

The platform delivers:

- Smooth and fast **menu browsing**
- **Smart personalization** and recommendations
- **Build-Your-Own** custom food & drink creation
- **Social Group Ordering** (create/join/shared cart/split & finalize)
- Real-time updates via **Socket.IO**
- A full **Admin Dashboard** for managing menu, ingredients, and orders

WrikiCafe+ supports both **students/customers** and **administrators**, ensuring seamless ordering and efficient café operations.

---

## 2. Intended Users

### 🧑‍🎓 Customers (Students & Staff)
Users can:
- Browse the full café menu with images, prices, categories.
- Create **custom items** using multi-step ingredient selection.
- Start or join **group orders** using share codes.
- Add items to cart, customize them, and checkout.
- View active and past orders.
- Reorder previous purchases with one click.
- Receive real-time updates when:
  - Their group order changes.
  - Participants join/leave.
  - Order status updates (Pending → In Progress → Ready → Completed).

---

### 🧑‍💼 Administrators
Admins can:
- Use the dedicated **dashboard**.
- Create, edit, and delete **menu items**.
- Manage ingredients and inventory for **Build Your Own**.
- View all orders in real time.
- Update order status → instantly notify customers.
- Access **analytics & insights** (extended feature):
  - Revenue trends  
  - Popular items  
  - Peak hours  
  - Customer stats  

---

## 3. System Features

### 🌟 Feature 1 — Smart Recommendations (AI-Inspired)
- Suggests menu items that fit:
  - User budget  
  - Time available  
  - Popularity  
- Uses prep-time + price filters.
- Powered by server-side logic + future AI extensions.

---

### 🛠️ Feature 2 — Build Your Own (CYO)
- Full ingredient selection (base + toppings + flavors)
- Dietary filters (vegan, gluten-free, nut-free, dairy-free)
- Real-time price calculation
- Save custom builds
- Add to cart like a normal item

---

### 👥 Feature 3 — Social Group Ordering
- Create a group order with a **unique 6-char share code**
- Join via share code
- Real-time participation updates
- Add/remove items within group session
- Split payment:
  - **Equal split**
  - **Itemized split**
- Creator finalizes → backend generates **individual user orders**
- Built with **MongoDB**, **WebSockets**, and **secure JWT auth**

---

### ✨ Additional Core Features
- 🔥 Real-time notifications via **Socket.IO**
- 🔐 JWT Authentication (Login/Register)
- 🛒 Shopping Cart & Checkout
- 📦 Order History + Reorder
- 🎨 Polished TailwindCSS frontend
- 📤 Cloudinary image uploads
- 📧 Email notifications supported

---

## 4. Architecture Overview

| Layer | Technology Used | Purpose |
|-------|------------------|---------|
| **Frontend** | React, Vite, TailwindCSS | UI, routing, components |
| **State Management** | Context API | Auth, cart, group orders |
| **Backend** | Node.js, Express | REST APIs, authentication, business logic |
| **Database** | MongoDB + Mongoose | Models: User, MenuItem, CustomItem, GroupOrder, Order |
| **Real-time** | Socket.IO | Live group order updates & notifications |
| **Hosting** | Render (or similar) | Deployment for frontend & backend |
| **CI/CD** | GitHub Actions | Automated tests & deployment |
| **Testing** | Jest, Supertest, React Testing Library | Backend + frontend coverage |

---

## 5. Future Enhancements

- 👩‍🍳 **Staff View:** Dedicated dashboard UI for baristas/kitchen with timers.
- 🤖 **Advanced AI Personalization:** Predict orders based on history, weather, class schedule.
- 💬 **Chat-based Ordering:** Conversational food/drink selection.
- 🧾 **Digital Receipts & Rewards:** Loyalty points + wallet.
- 📱 **Mobile App:** React Native companion.

---

## 6. References & Links

- 🌐 **Backend API:** `http://localhost:5000/api`
- 📦 **GitHub Repo:** https://github.com/RishithaRamesh/WolfCafePlus (Original Source)
- 📄 **API Documentation:** See `API_DOCUMENTATION.md`
- 📘 **README:** Includes installation, scripts, and project setup.
- 🎥 **Demo Video:** https://youtu.be/O3_w81HXtyw

---

## 🧑‍🤝‍🧑 Team — Group 19 (Updated)

- **Digvijay Sonvane**  
- **Suyesh Jadhav**  
- **Vanaja Agarwal**

---

> 🩵 *WrikiCafe+ — “Order Smarter. Eat Faster.”*  
> Built with love, caffeine, and teamwork.
