# KH-Payroll Project - AI Assistant Guidelines

This document provides comprehensive guidelines for AI assistants (Claude, ChatGPT, etc.) working with the **kh-payroll** project.

---

## Project Overview

**kh-payroll** is a payroll management system built with **Nuxt 4** (Vue 3), designed for managing employee attendance, time tracking, payroll calculations, and company administration.

### Tech Stack

-   **Framework**: Nuxt 4.2.1 (SSR disabled, SPA mode)
-   **Frontend**: Vue 3.5.25, Vue Router 4.6.3
-   **UI Library**: @nuxt/ui 4.2.1
-   **Styling**: TailwindCSS 4.1.17
-   **Backend**: Nitro (Nuxt server engine)
-   **Database**: MySQL 2 (via mysql2 package)
-   **Authentication**: nuxt-auth-utils 0.5.25
-   **Validation**: Zod 4.1.13
-   **Encryption**: crypto-js 4.2.0
-   **Testing**: Vitest 3.2.4, @nuxt/test-utils 3.20.1
-   **Package Manager**: pnpm
-   **Language**: TypeScript 5.9.3

---

## Project Structure

```
kh-payroll/
├── app/                      # Frontend application code
│   ├── assets/              # CSS and static assets
│   ├── components/          # Vue components
│   │   ├── DBLookup.vue
│   │   ├── DateInput.vue
│   │   ├── MainMenu.vue
│   │   ├── ModalDialog.vue
│   │   ├── MoneyInput.vue
│   │   ├── ToolbarData.vue
│   │   └── lookup/
│   ├── composables/         # Vue composables (5 files)
│   ├── layouts/             # Nuxt layouts
│   ├── middleware/          # Route middleware
│   ├── pages/               # Nuxt pages/routes
│   │   ├── index.vue        # Dashboard/home
│   │   ├── login.vue        # Login page
│   │   ├── company.vue      # Company management
│   │   ├── employee.vue     # Employee management
│   │   ├── user.vue         # User management
│   │   ├── permission.vue   # Permission management
│   │   ├── timeinout.vue    # Time in/out tracking
│   │   ├── timetype.vue     # Time type configuration
│   │   ├── holiday.vue      # Holiday management
│   │   ├── incometype.vue   # Income type configuration
│   │   ├── password.vue     # Password management
│   │   └── [...slug].vue    # Catch-all route
│   ├── plugins/             # Nuxt plugins (2 files)
│   ├── types/               # TypeScript type definitions
│   ├── app.config.ts        # App configuration
│   ├── app.vue              # Root component
│   └── error.vue            # Error page
│
├── server/                   # Backend/API code
│   ├── api/                 # API endpoints (41 files)
│   │   ├── attendance/      # Attendance CRUD
│   │   ├── company/         # Company CRUD + session
│   │   ├── employee/        # Employee CRUD
│   │   ├── holiday/         # Holiday CRUD
│   │   ├── incometype/      # Income type CRUD
│   │   ├── permission/      # Permission management
│   │   ├── timecard/        # Timecard operations
│   │   ├── timetype/        # Time type CRUD
│   │   ├── users/           # User CRUD + password
│   │   ├── login.post.ts    # Authentication
│   │   ├── lookup.get.ts    # Lookup data
│   │   ├── counter.get.ts   # Counter endpoint
│   │   ├── today.get.ts     # Today's data
│   │   └── kxreport.ts      # Report proxy
│   ├── database/            # Database layer
│   │   ├── pool.ts          # MySQL connection pool
│   │   ├── SqlAttendance.ts
│   │   ├── SqlCompany.ts
│   │   ├── SqlEmployee.ts
│   │   ├── SqlHoliday.ts
│   │   ├── SqlIncomeType.ts
│   │   ├── SqlLogs.ts
│   │   ├── SqlPermission.ts
│   │   ├── SqlTimeCard.ts
│   │   ├── SqlTimeType.ts
│   │   └── SqlUsers.ts
│   ├── plugins/             # Server plugins (2 files)
│   └── utils/               # Server utilities (2 files)
│
├── script/                   # Deployment and utility scripts
│   ├── cert/                # SSL certificates
│   ├── docker/              # Docker configuration
│   ├── sql/                 # SQL scripts
│   ├── kh-payroll.service   # Systemd service file
│   ├── report.sh            # Report generation script
│   └── serve.sh             # Production server script
│
├── report/                   # JasperReports files
│   ├── A00.jrxml
│   ├── A00.jasper
│   └── DataAdapter.jrdax
│
├── shared/                   # Shared code (4 files)
├── test/                     # Test files (6 files)
├── public/                   # Static public files
│   ├── favicon.ico
│   ├── robots.txt
│   ├── report.html
│   └── img/
│
├── nuxt.config.ts           # Nuxt configuration
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Vitest configuration
├── package.json             # Dependencies and scripts
└── .prettierrc.json         # Code formatting rules
```

