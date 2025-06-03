# Eksamen API

A secure RESTful API built with Express.js and MongoDB featuring JWT authentication, user management, and robust security measures.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Project Structure](#project-structure)

## Features

- User authentication with JWT
- User management (CRUD operations)
- Session management with token refreshing
- Role-based access control
- Rate limiting
- Secure cookies
- Input validation
- Error handling
- Security headers with Helmet

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Argon2 for password hashing
- Express Validator
- Helmet for security headers
- CORS protection
- Rate limiting

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a `.env` file based on `.env.example`
4. Set up MongoDB (locally or using MongoDB Atlas)
5. Start the server:

```bash
npm start
# or
pnpm start
```

## Configuration

Create a `.env` file in the project root with the following variables:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check current authentication
- `POST /api/auth/refresh-token` - Refresh JWT token

### Users

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:username` - Get user by username (requires authentication)
- `PUT /api/users/:username` - Update user (requires authentication, must be same user or admin)
- `DELETE /api/users/:username` - Delete user (admin only)

## Security

The API implements multiple layers of security:

- **Password Hashing**: Uses Argon2 (winner of the Password Hashing Competition)
- **JWT Authentication**: Secure, stateless authentication
- **HTTP-Only Cookies**: Prevents XSS attacks accessing tokens
- **Input Validation**: All inputs are validated
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Sets secure HTTP headers
- **CORS Protection**: Restricts API access to allowed origins
- **Error Handling**: Sanitized error responses

## Project Structure

```
├── controllers/           # Request handlers
│   ├── authController.js
│   └── userController.js
├── middleware/            # Express middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── helmetMiddleware.js
│   ├── rateLimitMiddleware.js
│   └── validationMiddleware.js
├── models/                # Mongoose models
│   └── UserSchema.js
├── routes/                # API routes
│   ├── authRoutes.js
│   └── userRoutes.js
├── utils/                 # Utility functions
│   └── jwtUtils.js
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── package.json           # Project dependencies
├── pnpm-workspace.yaml    # PNPM workspace config
└── server.js              # Application entry point
```

## Running in Production

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up proper MongoDB security
4. Use HTTPS in production
5. Set stronger rate limits

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // Optional validation errors
}
```

Success responses follow a similar pattern:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...} // Optional data
}
```
