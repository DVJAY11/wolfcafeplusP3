☕ WrikiCafe API Documentation

Base URL (local dev):

http://localhost:5000/api

All routes below are assumed to be prefixed with /api unless stated otherwise.

🔗 Index

🧱 Base & Health

👤 Auth Routes

🍴 Menu Routes

🧂 Ingredient Routes (Build Your Own)

🛠️ Custom Item Routes (Build Your Own)

🛒 Cart Routes

📦 Order Routes

👥 Group Order Routes (Social Ordering)

🤖 Recommendation Routes

🧮 Admin & Analytics Routes

🧱 Base & Health

Mounted in backend/api/routes/index.js

Method	Endpoint	Description	Auth	Role
GET	/	Base API check message.	❌ No	—
GET	/admin/ping	Verifies admin routes are live.	❌ No	—
👤 Auth Routes

Prefix: /api/auth

Method	Endpoint	Description	Auth	Role
POST	/register	Register a new user account.	❌ No	—
POST	/login	Login and receive a JWT token.	❌ No	—
GET	/me	Get the currently logged-in user.	✅ Yes	Any
POST /api/auth/register

Request

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}


### `POST /api/auth/login`

**Request**

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Returns the same payload shape as `/register` (`token` + `user`).

> For all authenticated routes, send JWT as:
> `Authorization: Bearer <token>`

---

## 🍴 Menu Routes

**Prefix:** `/api/menu`
Model: `MenuItem` (`name`, `price`, `category`, `available`, `prepTime`, etc.)

| Method   | Endpoint       | Description                                                                   | Auth  | Role  |
| -------- | -------------- | ----------------------------------------------------------------------------- | ----- | ----- |
| `GET`    | `/`            | Fetch all **available** menu items. Use `?all=true` to include archived ones. | ❌ No  | —     |
| `POST`   | `/`            | Create a new menu item.                                                       | ✅ Yes | Admin |
| `PUT`    | `/:id`         | Update an existing menu item.                                                 | ✅ Yes | Admin |
| `DELETE` | `/:id`         | Hard delete a menu item.                                                      | ✅ Yes | Admin |
| `PATCH`  | `/:id/archive` | Soft-delete (set `available=false`, remove from carts).                       | ✅ Yes | Admin |
| `PATCH`  | `/:id/restore` | Restore an archived item (`available=true`).                                  | ✅ Yes | Admin |

**Query params for `GET /api/menu`**

* `all=true` – include unavailable / archived items.

---

## 🧂 Ingredient Routes (Build Your Own)

**Prefix:** `/api/ingredients`
Model: `Ingredient` (`name`, `price`, `category` = `base` / `topping` / `flavoring`, `allergens[]`, `dietaryTags[]`, `available`).

| Method   | Endpoint    | Description                                                                | Auth  | Role  |
| -------- | ----------- | -------------------------------------------------------------------------- | ----- | ----- |
| `GET`    | `/`         | Get all available ingredients.                                             | ❌ No  | —     |
| `POST`   | `/`         | Create a new ingredient.                                                   | ✅ Yes | Admin |
| `PUT`    | `/:id`      | Update an existing ingredient.                                             | ✅ Yes | Admin |
| `DELETE` | `/:id`      | Delete an ingredient.                                                      | ✅ Yes | Admin |
| `POST`   | `/validate` | Validate a set of ingredient IDs + dietary restrictions, and compute cost. | ✅ Yes | Any   |

### `POST /api/ingredients/validate`

**Request**

```json
{
  "ingredients": ["64ingredientId1", "64ingredientId2"],
  "dietaryRestrictions": ["vegan", "nut_free"]
}
```

**Response (shape)**

```json
{
  "ok": true,
  "totalPrice": 220,
  "warnings": ["Contains soy"],
  "violations": []
}
```

---

## 🛠️ Custom Item Routes (Build Your Own)

**Prefix:** `/api/custom-items`
Model: `CustomItem` (`user`, `name`, `baseItem`, `ingredients[]`, `dietaryRestrictions[]`, `totalPrice`, `savedAt`).

All routes require auth.

