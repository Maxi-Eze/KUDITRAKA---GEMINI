# Kuditraker Backend API Documentation

Base URL: `http://localhost:5000/api`

> [!IMPORTANT]
> All endpoints except `/auth/register` and `/auth/login` require an `Authorization` header containing the JWT token.
> Format: `Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication (`/auth`)

### Register a new user
- **Endpoint:** `POST /auth/register`
- **Auth Required:** No
- **Payload:**
  ```json
  {
    "name": "John Doe",          // required, min 2 chars
    "email": "john@example.com", // required, valid email
    "password": "password123"    // required, min 6 chars
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "userId": "uuid-string"
  }
  ```

### Login
- **Endpoint:** `POST /auth/login`
- **Auth Required:** No
- **Payload:**
  ```json
  {
    "email": "john@example.com", // required, valid email
    "password": "password123"    // required
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI...",
      "user": {
        "id": "uuid-string",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
  ```

---

## 2. Artificial Intelligence (`/ai`)

### Parse Transaction Text (One-shot)
- **Endpoint:** `POST /ai/parse`
- **Auth Required:** Yes
- **Description:** Sends a raw string to the AI to extract financial details. Can optionally save it directly to the database.
- **Payload:**
  ```json
  {
    "text": "I sold 3 bags of rice to Emeka for 50000 naira transfer", // required
    "save": true // optional, default false. If true, saves the transaction to the DB automatically
  }
  ```
- **Response (200/201):**
  ```json
  {
    "message": "Transaction parsed and saved successfully",
    "data": {
      // Extracted fields
      "type": "income",
      "amount": 50000,
      "item": "3 bags of rice",
      "customer": "Emeka",
      "payment_method": "transfer",
      
      // If save=true, it will also return the database record
      "id": "uuid-string",
      "user_id": "uuid-string",
      "customer_id": "uuid-string",
      "date": "2026-05-07T..."
    }
  }
  ```

### Conversational AI Chat (With Memory)
- **Endpoint:** `POST /ai/chat`
- **Auth Required:** Yes
- **Description:** Chat with the AI. The AI has context of the user's past messages and real-time access to today's and this month's financial totals.
- **Payload:**
  ```json
  {
    "message": "How much have I made today?" // required
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Chat response generated",
    "data": {
      "reply": "You have made ₦50,000 today from 1 transaction.", // The AI's response text
      "financial_snapshot": {
        // The live data injected into the AI's prompt for this turn
        "today_income": 50000,
        "today_expenses": 0,
        "today_net": 50000,
        "this_month_income": 150000,
        "this_month_expenses": 20000,
        "this_month_net": 130000,
        "recent_transactions": [ ... ]
      }
    }
  }
  ```

### Get Chat History
- **Endpoint:** `GET /ai/chat/history`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "message": "Chat history retrieved",
    "data": [
      {
        "role": "user",
        "content": "How much have I made today?",
        "created_at": "2026-05-07T..."
      },
      {
        "role": "model",
        "content": "You have made ₦50,000 today from 1 transaction.",
        "created_at": "2026-05-07T..."
      }
    ]
  }
  ```

### Clear Chat History
- **Endpoint:** `DELETE /ai/chat/history`
- **Auth Required:** Yes
- **Description:** Wipes the conversation memory so the AI starts fresh.
- **Response (200):**
  ```json
  {
    "message": "Chat history cleared successfully"
  }
  ```

---

## 3. Transactions (`/transactions`)

### Get All Transactions
- **Endpoint:** `GET /transactions`
- **Auth Required:** Yes
- **Query Parameters (all optional):**
  - `?type=income` (or `expense`)
  - `?customer_id=uuid-string`
  - `?startDate=2026-05-01`
  - `?endDate=2026-05-31`
- **Response (200):**
  ```json
  {
    "message": "Transactions retrieved",
    "data": [
      {
        "id": "uuid-string",
        "user_id": "uuid-string",
        "customer_id": "uuid-string",
        "type": "income",
        "amount": 5000,
        "item": "Bread",
        "payment_method": "cash",
        "date": "2026-05-07T..."
      }
    ]
  }
  ```

### Create a Transaction
- **Endpoint:** `POST /transactions`
- **Auth Required:** Yes
- **Payload:**
  ```json
  {
    "type": "income",              // required: 'income' | 'expense'
    "amount": 5000,                // required: positive number
    "item": "Bread",               // required: string
    "customer_id": "uuid-string",  // optional: UUID of an existing customer
    "payment_method": "cash",      // optional: string
    "date": "2026-05-07T12:00:00Z" // optional: ISO date string, defaults to now
  }
  ```

### Get Transaction by ID
- **Endpoint:** `GET /transactions/:id`
- **Auth Required:** Yes

### Update a Transaction
- **Endpoint:** `PUT /transactions/:id`
- **Auth Required:** Yes
- **Payload:** (Same as Create, but all fields are optional)
  ```json
  {
    "amount": 6000
  }
  ```

### Delete a Transaction
- **Endpoint:** `DELETE /transactions/:id`
- **Auth Required:** Yes

---

## 4. Customers (`/customers`)

### Get All Customers
- **Endpoint:** `GET /customers`
- **Auth Required:** Yes
- **Response (200):**
  ```json
  {
    "message": "Customers retrieved",
    "data": [
      {
        "id": "uuid-string",
        "name": "Emeka",
        "phone": "08012345678",
        "email": "emeka@example.com"
      }
    ]
  }
  ```

### Create a Customer
- **Endpoint:** `POST /customers`
- **Auth Required:** Yes
- **Payload:**
  ```json
  {
    "name": "Emeka",               // required
    "phone": "08012345678",        // optional
    "email": "emeka@example.com"   // optional
  }
  ```

### Get Customer by ID
- **Endpoint:** `GET /customers/:id`
- **Auth Required:** Yes

### Update a Customer
- **Endpoint:** `PUT /customers/:id`
- **Auth Required:** Yes
- **Payload:** (Same as Create, but all fields are optional)
  ```json
  {
    "phone": "09087654321"
  }
  ```

### Delete a Customer
- **Endpoint:** `DELETE /customers/:id`
- **Auth Required:** Yes

---

## 5. Reports (`/reports`)

### Get Daily Summary
- **Endpoint:** `GET /reports/daily`
- **Auth Required:** Yes
- **Query Parameters:**
  - `?date=YYYY-MM-DD` (required, e.g., `2026-05-07`)
- **Response (200):**
  ```json
  {
    "message": "Daily summary retrieved",
    "data": {
      "date": "2026-05-07",
      "income": 50000,
      "expense": 10000,
      "balance": 40000
    }
  }
  ```

### Get Monthly Analytics
- **Endpoint:** `GET /reports/analytics`
- **Auth Required:** Yes
- **Description:** Returns an aggregation of income and expenses grouped by month.
- **Response (200):**
  ```json
  {
    "message": "Analytics retrieved",
    "data": [
      {
        "month": "2026-05-01T00:00:00.000Z",
        "type": "income",
        "total": "150000.00"
      },
      {
        "month": "2026-05-01T00:00:00.000Z",
        "type": "expense",
        "total": "20000.00"
      }
    ]
  }
  ```