---

## Key Configuration

### Nuxt Config (`nuxt.config.ts`)

-   **SSR**: Disabled (`ssr: false`) - runs as SPA
-   **Modules**: @nuxt/ui, nuxt-auth-utils, @nuxt/test-utils
-   **Session Storage**: Redis (production) or Memory (development)
-   **Session Max Age**: Configurable via `MAX_AGE` env variable (default: 36000s)
-   **Idle Limit**: 1/10th of MAX_AGE (default: 3600s)
-   **Report Proxy**: `/kxreport/**` proxies to external report server

### Environment Variables

The project uses `.env` file (gitignored) with these expected variables:

-   `NODE_ENV`: Environment mode (production/development)
-   `MAX_AGE`: Session max age in seconds
-   `NUXT_SESSION_PASSWORD`: Session encryption password (min 32 chars)
-   `REDIS_URL`: Redis connection URL (optional, falls back to memory)
-   `KXREPORT`: Development report server URL
-   `KXREPORT_HTTPS`: Production report server URL

### Database

-   **Type**: MySQL
-   **Connection**: Managed via `server/database/pool.ts`
-   **SQL Classes**: Each entity has a dedicated SQL class (e.g., `SqlEmployee.ts`)

---

## API Structure

All API endpoints follow RESTful conventions with file-based routing:

### Pattern

```
server/api/{resource}/index.{method}.ts
```

### Methods

-   `index.get.ts` - GET (list/read)
-   `index.post.ts` - POST (create)
-   `index.put.ts` - PUT (update)
-   `index.delete.ts` - DELETE (remove)

### Resources

-   **attendance** - Employee attendance records
-   **company** - Company/organization management
-   **employee** - Employee information
-   **holiday** - Holiday calendar
-   **incometype** - Income/payment types
-   **permission** - User permissions
-   **timecard** - Time tracking cards
-   **timetype** - Time entry types
-   **users** - User accounts

### Special Endpoints

-   `POST /api/login` - Authentication
-   `GET /api/lookup` - Lookup/reference data
-   `GET /api/counter` - Counter/statistics
-   `GET /api/today` - Today's summary
-   `PUT /api/company/session` - Company session management
-   `PUT /api/permission/used` - Permission usage tracking
-   `GET /api/users/lookup` - User lookup
-   `PUT /api/users/password` - Password change

---

## Frontend Architecture

### Pages

Each page corresponds to a management interface:

-   **index.vue** - Dashboard/home page
-   **login.vue** - Authentication page
-   **company.vue** - Company CRUD interface
-   **employee.vue** - Employee CRUD interface
-   **user.vue** - User CRUD interface
-   **permission.vue** - Permission management
-   **timeinout.vue** - Time tracking interface
-   **timetype.vue** - Time type configuration
-   **holiday.vue** - Holiday calendar management
-   **incometype.vue** - Income type configuration
-   **password.vue** - Password change interface

### Components

Reusable UI components:

-   **DBLookup.vue** - Database lookup/autocomplete
-   **DateInput.vue** - Date picker component
-   **MainMenu.vue** - Main navigation menu
-   **ModalDialog.vue** - Modal dialog wrapper
-   **MoneyInput.vue** - Currency input field
-   **ToolbarData.vue** - Data table toolbar

### UI Configuration

Custom @nuxt/ui theme in `app.config.ts`:

-   Custom table styling (yellow/blue light theme, sky/gray dark theme)
-   Cursor pointer on buttons and table cells
-   Full-width inputs by default

---

## Development Guidelines

### Code Style

-   **Formatting**: Prettier configured (`.prettierrc.json`)
-   **TypeScript**: Strict typing enforced
-   **Validation**: Use Zod schemas for data validation
-   **Naming**: Use descriptive names, follow Vue/Nuxt conventions

### File Naming Conventions

-   **Components**: PascalCase (e.g., `MainMenu.vue`)
-   **Pages**: lowercase (e.g., `employee.vue`)
-   **API Routes**: `{resource}/index.{method}.ts`
-   **Database**: `Sql{Entity}.ts` (e.g., `SqlEmployee.ts`)
-   **Types**: Descriptive names in `app/types/`