| Method   | Endpoint | Description                                      | Auth  | Role |
| -------- | -------- | ------------------------------------------------ | ----- | ---- |
| `POST`   | `/`      | Save a new custom item for the current user.     | ✅ Yes | Any  |
| `GET`    | `/`      | Get all saved custom items for the current user. | ✅ Yes | Any  |
| `GET`    | `/:id`   | Get one custom item by ID (must belong to user). | ✅ Yes | Any  |
| `PUT`    | `/:id`   | Update a saved custom item.                      | ✅ Yes | Any  |
| `DELETE` | `/:id`   | Delete a saved custom item.                      | ✅ Yes | Any  |

### `POST /api/custom-items` (example)

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
Cart is always scoped to the **logged-in user** (one active cart per user).

| Method   | Endpoint   | Description                                                           | Auth  | Role     |
| -------- | ---------- | --------------------------------------------------------------------- | ----- | -------- |
| `GET`    | `/`        | Get the user's current cart (with populated `items.menuItem`).        | ✅ Yes | Customer |
| `POST`   | `/`        | Add or update items in the cart (batch-friendly).                     | ✅ Yes | Customer |
| `DELETE` | `/:itemId` | Remove a cart line item by its **cart item `_id`** (`itemId` in URL). | ✅ Yes | Customer |

### `POST /api/cart` (single item example)

```json
{
  "items": [
    {
      "menuItem": "64menuItemId",
      "quantity": 2,
      "customizations": [],
      "mealGroupId": null,
      "customItem": null
    }
  ]
}
```

**Behaviour notes**

* Plain items (no customizations, no `mealGroupId`, no `customItem`) **stack** by quantity.
* Items with customizations, meal groups, or `customItem` are treated as separate rows.

---

## 📦 Order Routes

**Prefix:** `/api/orders`
Model: `Order` (`user`, `items[]`, `subtotal`, `tax`, `tip`, `total`, `status`, `createdAt` etc.)

| Method  | Endpoint   | Description                                                                 | Auth  | Role     |
| ------- | ---------- | --------------------------------------------------------------------------- | ----- | -------- |
| `POST`  | `/`        | Create a new order from the current user's cart.                            | ✅ Yes | Customer |
| `GET`   | `/`        | Get **all orders** (for admin dashboard; supports filters in controller).   | ✅ Yes | Admin    |
| `GET`   | `/history` | Get **order history** for the logged-in user (reverse chronological).       | ✅ Yes | Customer |
| `PATCH` | `/:id`     | Update order status (`pending`, `in_progress`, `ready`, `completed`, etc.). | ✅ Yes | Admin    |

**Order creation response example**

```json
{
  "message": "Order created",
  "order": {
    "_id": "64orderId",
    "user": "64userId",
    "items": [
      {
        "menuItem": {
          "_id": "64menuItemId",
          "name": "Iced Latte",
          "price": 180
        },
        "quantity": 2,
        "lineTotal": 360
      }
    ],
    "subtotal": 360,
    "tax": 36,
    "tip": 20,
    "total": 416,
    "status": "pending",
    "createdAt": "2025-12-08T..."
  }
}
```

---

## 👥 Group Order Routes (Social Ordering)

**Prefix:** `/api/group-orders`
Model: `GroupOrder` (`creator`, `participants[]`, `status`, `shareCode`, `splitType`, `subtotal`, `tax`, `tip`, `total`, `expiresAt`).

Participants array:

```js
{
  user: ObjectId,          // ref User
  items: [                 // items added by this user
    {
      menuItem: ObjectId,  // ref MenuItem
      quantity: Number,
      price: Number
    }
  ],
  joinedAt: Date
}
```

| Method   | Endpoint             | Description                                                                                | Auth  | Role         |
| -------- | -------------------- | ------------------------------------------------------------------------------------------ | ----- | ------------ |
| `GET`    | `/mine`              | Get all group orders where the current user is creator or participant.                     | ✅ Yes | Any          |
| `POST`   | `/`                  | Create a new group order (generates unique `shareCode`, sets `expiresAt` ~2 hours).        | ✅ Yes | Any          |
| `GET`    | `/:shareCode`        | Get group order details via public `shareCode`.                                            | ✅ Yes | Any          |
| `POST`   | `/:shareCode/join`   | Join a group order via `shareCode`.                                                        | ✅ Yes | Any          |
| `POST`   | `/:id/items`         | Add an item to the **current user's** bucket in the group order (`id` = GroupOrder `_id`). | ✅ Yes | Any          |
| `DELETE` | `/:id/items/:itemId` | Remove one item (subdocument `_id`) from current user's bucket.                            | ✅ Yes | Any          |
| `DELETE` | `/:id/leave`         | Leave a group order (removes user from `participants`, may auto-complete if empty).        | ✅ Yes | Any          |
| `POST`   | `/:id/finalize`      | Creator finalizes group order and auto-creates per-user `Order` documents.                 | ✅ Yes | Creator only |

