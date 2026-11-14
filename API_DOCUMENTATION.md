# Expense Tracker — Frontend API Documentation

Welcome to the **Expense Tracker API Documentation**. This guide provides complete specifications for every endpoint in the backend, designed specifically to help frontend developers integrate smoothly, understand validation constraints, handle errors gracefully, and configure authentication properly.

---

## Table of Contents
1. [General Information & Architecture](#1-general-information--architecture)
2. [Authentication & Cookie Strategy](#2-authentication--cookie-strategy)
3. [Standard Response & Error Formats](#3-standard-response--error-formats)
4. [Ready-to-Use Frontend Axios Client Setup](#4-ready-to-use-frontend-axios-client-setup)
5. [TypeScript Types & Interfaces](#5-typescript-types--interfaces)
6. [API Endpoints Reference](#6-api-endpoints-reference)
   - [Authentication Endpoints (`/api/auth`)](#auth-endpoints-apiauth)
   - [Category Endpoints (`/api/category`)](#category-endpoints-apicategory)
   - [Transaction Endpoints (`/api/transactions`)](#transaction-endpoints-apitransactions)
   - [Budget Endpoints (`/api/budget`)](#budget-endpoints-apibudget)
   - [Analytics Endpoints (`/api/analytics`)](#analytics-endpoints-apianalytics)
7. [Important Implementation Caveats & Quirks](#7-important-implementation-caveats--quirks)

---

## 1. General Information & Architecture

| Item | Details |
| :--- | :--- |
| **Backend Base URL** | `http://localhost:3000` (or `process.env.VITE_API_URL`) |
| **API Route Prefix** | `/api` |
| **Content Type** | `application/json` |
| **Authentication Type** | **HTTP-Only Cookies** (`accessToken`, `refreshToken`) |
| **Credentials Mode** | **`withCredentials: true`** (Mandatory for all Axios / Fetch requests) |

> [!IMPORTANT]
> **CORS & Credentials:** Because the backend uses HTTP-only cookies, all frontend requests must include `withCredentials: true` (or `credentials: 'include'` for native `fetch`). Furthermore, the backend must configure CORS with `origin: "http://localhost:5173"` and `credentials: true`.

---

## 2. Authentication & Cookie Strategy

The application uses a **dual-cookie JWT authentication architecture**:

1. **`accessToken`**:
   - **Lifespan:** 15 minutes (`maxAge: 15 * 60 * 1000`)
   - **Delivery:** Set automatically by backend in `Set-Cookie` header on `/login` and `/refresh`
   - **Protection:** `httpOnly: true`, `sameSite: "lax"`
   - **Client Storage:** Do **NOT** try to read or store this token in `localStorage`. The browser automatically attaches it to all requests when `withCredentials: true` is enabled.
2. **`refreshToken`**:
   - **Lifespan:** 7 days (`maxAge: 7 * 24 * 60 * 60 * 1000`)
   - **Delivery:** Set automatically by backend in `Set-Cookie` header on `/login`
   - **Protection:** `httpOnly: true`, `sameSite: "lax"`
   - **Usage:** Used exclusively by `POST /api/auth/refresh` to issue a new `accessToken` cookie without forcing the user to log in again.
3. **Email Verification Gate:**
   - Newly registered users have `isEmailVerified: false`.
   - Any protected route will reject unverified accounts with status code `401 Unauthorized` (`"please verify email first"`).
   - Login endpoint will reject unverified accounts with status code `400 Bad Request` (`"please verify your email first"`).
   - An email is dispatched with a token link formatted as:
     `${FRONTEND_URL}/verify-email/${token}`. The frontend page at that route must call `GET /api/auth/verify-email/:token`.

---

## 3. Standard Response & Error Formats

### 3.1 Validation Error Response (`400 Bad Request`)
Triggered when request payload fails `express-validator` schema validation:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid_value",
      "msg": "can only contain income or expense type",
      "path": "type",
      "location": "body"
    }
  ]
}
```

### 3.2 Business Logic & AppError Response (`400`, `401`, `404`, `409`)
Triggered when business checks fail:
```json
{
  "message": "user already exists"
}
```

### 3.3 HTTP Status Codes Reference

| Code | Meaning | Frontend Handling |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | Process data payload |
| `201 Created` | Resource created successfully | Update local state / redirect |
| `400 Bad Request` | Validation failure or invalid input | Render field errors or alert message |
| `401 Unauthorized` | Missing / expired cookie or unverified email | Trigger `/api/auth/refresh` or redirect to `/login` |
| `404 Not Found` | Resource / record not found | Show 404 alert or fallback UI |
| `409 Conflict` | Unique constraint violated (e.g., duplicate budget for category + month) | Notify user of duplicate record |
| `500 Server Error` | Unhandled backend exception | Show general error notification |

---

## 4. Ready-to-Use Frontend Axios Client Setup

Save this file as `src/api/axiosClient.ts` in your React frontend:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Crucial: sends HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor for handling 401 & silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore 401s on login, register, or refresh endpoints to avoid infinite loops
    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/register");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // If refresh fails, user session has expired: redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 5. TypeScript Types & Interfaces

You can copy these types directly into `src/types/api.ts`:

```typescript
// ==========================================
// Generic API Responses
// ==========================================
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
}

export interface ValidationErrorItem {
  type: string;
  value?: unknown;
  msg: string;
  path: string;
  location: "body" | "query" | "params" | "headers" | "cookies";
}

export interface ApiValidationError {
  status: "error";
  message: string;
  errors: ValidationErrorItem[];
}

export interface ApiErrorResponse {
  message: string;
}

// ==========================================
// User & Auth
// ==========================================
export interface User {
  name: string;
  email: string;
  isEmailVerified?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string; // min 6 characters
}

export interface RegisterResponse {
  message: string;
  user: {
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    name: string;
    email: string;
  };
}

// ==========================================
// Category
// ==========================================
export type CategoryTypeEnum = "income" | "expense";
export type CategoryKind = "default" | "custom";

export interface Category {
  _id: string;
  title: string;
  type: CategoryKind;
  categoryType: CategoryTypeEnum;
  createdBy?: string;
  deletedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  title: string;
  categoryType: CategoryTypeEnum;
}

export interface CreateCategoryResponse {
  message: string;
  category: Category;
}

export interface GetCategoriesResponse {
  message: string;
  categories: Category[];
}

export interface DeleteCategoryResponse {
  message: string;
  response: Category;
}

// ==========================================
// Transaction
// ==========================================
export type TransactionTypeEnum = "income" | "expense";

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: TransactionTypeEnum;
  category: string;
  description?: string;
  date: string; // ISO date format
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  amount: number; // positive number > 0
  type: TransactionTypeEnum; // "income" | "expense"
  category: string; // max 50 chars
  description?: string; // optional, max 500 chars
  date: string; // "YYYY-MM-DD"
}

export interface UpdateTransactionRequest {
  id: string; // MongoId of transaction
  amount?: number;
  type?: TransactionTypeEnum;
  category?: string;
  description?: string;
  date?: string; // "YYYY-MM-DD"
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number; // max 100
  type?: TransactionTypeEnum;
  category?: string;
  startDate?: string; // ISO / YYYY-MM-DD
  endDate?: string; // ISO / YYYY-MM-DD
}

export interface GetTransactionsResponse {
  message: string;
  transactions: Transaction[];
  meta: {
    page: number;
    limit: number;
    totalTransactions: number;
    totalPages: number;
  };
}

export interface UpdateTransactionResponse {
  message: string;
  transaction: Transaction;
}

// ==========================================
// Budget
// ==========================================
export type BudgetStatus = "no_budget" | "under_budget" | "fully_used" | "over_budget";

export interface Budget {
  _id: string;
  userId: string;
  category: string;
  amount: number; // min 1000
  month: number; // 1 - 12
  year: number; // 2000 - 2100
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  category: string; // lowercase, must match an existing expense category
  amount: number; // min 1000
  month: number; // 1 - 12
  year: number; // 2000 - 2100
}

export interface UpdateBudgetRequest {
  category?: string;
  amount?: number;
  month?: number;
  year?: number;
}

export interface BudgetOverviewSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  status: BudgetStatus;
}

export interface CategoryBudgetOverviewItem {
  category: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  status: BudgetStatus;
}

export interface BudgetOverviewResponse {
  message: string;
  data: BudgetOverviewSummary;
  categoryWiseOverview: CategoryBudgetOverviewItem[];
}

// ==========================================
// Analytics
// ==========================================
export interface AnalyticsOverall {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage (e.g. 50.5)
}

export interface CategoryBreakdownItem {
  category: string;
  totalExpense: number;
}

export interface MonthlyTrendItem {
  month: string; // format: "YYYY-MM" (Asia/Kolkata timezone)
  totalIncome: number;
  totalExpense: number;
}
```

---

## 6. API Endpoints Reference

---

### Auth Endpoints (`/api/auth`)

#### 1. Register User
Creates a new user profile and sends an email verification link.

- **Route:** `POST /api/auth/register`
- **Auth Required:** No (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `name` | string | **Required** | `trim()`, not empty, string |
| `email` | string | **Required** | `trim()`, not empty, valid email, normalized |
| `password` | string | **Required** | Minimum 6 characters (`min: 6`) |

```json
// Example Request Body
{
  "name": "Alex Mercer",
  "email": "alex@example.com",
  "password": "Password123"
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "user created successfully",
  "user": {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "isEmailVerified": false
  }
}
```

**Error Responses:**
- `400 Bad Request` (Email duplicate):
  ```json
  { "message": "user already exists" }
  ```
- `400 Bad Request` (Validation error):
  ```json
  {
    "status": "error",
    "message": "Validation failed",
    "errors": [
      {
        "type": "field",
        "value": "123",
        "msg": "password must contain 6 characters",
        "path": "password",
        "location": "body"
      }
    ]
  }
  ```

---

#### 2. Verify Email
Verifies user's email via the token received from the confirmation link.

- **Route:** `GET /api/auth/verify-email/:token`
- **Auth Required:** No (Public)

**Path Parameters:**

| Parameter | Type | Required? | Description |
| :--- | :--- | :--- | :--- |
| `token` | string | **Required** | Raw token string received from `${FRONTEND_URL}/verify-email/:token` |

**Success Response (`200 OK`):**
```json
{
  "message": "email verification successfully!"
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  { "message": "Invalid or expired verification token" }
  ```

---

#### 3. Login User
Authenticates user, verifies password, and sets HTTP-only cookies (`accessToken` and `refreshToken`).

- **Route:** `POST /api/auth/login`
- **Auth Required:** No (Public)
- **Request Headers:** `Content-Type: application/json`

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `email` | string | **Required** | `trim()`, not empty, valid email, normalized |
| `password` | string | **Required** | not empty |

```json
// Example Request Body
{
  "email": "alex@example.com",
  "password": "Password123"
}
```

**Cookies Set on Success:**
- `accessToken`: maxAge 15 minutes, `httpOnly: true`, `sameSite: "lax"`
- `refreshToken`: maxAge 7 days, `httpOnly: true`, `sameSite: "lax"`

**Success Response (`200 OK`):**
```json
{
  "message": "user login successfully",
  "user": {
    "name": "Alex Mercer",
    "email": "alex@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` (User not found):
  ```json
  { "message": "invalid credentials" }
  ```
- `400 Bad Request` (Wrong password):
  ```json
  { "message": "incorrect credentials" }
  ```
- `400 Bad Request` (Email not yet verified):
  ```json
  { "message": "please verify your email first" }
  ```

---

#### 4. Refresh Access Token
Issues a new `accessToken` cookie using the valid `refreshToken` cookie.

- **Route:** `POST /api/auth/refresh`
- **Auth Required:** Yes (via `req.cookies.refreshToken`)
- **Request Body:** None

**Cookies Set on Success:**
- `accessToken`: new token with 15 minutes validity

**Success Response (`200 OK`):**
```json
{
  "message": "token generated successfully"
}
```

**Error Responses:**
- `401 Unauthorized`:
  ```json
  { "message": "Unauthorized" }
  ```
- `401 Unauthorized` (Email became unverified):
  ```json
  { "message": "please verify email first" }
  ```
- `404 Not Found`:
  ```json
  { "message": "user not found" }
  ```

---

#### 5. Logout User
Clears the `accessToken` and `refreshToken` cookies from the browser.

- **Route:** `POST /api/auth/logout`
- **Auth Required:** No / Optional
- **Request Body:** None

**Success Response (`200 OK`):**
```json
{
  "message": "logout successfull"
}
```

---

#### 6. Test Auth Status
Sanity check route to verify whether current cookies authenticate properly.

- **Route:** `GET /api/auth/test`
- **Auth Required:** Yes (`accessToken` cookie)

**Success Response (`200 OK`):**
```json
{
  "message": "everything's okay",
  "user": {
    "_id": "6734e320f789...",
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "isEmailVerified": true
  }
}
```

---

### Category Endpoints (`/api/category`)

#### 1. Add Category
Creates a custom category for the logged-in user.

- **Route:** `POST /api/category`
- **Auth Required:** Yes (`accessToken` cookie)
- **Request Headers:** `Content-Type: application/json`

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `title` | string | **Required** | `trim()`, not empty, automatically converted to lowercase |
| `categoryType` | string | **Required** | `trim()`, not empty, lowercase, must be either `"income"` or `"expense"` |

```json
// Example Request Body
{
  "title": "freelancing",
  "categoryType": "income"
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "category created successfully",
  "category": {
    "_id": "6734e56af891011121314151",
    "title": "freelancing",
    "type": "custom",
    "categoryType": "income",
    "createdBy": "6734e320f789...",
    "deletedBy": [],
    "createdAt": "2026-11-13T14:30:00.000Z",
    "updatedAt": "2026-11-13T14:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` (Duplicate category for same user & type):
  ```json
  { "message": "category already exists" }
  ```
- `400 Bad Request` (Validation error):
  ```json
  {
    "status": "error",
    "message": "Validation failed",
    "errors": [
      {
        "type": "field",
        "value": "invalid_type",
        "msg": "can only contain income or expense in the type",
        "path": "categoryType",
        "location": "body"
      }
    ]
  }
  ```
- `401 Unauthorized`:
  ```json
  { "message": "Unauthorized access" }
  ```

---

#### 2. Get Categories
Retrieves all default system categories plus custom categories created by the current user (excluding any default categories that this user has marked as deleted).

- **Route:** `GET /api/category`
- **Auth Required:** Yes (`accessToken` cookie)
- **Query Params:** None

**Success Response (`200 OK`):**
```json
{
  "message": "category fetched",
  "categories": [
    {
      "_id": "6734d001...",
      "title": "salary",
      "type": "default",
      "categoryType": "income",
      "deletedBy": [],
      "createdAt": "2026-11-10T00:00:00.000Z",
      "updatedAt": "2026-11-10T00:00:00.000Z"
    },
    {
      "_id": "6734e56a...",
      "title": "freelancing",
      "type": "custom",
      "categoryType": "income",
      "createdBy": "6734e320...",
      "deletedBy": [],
      "createdAt": "2026-11-13T14:30:00.000Z",
      "updatedAt": "2026-11-13T14:30:00.000Z"
    }
  ]
}
```

---

#### 3. Delete Category
Deletes a category. If it is a custom category created by the user, it is permanently deleted. If it is a default category, the user's ID is appended to `deletedBy` so it is hidden for this user.

- **Route:** `DELETE /api/category/:id`
- **Auth Required:** Yes (`accessToken` cookie)

**Path Parameters:**

| Parameter | Type | Required? | Validation Rules |
| :--- | :--- | :--- | :--- |
| `id` | string | **Required** | Must be a valid 24-character hexadecimal MongoDB ObjectId |

**Success Response (`200 OK`):**
```json
{
  "message": "deleted successfully",
  "response": {
    "_id": "6734e56a...",
    "title": "freelancing",
    "type": "custom",
    "categoryType": "income"
  }
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  { "status": "error", "message": "Validation failed", "errors": [{ "msg": "Invalid budget ID", "path": "id" }] }
  ```
  *(Note: Validator error message is `"Invalid budget ID"` because `idValidator` is shared).*
- `404 Not Found`:
  ```json
  { "message": "category not found" }
  ```

---

### Transaction Endpoints (`/api/transactions`)

#### 1. Add Transaction
Creates a new income or expense transaction for the authenticated user.

- **Route:** `POST /api/transactions`
- **Auth Required:** Yes (`accessToken` cookie)
- **Request Headers:** `Content-Type: application/json`

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `amount` | number | **Required** | Must be a positive number > 0 (`isFloat({ gt: 0 })`) |
| `type` | string | **Required** | `trim()`, must be either `"income"` or `"expense"` |
| `category` | string | **Required** | `trim()`, string, max length 50 chars |
| `description` | string | *Optional* | `trim()`, string, max length 500 chars |
| `date` | string | **Required** | String in `YYYY-MM-DD` format (strict ISO8601 validation) |

```json
// Example Request Body
{
  "amount": 1450.50,
  "type": "expense",
  "category": "groceries",
  "description": "Weekly grocery supplies",
  "date": "2026-11-13"
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "transaction added successfulyy"
}
```

**Error Responses:**
- `400 Bad Request` (Validation error):
  ```json
  {
    "status": "error",
    "message": "Validation failed",
    "errors": [
      {
        "type": "field",
        "value": -20,
        "msg": "amount can only contain positive values",
        "path": "amount",
        "location": "body"
      },
      {
        "type": "field",
        "value": "13-11-2026",
        "msg": "date must be in YYYY-MM-DD format",
        "path": "date",
        "location": "body"
      }
    ]
  }
  ```

---

#### 2. Get Transactions (with Filtering & Pagination)
Fetches transactions for the user, with pagination and optional filtering by type, category, and date range. Sorted in descending order of creation (`createdAt: -1`).

- **Route:** `GET /api/transactions`
- **Auth Required:** Yes (`accessToken` cookie)

**Query Parameters:**

| Parameter | Type | Required? | Default | Constraints & Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | number | *Optional* | `1` | Integer $\ge 1$ |
| `limit` | number | *Optional* | `10` | Integer between `1` and `100` |
| `type` | string | *Optional* | - | Filter by `"income"` or `"expense"` |
| `category` | string | *Optional* | - | Filter by category name (e.g. `"groceries"`) |
| `startDate` | string | *Optional* | - | Filter transactions with date $\ge$ `startDate` (ISO string or `YYYY-MM-DD`) |
| `endDate` | string | *Optional* | - | Filter transactions with date $\le$ `endDate` (ISO string or `YYYY-MM-DD`) |

```http
// Example Request
GET /api/transactions?type=expense&category=groceries&page=1&limit=10&startDate=2026-11-01&endDate=2026-11-30
```

**Success Response (`200 OK`):**
```json
{
  "message": "transaction fetched!",
  "transactions": [
    {
      "_id": "6734ef0189ab...",
      "userId": "6734e320f789...",
      "amount": 1450.5,
      "type": "expense",
      "category": "groceries",
      "description": "Weekly grocery supplies",
      "date": "2026-11-13T00:00:00.000Z",
      "createdAt": "2026-11-13T14:40:00.000Z",
      "updatedAt": "2026-11-13T14:40:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalTransactions": 25,
    "totalPages": 3
  }
}
```

---

#### 3. Delete Transaction
Deletes a specific transaction owned by the user.

> [!WARNING]
> **HTTP Method Alert:** In the backend route definition (`src/routes/transaction.routes.ts`), this endpoint is mounted as **`POST /api/transactions/:id`** (instead of standard `DELETE`). When calling from frontend, make sure to use `POST` (e.g. `api.post(`/transactions/${id}`)`).

- **Route:** `POST /api/transactions/:id`
- **Auth Required:** Yes (`accessToken` cookie)

**Path Parameters:**

| Parameter | Type | Required? | Validation Rules |
| :--- | :--- | :--- | :--- |
| `id` | string | **Required** | Valid 24-char MongoDB ObjectId |

**Success Response (`200 OK`):**
```json
{
  "message": "transaction deleted!"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ObjectId format.
- `404 Not Found`:
  ```json
  { "message": "no such a transaction" }
  ```

---

#### 4. Update Transaction
Updates an existing transaction owned by the authenticated user.

> [!NOTE]
> **ID Location Alert:** The transaction `id` is passed inside the **Request Body**, not in the URL path.

- **Route:** `PATCH /api/transactions/update`
- **Auth Required:** Yes (`accessToken` cookie)
- **Request Headers:** `Content-Type: application/json`

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `id` | string | **Required** | Valid MongoDB ObjectId (`isMongoId()`) |
| `amount` | number | *Optional* | Positive float > 0 |
| `type` | string | *Optional* | `"income"` or `"expense"` |
| `category` | string | *Optional* | String, max 50 chars |
| `description` | string | *Optional* | String, max 500 chars |
| `date` | string | *Optional* | `YYYY-MM-DD` ISO8601 format |

*(Note: At least one field among `amount`, `category`, `date`, `description`, or `type` must be present alongside `id`)*

```json
// Example Request Body
{
  "id": "6734ef0189ab...",
  "amount": 1600.00,
  "description": "Updated grocery bill"
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "item updated successfully",
  "transaction": {
    "_id": "6734ef0189ab...",
    "userId": "6734e320f789...",
    "amount": 1450.5,
    "type": "expense",
    "category": "groceries",
    "description": "Weekly grocery supplies",
    "date": "2026-11-13T00:00:00.000Z",
    "createdAt": "2026-11-13T14:40:00.000Z",
    "updatedAt": "2026-11-13T14:45:00.000Z"
  }
}
```
*(Note: Mongoose `findOneAndUpdate` without `{ new: true }` returns the document state before the update).*

**Error Responses:**
- `400 Bad Request` (Empty update):
  ```json
  { "message": "send atleast one field to update" }
  ```
- `404 Not Found`:
  ```json
  { "message": "no such a transaction" }
  ```

---

### Budget Endpoints (`/api/budget`)

#### 1. Create Budget
Sets a monthly spending budget for a specific category.

- **Route:** `POST /api/budget`
- **Auth Required:** Yes (`accessToken` cookie)
- **Request Headers:** `Content-Type: application/json`

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `category` | string | **Required** | `trim()`, lowercase. **Must match an active `expense` category** accessible to the user |
| `amount` | integer | **Required** | Integer $\ge 1000$ (`"Budget amount must be at least 1000."`) |
| `month` | integer | **Required** | Integer from `1` to `12` |
| `year` | integer | **Required** | Integer from `2000` to `2100` |

```json
// Example Request Body
{
  "category": "groceries",
  "amount": 8000,
  "month": 11,
  "year": 2026
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "budget created successfully",
  "budget": {
    "_id": "6734f112...",
    "userId": "6734e320f789...",
    "category": "groceries",
    "amount": 8000,
    "month": 11,
    "year": 2026,
    "createdAt": "2026-11-13T15:00:00.000Z",
    "updatedAt": "2026-11-13T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found` (Category does not exist or is an `income` category):
  ```json
  { "message": "category does not exists" }
  ```
- `409 Conflict` (A budget already exists for this category, month, and year):
  ```json
  { "message": "budget already exists for this category and month" }
  ```
- `400 Bad Request` (Validation error):
  ```json
  {
    "status": "error",
    "message": "Validation failed",
    "errors": [
      {
        "type": "field",
        "value": 500,
        "msg": "Budget amount must be at least 1000.",
        "path": "amount",
        "location": "body"
      }
    ]
  }
  ```

---

#### 2. Get Budgets
Retrieves budgets set by the current user, optionally filtered by category, month, and year. Sorted by `{ year: -1, month: -1, createdAt: -1 }`.

- **Route:** `GET /api/budget`
- **Auth Required:** Yes (`accessToken` cookie)

**Query Parameters:**

| Parameter | Type | Required? | Constraints & Description |
| :--- | :--- | :--- | :--- |
| `category` | string | *Optional* | Filter by category title |
| `month` | number | *Optional* | Filter by month (`1` - `12`) |
| `year` | number | *Optional* | Filter by year (`2000` - `2100`) |

```http
// Example Request
GET /api/budget?month=11&year=2026
```

**Success Response (`200 OK`):**
```json
{
  "message": "bueget fetched",
  "budget": [
    {
      "_id": "6734f112...",
      "userId": "6734e320f789...",
      "category": "groceries",
      "amount": 8000,
      "month": 11,
      "year": 2026,
      "createdAt": "2026-11-13T15:00:00.000Z",
      "updatedAt": "2026-11-13T15:00:00.000Z"
    }
  ]
}
```

---

#### 3. Update Budget
Updates an existing budget record.

- **Route:** `PATCH /api/budget/:id`
- **Auth Required:** Yes (`accessToken` cookie)
- **Request Headers:** `Content-Type: application/json`

**Path Parameters:**

| Parameter | Type | Required? | Validation Rules |
| :--- | :--- | :--- | :--- |
| `id` | string | **Required** | Valid 24-char MongoDB ObjectId |

**Request Body Schema:**

| Field | Type | Required? | Validation Rules & Constraints |
| :--- | :--- | :--- | :--- |
| `category` | string | *Optional* | `trim()`, not empty, converted to lowercase |
| `amount` | integer | *Optional* | Integer $\ge 1000$ |
| `month` | integer | *Optional* | Integer `1` to `12` |
| `year` | integer | *Optional* | Integer `2000` to `2100` |

*(Note: At least one field must be provided to update)*

```json
// Example Request Body
{
  "amount": 9500
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "budget updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  { "message": "send atleast one field to update" }
  ```
- `404 Not Found`:
  ```json
  { "message": "no such a budget" }
  ```

---

#### 4. Delete Budget
Deletes a specific budget entry.

- **Route:** `DELETE /api/budget/:id`
- **Auth Required:** Yes (`accessToken` cookie)

**Path Parameters:**

| Parameter | Type | Required? | Validation Rules |
| :--- | :--- | :--- | :--- |
| `id` | string | **Required** | Valid 24-char MongoDB ObjectId |

**Success Response (`200 OK`):**
```json
{
  "message": "budget deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`:
  ```json
  { "message": "no such a budget" }
  ```

---

#### 5. Budget Overview
Provides an aggregated financial health overview for a specific month and year. Compares configured budgets against actual expense transactions, calculating overall budget usage and itemized per-category breakdown.

- **Route:** `GET /api/budget/overview`
- **Auth Required:** Yes (`accessToken` cookie)

**Query Parameters:**

| Parameter | Type | Required? | Constraints & Description |
| :--- | :--- | :--- | :--- |
| `month` | integer | **Required** | Integer `1` to `12` |
| `year` | integer | **Required** | Integer `2000` to `2100` |

```http
// Example Request
GET /api/budget/overview?month=11&year=2026
```

**Success Response (`200 OK`):**
```json
{
  "message": "data fetched!",
  "data": {
    "totalBudget": 15000,
    "totalSpent": 10500,
    "remainingBudget": 4500,
    "percentageUsed": 70,
    "status": "under_budget"
  },
  "categoryWiseOverview": [
    {
      "category": "groceries",
      "totalBudget": 8000,
      "totalSpent": 6500,
      "remainingBudget": 1500,
      "percentageUsed": 81.25,
      "status": "under_budget"
    },
    {
      "category": "entertainment",
      "totalBudget": 7000,
      "totalSpent": 4000,
      "remainingBudget": 3000,
      "percentageUsed": 57.14,
      "status": "under_budget"
    }
  ]
}
```

**Status Enum Values & Meaning:**
- `"no_budget"`: No budget configured (`totalBudget === 0`)
- `"under_budget"`: Spending is below the budget (`totalSpent < totalBudget`)
- `"fully_used"`: Spending exactly matches budget (`totalSpent === totalBudget`)
- `"over_budget"`: Spending has exceeded budget limit (`totalSpent > totalBudget`)

**Error Responses:**
- `400 Bad Request` (Missing or invalid query params):
  ```json
  {
    "status": "error",
    "message": "Validation failed",
    "errors": [
      {
        "type": "field",
        "msg": "month is neccesary",
        "path": "month",
        "location": "query"
      }
    ]
  }
  ```

---

### Analytics Endpoints (`/api/analytics`)

#### 1. Overall Analytics (Net Savings & Savings Rate)
Calculates lifetime total income, total expense, net savings, and savings rate percentage across all transactions.

- **Route:** `GET /api/analytics`
- **Auth Required:** Yes (`accessToken` cookie)
- **Query Params:** None

**Success Response (`200 OK`):**
```json
{
  "message": "data fetched",
  "analytics": [
    {
      "totalIncome": 120000,
      "totalExpense": 45000,
      "netSavings": 75000,
      "savingsRate": 62.5
    }
  ]
}
```
*(Note: If the user has no transactions yet, `analytics` will be an empty array `[]`)*

---

#### 2. Category Breakdown
Calculates lifetime expense totals grouped by category, sorted descending by highest expense first.

- **Route:** `GET /api/analytics/category-breakdown`
- **Auth Required:** Yes (`accessToken` cookie)
- **Query Params:** None

**Success Response (`200 OK`):**
```json
{
  "message": "data fetched",
  "result": [
    {
      "category": "groceries",
      "totalExpense": 28000
    },
    {
      "category": "rent",
      "totalExpense": 12000
    },
    {
      "category": "utilities",
      "totalExpense": 5000
    }
  ]
}
```

---

#### 3. Monthly Trend
Provides month-by-month financial history (income vs. expense), grouped chronologically using the `"Asia/Kolkata"` timezone.

- **Route:** `GET /api/analytics/monthly-trend`
- **Auth Required:** Yes (`accessToken` cookie)
- **Query Params:** None

**Success Response (`200 OK`):**
```json
{
  "message": "data fetched!",
  "result": [
    {
      "month": "2026-09",
      "totalIncome": 60000,
      "totalExpense": 22000
    },
    {
      "month": "2026-10",
      "totalIncome": 60000,
      "totalExpense": 23000
    },
    {
      "month": "2026-11",
      "totalIncome": 65000,
      "totalExpense": 20000
    }
  ]
}
```

---

## 7. Important Implementation Caveats & Quirks

Frontend developers should keep the following critical details in mind:

1. **Transaction Delete Route Method:**
   - Notice that transaction deletion uses **`POST /api/transactions/:id`** instead of `DELETE`. In contrast, Category and Budget deletion use standard `DELETE /api/category/:id` and `DELETE /api/budget/:id`.
2. **Transaction Update Payload Structure:**
   - In `PATCH /api/transactions/update`, the transaction `id` is sent in the **request body** (not the URL path).
3. **Date Formats:**
   - Transactions require dates in strict `YYYY-MM-DD` format (e.g. `"2026-11-13"`).
   - Responses from the backend return dates as full ISO strings (e.g. `"2026-11-13T00:00:00.000Z"`).
4. **Budget Amount Lower Limit:**
   - The budget validator enforces a minimum amount of **`1000`** (`isInt({ min: 1000 })`). Passing values below 1000 will result in a 400 validation error.
5. **Budget Category Validation:**
   - When creating a budget, the `category` string must correspond to an active category with `categoryType: "expense"`. Budgets cannot be set for income categories or nonexistent categories.
6. **Authentication & Token Expiry:**
   - Access tokens expire after **15 minutes**. Always use the Axios response interceptor in Section 4 to silently call `/api/auth/refresh` on `401 Unauthorized`.
7. **Email Verification Requirement:**
   - Users cannot access any protected routes until they verify their email by clicking the link sent to their inbox, which routes to `${FRONTEND_URL}/verify-email/:token`.
