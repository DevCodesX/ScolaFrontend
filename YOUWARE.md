## Project Overview

**Scola** - An integrated Educational SaaS Platform for Arab Schools and Institutes. This is an MVP dashboard for managing educational institutions with Arabic RTL support.

## Project Status

- **Project Type**: React + TypeScript Modern Web Application
- **Entry Point**: `src/main.tsx` (React application entry)
- **Build System**: Vite 7.0.0
- **Styling System**: Tailwind CSS 3.4.17 with RTL support
- **Language**: Arabic (RTL) interface
- **Routing**: React Router DOM 6.30.1 with HashRouter
- **State Management**: Zustand 4.4.7
- **UI Components**: Headless UI, Lucide React icons
- **Animations**: Framer Motion 11.0.8, GSAP 3.13.0
- **Internationalization**: i18next with browser language detection
- **Validation**: Zod 3.25.67

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── layout/        # Layout components (Header, Sidebar, DashboardLayout)
│   ├── institution/   # Institution management components
│   ├── users/         # User table components
│   ├── classrooms/    # Classroom card components
│   └── schedule/      # Schedule grid components
├── pages/             # Page components
│   ├── Dashboard.tsx       # Main dashboard with stats overview
│   ├── TeachersPage.tsx    # Teachers listing and management
│   ├── StudentsPage.tsx    # Students listing and management
│   ├── ClassroomsPage.tsx  # Classroom cards display
│   ├── SchedulePage.tsx    # Weekly schedule grid
│   ├── SettingsPage.tsx    # Application settings
│   └── nstitutionPage.tsx  # Institution profile (note: filename typo)
├── data/              # Mock data for development
├── types/             # TypeScript type definitions
├── assets/            # Static assets
└── vite-env.d.ts      # Vite environment types
```

### Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Main dashboard with statistics |
| `/institution` | InstitutionPage | Institution profile management |
| `/teachers` | TeachersPage | Teacher listing with search/filter |
| `/students` | StudentsPage | Student listing with search/filter |
| `/classrooms` | ClassroomsPage | Visual classroom cards |
| `/schedule` | SchedulePage | Weekly schedule grid |
| `/settings` | SettingsPage | Application settings |

### Key Features (MVP)
1. **Dashboard**: Statistics overview with metrics cards
2. **User Management**: Teachers with full CRUD (add, edit, delete with confirmation) and students listing with search/filter
3. **Institution Management**: Institution profile form
4. **Classroom Management**: Visual classroom cards with capacity tracking
5. **Weekly Schedule**: Interactive schedule grid with day/week views
6. **Settings**: Application configuration page

### Data Models
- `User` (Teacher, Student, Parent, Admin roles)
- `Teacher` - extends User with subjects and classroomIds
- `Student` - extends User with classroomId, parentId, grade
- `Parent` - extends User with studentIds
- `Institution` - organization details with adminId
- `Classroom` - name, grade, section, capacity, subjects
- `ScheduleEvent` - schedule entries with dayOfWeek, time slots, subject

### RTL Support
- IBM Plex Sans Arabic font
- RTL direction set in `index.css`
- Tailwind configured for RTL layouts
- Arabic days of week constants in types

## Development Commands

- **Install dependencies**: `npm install`
- **Development server**: `npm run dev`
- **Build project**: `npm run build`
- **Preview build**: `npm run preview`

## Important Notes

### CSS Import Order
`@import` statements must come BEFORE `@tailwind` directives in `src/index.css`.

### Authentication
No custom auth implemented. When Youbase is enabled, use `client.auth.renderAuthUI()` for authentication.

### Backend/Database
Currently using mock data in `src/data/mockData.ts`. Enable Youbase for real backend functionality.

### Known Issues
- `nstitutionPage.tsx` filename is missing the leading 'I' (should be `InstitutionPage.tsx`)

## Tech Stack Dependencies

### Core
- React 18.3.1
- TypeScript 5.8.3
- Vite 7.0.0

### Styling & UI
- Tailwind CSS 3.4.17
- Headless UI 1.7.18
- Lucide React 0.533.0
- Framer Motion 11.0.8
- GSAP 3.13.0

### Routing & State
- React Router DOM 6.30.1
- Zustand 4.4.7

### Utilities
- clsx 2.1.0
- Zod 3.25.67
- react-use 17.6.0

### i18n
- i18next 23.10.1
- react-i18next 14.1.0
- i18next-browser-languagedetector 7.2.0

## Next Steps for Development

1. Enable Youbase for backend persistence
2. Fix `nstitutionPage.tsx` filename typo
3. Add attendance tracking UI
4. Implement schedule conflict detection
5. Add data export functionality
6. Implement user authentication flow