### `POST /api/group-orders` (create)

**Request**

```json
{
  "splitType": "itemized",  // or "equal"
  "tax": 20,
  "tip": 30
}
```

**Response (example)**

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

### `POST /api/group-orders/:id/items` (add item)

**Request**

```json
{
  "menuItemId": "64menuItemId",
  "quantity": 2
}
```

Adds the item under the current user in `participants[].items`.

### `POST /api/group-orders/:id/finalize` (finalize)

Recomputes `subtotal`, `tax`, `tip`, `total`, marks `status="completed"` and creates individual `Order` docs per participant. Split logic:

* `"equal"` → total divided equally between participants.
* `"itemized"` → each participant pays for their own items + proportional tax & tip.

---

## 🤖 Recommendation Routes

**Prefix:** `/api/recommend`
Backed by `recommendationController.js` + `UserPreferences` model.

| Method | Endpoint                 | Description                                      | Auth  | Role |
| ------ | ------------------------ | ------------------------------------------------ | ----- | ---- |
| `GET`  | `/smart-suggestions`     | Budget + time-based smart suggestions.           | ❌ No  | —    |
| `GET`  | `/personalized`          | Personalized recommendations for logged-in user. | ✅ Yes | Any  |
| `GET`  | `/similar-items/:itemId` | Get items similar to a given `itemId`.           | ❌ No  | —    |
| `POST` | `/update-preferences`    | Rebuild the current user's preference profile.   | ✅ Yes | Any  |

### `GET /api/recommend/smart-suggestions`

**Query params**

* `budget` (number, required) – max price.
* `timeAvailable` (number, required, minutes) – max `prepTime`.

Filters menu items by `price <= budget` and `prepTime <= timeAvailable`, sorts by popularity (order count), and returns top items with reason tags like `"Under Budget"`, `"Quick Prep"`, `"Great Value"`.

### `GET /api/recommend/personalized`

**Query params**

* `budget` (required)
* `timeAvailable` (required)
* `limit` (optional, default `10`)

Uses hybrid scoring (`getHybridRecommendations`) combining:

* User’s order history,
* Menu metadata (category, tags),
* Popularity signals.

### `GET /api/recommend/similar-items/:itemId`

Returns a list of similar items (same category / flavour profile) for “You may also like…” UI.

### `POST /api/recommend/update-preferences`

Rebuilds the logged-in user's `UserPreferences` document and returns a confirmation and profile snapshot.

---

## 🧮 Admin & Analytics Routes

**Prefix:** `/api/admin`
Controllers: `adminController.js`, `adminStatsController.js`
All routes except `/admin/ping` require `role = admin`.

| Method | Endpoint                | Description                                                              | Auth  | Role  |
| ------ | ----------------------- | ------------------------------------------------------------------------ | ----- | ----- |
| `GET`  | `/ping`                 | Simple health-check for admin routes.                                    | ❌ No  | —     |
| `GET`  | `/stats`                | High-level platform stats (users, orders, revenue, etc.).                | ✅ Yes | Admin |
| `GET`  | `/stats/items-sold`     | Best-selling items with quantities and per-item revenue.                 | ✅ Yes | Admin |
| `GET`  | `/stats/time-series`    | Daily time series of orders, revenue, and items sold.                    | ✅ Yes | Admin |
| `GET`  | `/stats/product-trends` | Product-wise trends over time (top N products, suitable for line chart). | ✅ Yes | Admin |

### `GET /api/admin/stats/items-sold` (shape)

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

**Query params**

* `days` (optional, default `30`)

Returns per-day stats:

```json
[
  {
    "date": "2025-12-01",
    "orders": 10,
    "revenue": 6500,
    "itemsSold": 40
  }
]
```

Missing dates are filled with zeros for smooth charts.

### `GET /api/admin/stats/product-trends`

**Query params**

* `days` (optional, default `30`)
* `top` (optional, default `5`)

Returns, for each top product, a per-day quantity series.

---


