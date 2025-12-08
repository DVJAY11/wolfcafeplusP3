````md
# ☕ WrikiCafe API Documentation

Base URL (local dev):

- `http://localhost:5000/api`

> All routes below are assumed to be prefixed with `/api`.

---

## 🔗 Index

- 🧱 [Base & Health](#-base--health)
- 👤 [Auth Routes](#-auth-routes)
- 🍴 [Menu Routes](#-menu-routes)
- 🧂 [Ingredient Routes (Build Your Own)](#-ingredient-routes-build-your-own)
- 🛠️ [Custom Item Routes (Build Your Own)](#-custom-item-routes-build-your-own)
- 🛒 [Cart Routes](#-cart-routes)
- 📦 [Order Routes](#-order-routes)
- 👥 [Group Order Routes (Social Ordering)](#-group-order-routes-social-ordering)
- 🤖 [Recommendation Routes](#-recommendation-routes)
- 🧮 [Admin & Analytics Routes](#-admin--analytics-routes)

---

## 🧱 Base & Health

| Method | Endpoint    | Description              | Auth | Role |
|--------|-------------|--------------------------|------|------|
| `GET`  | `/`         | Base API check message.  | ❌ No | —    |
| `GET`  | `/admin/ping` | Verifies admin routes are live. | ❌ No | — |

> Mounted via the main router (`index.js`).



## 👤 Auth Routes

**Prefix:** `/api/auth` :contentReference[oaicite:1]{index=1}  

| Method | Endpoint        | Description                            | Auth | Role |
|--------|-----------------|----------------------------------------|------|------|
| `POST` | `/register`     | Register a new user account.           | ❌ No | —    |
| `POST` | `/login`        | Login and receive a JWT token.         | ❌ No | —    |
| `GET`  | `/me`           | Get the currently logged-in user.      | ✅ Yes | Any  |

**Request – `POST /api/auth/register`**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
````

**Response (example)**

```json
{
  "message": "User registered successfully",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "_id": "64...",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "customer"
  }
}
```

**Request – `POST /api/auth/login`**

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Returns a similar payload with `token` and `user`.

> JWT is sent in `Authorization: Bearer <token>` for all authenticated routes.

---

## 🍴 Menu Routes

**Prefix:** `/api/menu`

The `MenuItem` model includes fields like: `name`, `price`, `category`, `available`, `prepTime`, etc.

| Method   | Endpoint                | Description                                                                          | Auth  | Role  |
| -------- | ----------------------- | ------------------------------------------------------------------------------------ | ----- | ----- |
| `GET`    | `/api/menu`             | Fetch all **available** menu items. Use `?all=true` to include archived/unavailable. | ❌ No  | —     |
| `POST`   | `/api/menu`             | Create a new menu item.                                                              | ✅ Yes | Admin |
| `PUT`    | `/api/menu/:id`         | Update an existing menu item.                                                        | ✅ Yes | Admin |
| `DELETE` | `/api/menu/:id`         | Hard delete a menu item.                                                             | ✅ Yes | Admin |
| `PATCH`  | `/api/menu/:id/archive` | Soft-delete (set `available=false` and remove from carts).                           | ✅ Yes | Admin |
| `PATCH`  | `/api/menu/:id/restore` | Restore an archived item (`available=true`).                                         | ✅ Yes | Admin |

**Query params for `GET /api/menu`:**

* `all=true` → returns all items regardless of `available` flag.

---

## 🧂 Ingredient Routes (Build Your Own)

**Prefix:** `/api/ingredients`

The `Ingredient` model holds building blocks for custom items:
`name`, `price`, `category` (`base`/`topping`/`flavoring`), `allergens[]`, `dietaryTags[]`, `available`.

| Method   | Endpoint                    | Description                                                               | Auth  | Role  |
| -------- | --------------------------- | ------------------------------------------------------------------------- | ----- | ----- |
| `GET`    | `/api/ingredients`          | Get all available ingredients.                                            | ❌ No  | —     |
| `POST`   | `/api/ingredients`          | Create a new ingredient.                                                  | ✅ Yes | Admin |
| `PUT`    | `/api/ingredients/:id`      | Update an ingredient.                                                     | ✅ Yes | Admin |
| `DELETE` | `/api/ingredients/:id`      | Delete an ingredient.                                                     | ✅ Yes | Admin |
| `POST`   | `/api/ingredients/validate` | Validate a set of ingredients + dietary restrictions (server-side check). | ✅ Yes | Any   |

**`POST /api/ingredients/validate` – example body**

```json
{
  "ingredients": ["64ingredientId1", "64ingredientId2"],
  "dietaryRestrictions": ["vegan", "nut_free"]
}
```

Returns compatibility info, warnings, and computed price.

---

## 🛠️ Custom Item Routes (Build Your Own)

**Prefix:** `/api/custom-items`

These routes manage **saved custom builds** for a logged-in user. All require authentication.

| Method   | Endpoint                | Description                                      | Auth  | Role |
| -------- | ----------------------- | ------------------------------------------------ | ----- | ---- |
| `POST`   | `/api/custom-items`     | Save a new custom item for the current user.     | ✅ Yes | Any  |
| `GET`    | `/api/custom-items`     | Get all saved custom items for the current user. | ✅ Yes | Any  |
| `GET`    | `/api/custom-items/:id` | Get one custom item by ID (must belong to user). | ✅ Yes | Any  |
| `PUT`    | `/api/custom-items/:id` | Update fields of a saved custom item.            | ✅ Yes | Any  |
| `DELETE` | `/api/custom-items/:id` | Delete a saved custom item.                      | ✅ Yes | Any  |

**Example – `POST /api/custom-items`**

```json
{
  "name": "My Oat Latte",
  "baseItem": "64menuItemIdOrNull",
  "ingredients": ["64milkId", "64syrupId"],
  "dietaryRestrictions": ["vegan"],
  "totalPrice": 220
}
```

Response includes populated `baseItem` and `ingredients`.

---

## 🛒 Cart Routes

**Prefix:** `/api/cart`

Cart is always scoped to the **logged-in user**.

| Method   | Endpoint                | Description                                                                                | Auth  | Role     |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------ | ----- | -------- |
| `GET`    | `/api/cart`             | Get the user's current cart with populated `items.menuItem`.                               | ✅ Yes | Customer |
| `POST`   | `/api/cart`             | Add/update items in cart (supports batching, customizations, meal groups).                 | ✅ Yes | Customer |
| `DELETE` | `/api/cart/:menuItemId` | Remove a specific item **by its cart item `_id`** (param is called `menuItemId` in route). | ✅ Yes | Customer |

**Important behaviour:**

* Standard items with **no customizations** stack by quantity.
* Items with **customizations** or belonging to a **mealGroupId** are added as separate lines (no stacking). 

**Example – `POST /api/cart` (single item)**

```json
{
  "items": [
    {
      "menuItem": "64menuItemId",
      "quantity": 2,
      "customizations": [],
      "mealGroupId": null
    }
  ]
}
```

---

## 📦 Order Routes

**Prefix:** `/api/orders`

| Method  | Endpoint              | Description                                                           | Auth  | Role     |
| ------- | --------------------- | --------------------------------------------------------------------- | ----- | -------- |
| `POST`  | `/api/orders`         | Create a new order from the current user's cart.                      | ✅ Yes | Customer |
| `GET`   | `/api/orders`         | Get **all orders** (optionally filter by status, etc.).               | ✅ Yes | Admin    |
| `GET`   | `/api/orders/history` | Get **order history** for the logged-in user (most recent first).     | ✅ Yes | Customer |
| `PATCH` | `/api/orders/:id`     | Update order status (`pending`, `in_progress`, `ready`, `completed`). | ✅ Yes | Admin    |

**Order creation response** includes `items`, `subtotal`, `tax`, `tip`, `total`, `status`, etc.

---

## 👥 Group Order Routes (Social Ordering)

**Prefix:** `/api/group-orders`

These routes power the **Social Group Ordering** feature (Feature 3).

`GroupOrder` schema includes: `creator`, `participants[]`, `status` (`open` / `completed`), `shareCode`, `splitType`, `subtotal`, `tax`, `tip`, `total`, `expiresAt`.

| Method   | Endpoint                              | Description                                                                                        | Auth  | Role         |
| -------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- | ----- | ------------ |
| `GET`    | `/api/group-orders/mine`              | Get all group orders where the current user is a participant or creator.                           | ✅ Yes | Any          |
| `POST`   | `/api/group-orders`                   | Create a new group order. Generates a unique `shareCode`.                                          | ✅ Yes | Any          |
| `GET`    | `/api/group-orders/:shareCode`        | Get group order details using a `shareCode`.                                                       | ✅ Yes | Any          |
| `POST`   | `/api/group-orders/:shareCode/join`   | Join a group order via `shareCode`.                                                                | ✅ Yes | Any          |
| `POST`   | `/api/group-orders/:id/items`         | Add an item to the current user's bucket within a group order (by `_id`).                          | ✅ Yes | Any          |
| `DELETE` | `/api/group-orders/:id/items/:itemId` | Remove one item (by its subdocument `_id`) from current user’s bucket.                             | ✅ Yes | Any          |
| `DELETE` | `/api/group-orders/:id/leave`         | Leave a group order (removes the user from `participants`).                                        | ✅ Yes | Any          |
| `POST`   | `/api/group-orders/:id/finalize`      | Creator finalizes; creates individual `Order` docs for participants and completes the group order. | ✅ Yes | Creator only |

**Key rules:**

* All group-order routes require a valid JWT (`verifyToken`). 
* `createGroupOrder` initializes `status="open"` and sets a 2-hour `expiresAt`.
* `addItemToGroupOrder` validates `menuItemId`, ensures `status === "open"` and not expired. 
* `finalizeGroupOrder` (creator only) recalculates totals, then creates one `Order` per participant with proportional tax/tip. 

**Example – `POST /api/group-orders`**

```json
{
  "splitType": "itemized",
  "tax": 20,
  "tip": 30
}
```

Response includes:

```json
{
  "message": "Group order created",
  "groupOrder": {
    "_id": "64...",
    "creator": "64userId",
    "shareCode": "AB12CD",
    "status": "open",
    "splitType": "itemized",
    "expiresAt": "2025-12-09T..."
  }
}
```

---

## 🤖 Recommendation Routes

**Prefix:** `/api/recommend`

These power **Smart Order (Feature 1)** and advanced “For You” recommendations.

| Method | Endpoint                               | Description                                                 | Auth  | Role |
| ------ | -------------------------------------- | ----------------------------------------------------------- | ----- | ---- |
| `GET`  | `/api/recommend/smart-suggestions`     | Budget + time-based smart suggestions (no auth required).   | ❌ No  | —    |
| `GET`  | `/api/recommend/personalized`          | Personalized ML-powered recommendations for logged-in user. | ✅ Yes | Any  |
| `GET`  | `/api/recommend/similar-items/:itemId` | Get items similar to a given `itemId`.                      | ❌ No  | —    |
| `POST` | `/api/recommend/update-preferences`    | Manually trigger rebuilding the user’s preference profile.  | ✅ Yes | Any  |

### `GET /api/recommend/smart-suggestions`

**Query params:**

* `budget` (required, number) – max price.
* `timeAvailable` (required, number, minutes) – max `prepTime`.

Returns items where `price ≤ budget` and `prepTime ≤ timeAvailable`, sorted by popularity with reason tags like `"Great Value"`, `"Under Budget"`, `"Quick Prep"`, `"Ready in Time"`.

### `GET /api/recommend/personalized`

**Query params:**

* `budget` (required, number)
* `timeAvailable` (required, number, minutes)
* `limit` (optional, default `10`)

Uses hybrid ML (`getHybridRecommendations`) based on **user history + menu metadata**.

### `GET /api/recommend/similar-items/:itemId`

**Query params:**

* `limit` (optional, default `5`)

Returns a list of items similar to the given `itemId`.

### `POST /api/recommend/update-preferences`

Rebuilds the logged-in user’s profile using `buildUserProfile` and returns confirmation + profile snapshot.

---

## 🧮 Admin & Analytics Routes

**Prefix:** `/api/admin`

These are **admin-only** analytics routes, intended for dashboards / charts.

| Method | Endpoint                          | Description                                                        | Auth  | Role  |
| ------ | --------------------------------- | ------------------------------------------------------------------ | ----- | ----- |
| `GET`  | `/api/admin/ping`                 | Health-check for admin routes.                                     | ❌ No  | —     |
| `GET`  | `/api/admin/stats`                | High-level platform stats (users, orders, revenue, etc.).          | ✅ Yes | Admin |
| `GET`  | `/api/admin/stats/items-sold`     | Best-selling items with quantities + revenue per item.             | ✅ Yes | Admin |
| `GET`  | `/api/admin/stats/time-series`    | Daily time series (orders, revenue, items sold) over a date range. | ✅ Yes | Admin |
| `GET`  | `/api/admin/stats/product-trends` | Product-wise trends over time (top N products).                    | ✅ Yes | Admin |

### `GET /api/admin/stats/items-sold`

* Aggregates all **non-pending orders**.
* Returns: totals + per-item breakdown:

```json
{
  "totalOrders": 120,
  "totalItemsSold": 450,
  "totalRevenue": 82000,
  "items": [
    {
      "menuItemId": "64...",
      "name": "Iced Latte",
      "soldQuantity": 140,
      "revenue": 35000
    }
  ]
}
```

### `GET /api/admin/stats/time-series`

**Query params:**

* `days` (optional, default `30`)

Returns an array of day-level stats (`date`, `orders`, `revenue`, `itemsSold`) with missing dates filled as zeros – ideal for line charts.

### `GET /api/admin/stats/product-trends`

**Query params:**

* `days` (optional, default `30`)
* `top` (optional, default `5`) – number of top products.

Returns, for each top product, a time series of `{ date, quantity }` to build multi-line product trend charts.

---

## ✅ Notes for Frontend & Testing

* All authenticated routes rely on `verifyToken` and expect `Authorization: Bearer <token>`.
* Admin-only routes also use `allowRoles("admin")`.
* Group order + recommendation endpoints are ready to be hit from:

  * `/smart-order` (Smart Order page)
  * `/build-your-own` (custom items with ingredients)
  * `/group-order` and `/group-order/:shareCode`
  * `/admin/insights` for charts (items-sold, time-series, product-trends).


That’s the complete, consolidated API doc for all four features + your new endpoints. You can just paste this into `API_DOCUMENTATION.md` in your repo.
