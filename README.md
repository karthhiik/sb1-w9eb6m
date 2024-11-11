# Full Stack Authentication System

This project is a full-stack authentication system built with React, TypeScript, and Spring Boot.

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Backend Setup

1. Make sure you have Java 17 and Maven installed

2. Install PostgreSQL and create a database named `authdb`

3. Update `src/main/resources/application.properties` with your database credentials

4. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The backend will run on `http://localhost:8080`

## Features

- User registration with validation
- Secure login with JWT
- Password strength requirements
- Account lockout after failed attempts
- Protected routes
- Responsive UI with Tailwind CSS

## Development

- Frontend: React + TypeScript + Vite
- Backend: Spring Boot + Spring Security
- Database: PostgreSQL
- Authentication: JWT
- Styling: Tailwind CSS
- Icons: Lucide React

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
└── backend/
    └── src/
        ├── main/
        │   ├── java/
        │   │   └── com/
        │   │       └── example/
        │   │           └── auth/
        │   └── resources/
        └── pom.xml
```