### Best Practices

1. **Database Operations**

    - Always use the SQL classes in `server/database/`
    - Use connection pooling via `pool.ts`
    - Handle errors gracefully with try-catch

2. **API Endpoints**

    - Validate input with Zod schemas
    - Return consistent response formats
    - Use proper HTTP status codes
    - Handle authentication/authorization

3. **Frontend Components**

    - Use composables for shared logic
    - Keep components focused and reusable
    - Use @nuxt/ui components when possible
    - Follow Vue 3 Composition API patterns

4. **Authentication**

    - Use nuxt-auth-utils for session management
    - Implement middleware for protected routes
    - Handle session expiry gracefully

5. **Testing**
    - Write tests in `test/` directory
    - Use Vitest for unit/integration tests
    - Run tests with `pnpm test`

---

## Common Tasks

### Running the Application

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run production server
pnpm serve
```

### Testing

```bash
# Run tests
pnpm test
```

### Database Migrations

SQL scripts are located in `script/sql/` directory.

### Report Generation

Reports use JasperReports:

-   Report definitions: `report/*.jrxml`
-   Compiled reports: `report/*.jasper`
-   Report server proxy: `/kxreport/**`

---

## Important Notes

### When Making Changes

1. **API Changes**

    - Update corresponding SQL class if database schema changes
    - Update Zod validation schemas
    - Test all CRUD operations
    - Update frontend components if response format changes

2. **Frontend Changes**

    - Maintain responsive design
    - Test dark mode compatibility
    - Ensure accessibility
    - Update types if data structures change

3. **Configuration Changes**

    - Document new environment variables
    - Update `.env.example` if it exists
    - Test in both development and production modes

4. **Database Changes**
    - Create migration scripts in `script/sql/`
    - Update SQL classes
    - Update TypeScript types
    - Test data integrity

### Security Considerations

-   Never commit `.env` file
-   Use environment variables for sensitive data
-   Validate all user input
-   Sanitize database queries
-   Use HTTPS in production
-   Implement proper session management
-   Follow principle of least privilege for permissions

### Performance

-   Connection pooling is configured for database
-   Redis recommended for production sessions
-   Static assets served from `public/`
-   SPA mode for faster client-side navigation

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

    - Check MySQL server is running
    - Verify connection credentials in `.env`
    - Check `server/database/pool.ts` configuration

2. **Session Issues**

    - Verify `NUXT_SESSION_PASSWORD` is set (min 32 chars)
    - Check Redis connection if using Redis storage
    - Clear browser cookies/storage

3. **Build Errors**

    - Run `pnpm install` to ensure dependencies are up to date
    - Check TypeScript errors with `nuxt typecheck`
    - Clear `.nuxt` and `.output` directories

4. **Report Proxy Issues**
    - Verify `KXREPORT` environment variable
    - Check report server is accessible
    - Review `nuxt.config.ts` routeRules

---

## Additional Resources

-   [Nuxt 3 Documentation](https://nuxt.com)
-   [Vue 3 Documentation](https://vuejs.org)
-   [@nuxt/ui Documentation](https://ui.nuxt.com)
-   [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)
-   [Zod Documentation](https://zod.dev)

---

## AI Assistant Instructions

When working with this project:

1. **Always check existing patterns** before creating new code
2. **Follow the established file structure** and naming conventions
3. **Use TypeScript** with proper typing
4. **Validate data** using Zod schemas
5. **Test changes** thoroughly before suggesting them
6. **Consider security implications** of any changes
7. **Maintain consistency** with existing code style
8. **Document significant changes** clearly
9. **Ask for clarification** if requirements are unclear
10. **Respect the gitignore** - never suggest committing ignored files

### When Asked to Add Features

1. Identify which layer(s) need changes (database, API, frontend)
2. Create/update SQL class if database changes needed
3. Create/update API endpoints following the pattern
4. Create/update frontend pages/components
5. Add proper validation and error handling
6. Consider authentication/authorization requirements
7. Test the complete flow

### When Debugging

1. Check browser console for frontend errors
2. Check server logs for API errors
3. Verify database connection and queries
4. Check environment variables are set correctly
5. Verify session/authentication state
6. Test API endpoints independently
7. Review recent changes that might have caused the issue

---

**Last Updated**: 2025-12-30
**Project Version**: Based on package.json dependencies
**Nuxt Version**: 4.2.1
