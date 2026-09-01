# Expense Tracker

A full-stack **Expense Tracker application** built with the **MERN Stack**.

This is my **first MERN Stack project**, built to apply and strengthen my understanding of backend development, REST APIs, authentication, database management, and full-stack application architecture.

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## Features

- User Registration & Login
- Email Verification
- Secure Password Hashing
- JWT-based Authentication
- Add, Edit & Delete Transactions
- Income & Expense Tracking
- Transaction Categories
- Transaction History
- Dashboard with Expense Statistics
- Protected Routes
- RESTful APIs
- Responsive UI

## Project Structure

```text
expense-tracker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:AmaanKhanGit/expense-tracker.git
cd expense-tracker
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

## Environment Variables

The backend requires the following environment variables:

| Variable     | Description                            |
| ------------ | -------------------------------------- |
| `PORT`       | Port on which the backend server runs  |
| `MONGO_URI`  | MongoDB connection string              |
| `JWT_SECRET` | Secret key used for JWT authentication |

> Never commit your `.env` file or expose your secret keys publicly.

## Project Goals

This project is being developed to gain practical experience with:

- MERN Stack development
- Backend architecture
- REST API design
- Authentication & authorization
- MongoDB database design
- Secure password handling
- Email verification
- Frontend-backend integration
- Error handling and validation
- Real-world project structure

## Status

🚧 **Currently in development**

New features and improvements will be added as development progresses.

## Author

**Amaan Khan**

Frontend Developer | MERN Stack Developer

[GitHub](https://github.com/AmaanKhanGit)
