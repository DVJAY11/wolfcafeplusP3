# ☕ WrikiCafe+ API Documentation

**Base URL:**  
`https://your-backend.onrender.com/api`

All endpoints return **JSON** responses.  
Protected routes require a valid JWT token in the header:  
`Authorization: Bearer <token>`

---

## 🧩 Index

| Category | Endpoint Group |
|-----------|----------------|
| [Base](#base-controller) | `/api/` |
| [Auth](#auth-routes) | `/api/auth` |
| [Menu](#menu-routes) | `/api/menu` |
| [Cart](#cart-routes) | `/api/cart` |
| [Orders](#order-routes) | `/api/orders` |
| [Admin](#admin-routes) | `/api/admin` |
| [Recommendations](#recommendation-routes) | `/api/recommend` |


## 🟢 Base Controller

| Method | Endpoint | Description | Auth |
|---------|-----------|--------------|------|
| `GET` | `/api/` | Returns backend status message. | ❌ Public |

Response

{ "message": "☕ WrikiCafe+ backend running..." }

## 🔐 Auth Routes

| **Method** | **Endpoint**          | **Description**                        | **Auth** | **Role** |
|-------------|-----------------------|----------------------------------------|-----------|-----------|
| `POST`      | `/api/auth/register`  | Register a new user.                   | ❌ No     | —         |
| `POST`      | `/api/auth/login`     | Login and receive a JWT token.         | ❌ No     | —         |
| `GET`       | `/api/auth/me`        | Retrieve logged-in user’s profile.     | ✅ Yes    | All       |
| `GET`       | `/api/auth/users`     | Get list of all users.                 | ✅ Yes    | Admin     |


## 🛒 Cart Routes

| **Method** | **Endpoint** | **Description** | **Auth** | **Role** |
|-------------|--------------|-----------------|-----------|-----------|
| `GET` | `/api/cart` | Retrieve the logged-in user's cart. | ✅ Yes | Customer |
| `POST` | `/api/cart` | Add a new item to the cart or update quantity if it already exists. | ✅ Yes | Customer |
| `DELETE` | `/api/cart/:menuItemId` | Remove a specific item from the cart. | ✅ Yes | Customer |

## 🍴 Menu Routes

| **Method** | **Endpoint** | **Description** | **Auth** | **Role** |
|-------------|--------------|-----------------|-----------|-----------|
| `GET` | `/api/menu` | Fetch all active menu items. | ❌ No | — |
| `POST` | `/api/menu` | Add a new menu item. | ✅ Yes | Admin |
| `PUT` | `/api/menu/:id` | Update an existing menu item by ID. | ✅ Yes | Admin |
| `DELETE` | `/api/menu/:id` | Permanently delete a menu item. | ✅ Yes | Admin |
| `PATCH` | `/api/menu/:id/archive` | Soft-delete (archive) a menu item. | ✅ Yes | Admin |
| `PATCH` | `/api/menu/:id/restore` | Restore an archived menu item. | ✅ Yes | Admin |

## 📦 Order Routes

| **Method** | **Endpoint** | **Description** | **Auth** | **Role** |
|-------------|--------------|-----------------|-----------|-----------|
| `POST` | `/api/orders` | Create a new order from the user’s cart. | ✅ Yes | Customer |
| `GET` | `/api/orders` | Retrieve all orders in the system. | ✅ Yes | Admin |
| `PATCH` | `/api/orders/:id` | Update an order’s status (`pending`, `in_progress`, `ready`, `completed`). | ✅ Yes | Admin |

## 🧮 Admin Routes

| **Method** | **Endpoint** | **Description** | **Auth** | **Role** |
|-------------|--------------|-----------------|-----------|-----------|
| `GET` | `/api/admin/ping` | Simple test route confirming the admin API is active. | ❌ No | — |
| `GET` | `/api/admin/stats` | Retrieve overall platform statistics such as total users, orders, and top items. | ✅ Yes | Admin |


## 🤖 Recommendation Routes

| **Method** | **Endpoint** | **Description** | **Auth** | **Role** |
|-------------|--------------|-----------------|-----------|-----------|
| `GET` | `/api/recommend/popular` | Retrieve the top 5 most frequently ordered menu items. | ❌ No | — |
