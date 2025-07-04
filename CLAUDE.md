# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GRUMAN is a full-stack service management system for field service operations. It's built with NestJS (backend) and Angular (frontend) using a containerized architecture.

**Architecture:**
- **Backend**: NestJS with TypeORM, MariaDB database, JWT authentication
- **Frontend**: Angular 18 with Angular Material, DevExtreme components
- **Database**: MariaDB with TypeORM entities and automatic synchronization
- **Deployment**: Docker Compose with separate containers for frontend, backend, and database

## Development Commands

### Backend Commands (from `/backend`)
```bash
# Install dependencies
npm install

# Development with hot reload
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test
npm run test:e2e
npm run test:cov

# Linting and formatting
npm run lint
npm run format
```

### Frontend Commands (from `/frontend`)
```bash
# Install dependencies
npm install

# Development server
npm run start

# Build for production
npm run build

# Run tests
npm run test

# Watch mode for development
npm run watch
```

### Docker Commands (from root directory)
```bash
# Start all services
docker-compose up

# Build and start
docker-compose up --build

# Stop all services
docker-compose down
```

## Key Architecture Patterns

### Backend Module Structure
The backend follows NestJS modular architecture with each business domain having its own module:
- Each module contains: controller, service, entity, and DTOs
- Entities use TypeORM decorators for database mapping
- Services handle business logic and database operations
- Controllers handle HTTP requests and responses

### Database Configuration
- Uses MariaDB with TypeORM
- Automatic synchronization enabled (`synchronize: true`)
- Entities auto-discovered from `/**/*.entity{.ts,.js}` pattern
- Connection configured via environment variables

### File Upload System
- Two upload modules: `upload` (legacy) and `upload-v2` (current)
- Files stored in `/uploads` directory with subdirectories by feature
- Static file serving configured via ServeStaticModule

### Authentication
- JWT-based authentication with `@nestjs/jwt`
- Auth guards protect routes
- User roles and permissions system

### Frontend Architecture
- Angular 18 with standalone components and routing
- Angular Material for UI components
- DevExtreme for data grids and advanced components
- Services for API communication
- Guards for route protection

## Environment Configuration

### Backend Environment Variables (.env)
```
DB_HOST=mariadb
DB_PORT=3306
DB_USERNAME=gruman
DB_PASSWORD=gruman
DB_DATABASE=gruman
```

### Frontend Environment
- Development API URL: `http://localhost:3000/`
- Frontend URL: `http://localhost:4200/`
- Configured in `/frontend/src/app/config.ts`

## Database Schema Overview

The system manages:
- **Users**: System users with authentication
- **Clients**: Customer companies
- **Solicitar Visita**: Service requests with SLA tracking
- **Programacion**: Service scheduling
- **Inspection**: Checklist-based inspections
- **Repuestos**: Spare parts management
- **Vehiculos**: Vehicle management
- **Documentos**: Document management with Firebase integration

## Development Guidelines

### Backend Development
- Follow NestJS conventions for modules, services, and controllers
- Use TypeORM entities for database modeling
- Implement proper error handling and validation
- Use DTOs for request/response validation with class-validator

### Frontend Development
- Follow Angular style guide conventions
- Use Angular Material components for consistency
- Implement reactive forms with proper validation
- Use services for API communication and state management

### Testing
- Backend: Jest for unit tests, Supertest for e2e tests
- Frontend: Jasmine/Karma for unit tests
- Always run tests before committing changes

### Code Quality
- Use ESLint for backend linting
- Use Prettier for code formatting
- Follow TypeScript best practices
- Implement proper error handling

## Common Development Workflows

### Adding a New Feature Module
1. Generate NestJS module: `nest g module feature-name`
2. Create entity with TypeORM decorators
3. Generate service and controller
4. Add DTOs for validation
5. Update app.module.ts imports
6. Create corresponding Angular service and components

### Database Schema Changes
- Modify TypeORM entities
- Restart backend to apply synchronization
- For production: create proper migrations instead of using synchronize

### File Upload Implementation
- Use `upload-v2` module for new file upload features
- Files saved to `/uploads/{feature-name}/` directory
- Return accessible URLs for frontend consumption