# Scola

An integrated Educational SaaS Platform for Arab Schools and Institutes. This is an MVP dashboard for managing educational institutions with Arabic RTL support.

## Features

- **Dashboard**: Statistics overview with metrics cards
- **User Management**: Teachers with full CRUD (add, edit, delete with confirmation) and students listing with search/filter
- **Institution Management**: Institution profile form
- **Classroom Management**: Visual classroom cards with capacity tracking
- **Weekly Schedule**: Interactive schedule grid with day/week views
- **Settings**: Application configuration page

## Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 7.0.0
- **Styling**: Tailwind CSS 3.4.17 with RTL support
- **Routing**: React Router DOM 6.30.1 (HashRouter)
- **State Management**: Zustand 4.4.7
- **UI Components**: Headless UI, Lucide React icons
- **Animations**: Framer Motion 11.0.8, GSAP 3.13.0
- **Internationalization**: i18next with browser language detection
- **Validation**: Zod 3.25.67

## Backend API

The project includes a Node.js/Express backend (`scola-backend/`) with MySQL database.

### Teachers API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teachers` | Get all teachers |
| `GET` | `/api/teachers/:institutionId` | Get teachers by institution |
| `POST` | `/api/teachers` | Create new teacher |
| `PUT` | `/api/teachers/:id` | Update teacher |
| `DELETE` | `/api/teachers/:id` | Delete teacher |

### Running the Backend

```bash
cd scola-backend
npm install
npm start
```

The backend runs on `http://localhost:4000` by default.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/        # Layout components (Header, Sidebar, DashboardLayout)
│   ├── institution/   # Institution management components
│   ├── users/         # User table components
│   ├── classrooms/    # Classroom card components
│   └── schedule/      # Schedule grid components
├── pages/             # Page components
├── data/              # Mock data for development
├── types/             # TypeScript type definitions
├── lib/               # Utility functions and API clients
└── assets/            # Static assets
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Main dashboard with statistics |
| `/institution` | InstitutionPage | Institution profile management |
| `/teachers` | TeachersPage | Teacher listing with search/filter |
| `/students` | StudentsPage | Student listing with search/filter |
| `/classrooms` | ClassroomsPage | Visual classroom cards |
| `/schedule` | SchedulePage | Weekly schedule grid |
| `/settings` | SettingsPage | Application settings |

## RTL Support

- IBM Plex Sans Arabic font
- RTL direction configured in CSS
- Tailwind configured for RTL layouts
- Arabic interface language

## License

MIT
