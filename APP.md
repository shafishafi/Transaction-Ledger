# **Transaction Ledger System**

**Document Status:** Approved for Implementation **Target Architecture:** Database-Driven API via Supabase / React Client

## **1\. System Overview**

The Transaction Ledger System is a secure, atomic financial tracking platform. Because the requested technology stack (React, TypeScript, Tailwind, TanStack, Zustand) is client-heavy, this specification implements the **Backend API** directly at the database layer using **Supabase (PostgreSQL)**.

Business logic, atomicity, and immutability will be enforced via PostgreSQL Database Constraints and Remote Procedure Calls (RPCs), which Supabase automatically exposes as RESTful HTTP endpoints. The React frontend will consume these endpoints using TanStack Query.

## **2\. Technical Stack & Role Mapping**

| Technology | Implementation Role |
| :---- | :---- |
| **Supabase (PostgreSQL)** | Core API Server, Database, Identity. Exposes auto-generated REST APIs (PostgREST) and custom RPC endpoints. |
| **TanStack Query** | Server-state management. Handles API fetching, pagination, caching, and cache-invalidation (e.g., refetching balance after a mutation). |
| **TanStack Router** | Client-side routing for seamless navigation between Ledger dashboards and Account views. |
| **Zustand** | Lightweight global client state (e.g., active user session, UI theme, ephemeral modal states). |
| **Tailwind \+ Shadcn UI** | UI component architecture and styling for forms, data tables, and error notifications. |
| **TypeScript** | End-to-end type safety, sharing schema definitions between Supabase queries and React components. |

## **3\. Data Architecture & Integrity Constraints**

To guarantee data consistency without a middle-tier Node.js server, we rely on strict database-level constraints.

### **3.1 accounts Table**

| Column | Type | Constraints / Rules |
| :---- | :---- | :---- |
| id | UUID | Primary Key, Auto-generated uuid\_generate\_v4() |
| name | TEXT | NOT NULL |
| balance | NUMERIC | DEFAULT 0. **Critical Check Constraint:** CHECK (balance \>= 0\) to natively prevent overdrafts. |
| created\_at | TIMESTAMPTZ | DEFAULT now(). Client cannot override. |

### **3.2 transactions Table**

| Column | Type | Constraints / Rules |
| :---- | :---- | :---- |
| id | UUID | Primary Key, Auto-generated |
| account\_id | UUID | Foreign Key references accounts(id) |
| type | TEXT | CHECK (type IN ('credit', 'debit')) |
| amount | NUMERIC | CHECK (amount \> 0\) |
| description | TEXT | Optional |
| reference\_id | TEXT | NOT NULL. |
| created\_at | TIMESTAMPTZ | DEFAULT now() |

**Immutability Rules (Row Level Security):**

* transactions table allows INSERT and SELECT.  
* UPDATE and DELETE operations are strictly **blocked** at the database level.

**Idempotency / Duplicate Prevention:**

* **Unique Constraint:** UNIQUE(account\_id, reference\_id). If the client submits the same transaction twice, the database natively rejects it, leaving the balance unchanged.

## **4\. API Specification (Supabase REST & RPCs)**

### **4.1 Create Account**

* **Method:** POST /rest/v1/accounts (Standard Supabase Insert)  
* **Payload:** { "name": "John Doe" }  
* **Logic:** The client omits balance and created\_at. The database defaults balance to 0\.

### **4.2 Add Transaction (Atomic Operation)**

* **Method:** POST /rest/v1/rpc/process\_transaction  
* **Mechanism:** Custom PostgreSQL Stored Procedure (RPC).  
* **Payload:** { "p\_account\_id": "uuid", "p\_type": "credit\|debit", "p\_amount": 50, "p\_description": "text", "p\_reference\_id": "unique-string" }  
* **Execution Flow (Inside DB Transaction):**  
  1. BEGIN transaction.  
  2. Attempt to INSERT into transactions. (Fails and aborts if reference\_id is duplicate).  
  3. If p\_type is 'credit', UPDATE accounts SET balance \= balance \+ p\_amount.  
  4. If p\_type is 'debit', UPDATE accounts SET balance \= balance \- p\_amount. (Fails and aborts if resulting balance is \< 0 due to table constraint).  
  5. COMMIT. If any step fails, ROLLBACK the entire operation natively.

### **4.3 Get Account Balance**

* **Method:** GET /rest/v1/accounts?id=eq.{id}\&select=id,balance  
* **Client Implementation:** Wrapped in a TanStack Query useQuery hook.

### **4.4 Get Transaction History (with Pagination & Filtering)**

* **Method:** GET /rest/v1/transactions (Standard Supabase Select)  
* **Parameters:**  
  * account\_id=eq.{id}  
  * type=eq.{credit\|debit} (Optional, applied conditionally by TanStack Query)  
  * order=created\_at.desc (Sorting)  
  * limit={pageSize} & offset={page \* pageSize} (Pagination)  
* **Headers:** Prefer: count=exact (Instructs Supabase to return the total record count for pagination math: total records / page size \= total pages).

### **4.5 Bonus: Money Transfer (Atomic)**

* **Method:** POST /rest/v1/rpc/transfer\_funds  
* **Mechanism:** Custom PostgreSQL Stored Procedure.  
* **Payload:** { "source\_account\_id": "uuid", "dest\_account\_id": "uuid", "amount": 30, "reference\_id": "transfer-abc" }  
* **Execution Flow:**  
  1. Deduct amount from source\_account\_id (Will rollback if balance goes below 0).  
  2. Add amount to dest\_account\_id.  
  3. Insert debit record for source.  
  4. Insert credit record for destination.  
  5. Commit atomically.

## **5\. Client Integration & Validation (Frontend)**

While the database enforces structural integrity, the React client ensures user experience and prevents unnecessary network calls.

### **5.1 Form Validation (Zod \+ React Hook Form)**

Before submitting to the Supabase APIs, the client will validate:

* name is not empty.  
* amount \> 0 and is a valid number.  
* type is exactly 'credit' or 'debit'.  
* reference\_id is auto-generated by the client (e.g., UUIDv4) or supplied by the user if it's a specific invoice number.

### **5.2 Error Handling & HTTP Mapping**

The Supabase SDK translates PostgreSQL errors into standard HTTP responses. The TanStack Query onError callbacks will map these to Shadcn Toast notifications:

| Database Event | HTTP Status | Client UI Response (Toast) |
| :---- | :---- | :---- |
| Check Constraint Failed (balance \< 0) | 400 Bad Request | "Transaction Failed: Insufficient funds for this debit." |
| Unique Constraint Failed (reference\_id) | 409 Conflict | "Duplicate Transaction: This reference ID has already been processed." |
| Foreign Key Violation (account\_id invalid) | 404 Not Found | "Error: Invalid Account ID." |
| Invalid Payload Data Type | 400 Bad Request | "Validation Error: Please check your input." |

