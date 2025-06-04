# Eksamen API

A simple RESTful API built with Express.js and MongoDB for user management.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Project Structure](#project-structure)

## Features

- User management (create, retrieve, update, delete users)
- Input validation and sanitization
- Error handling with consistent responses
- Security headers with Helmet
- Rate limiting to prevent abuse

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose
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
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## API Endpoints

### Users

- `POST /api/createUser` - Create a new user (requires username and email)
- `GET /api/:username` - Get user by username
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Security

The API implements multiple layers of security:

- **Input Validation**: All user input is validated and sanitized
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Sets secure HTTP headers
- **CORS Protection**: Restricts API access to allowed origins
- **Error Handling**: Sanitized error responses that don't expose sensitive details

## Project Structure

```
├── controllers/           # Request handlers
│   └── userController.js
├── middleware/            # Express middleware
│   ├── errorMiddleware.js # Error handling
│   ├── helmetMiddleware.js # Security headers
│   └── rateLimitMiddleware.js # Rate limiting
├── models/                # Mongoose models
│   └── UserSchema.js
├── routes/                # API routes
│   └── apiRoutes.js
├── .env                   # Environment variables (not in git)
├── package.json           # Project dependencies
└── server.js              # Application entry point
```

## Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "message": "Error message"
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
