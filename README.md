# CleanOps - Web Management Application
**Project Code:** SP26SE111 | **Group:** GSP26SE06

Web application for Managers and Administrators in the project:
**"Integrating AI-Based sanitation evaluation with adaptive process flows to enhance industrial cleaning efficiency."**

---

## Overview
CleanOps is a next-generation industrial cleaning operations platform built with a data-driven and AI-driven approach.
This web app provides powerful tools for Managers and Admins to configure dynamic workflows, assign staff intelligently, track SLAs, and monitor cleaning quality through AI.

## Key Features
- **Dynamic Workflow Builder:** A no-code/low-code drag-and-drop tool to design custom cleaning workflows for different environments (hospitals, offices, airports, etc.) without changing code.
- **AI Configuration and Review:** Configure thresholds for computer vision AI (PPE detection and quality scoring) and review/override AI-flagged inspection images.
- **NLP-Based Smart Search:** Search and assign staff using natural language (example: `Find glass-cleaning staff with safety certificates in District 1`).
- **Performance Dashboard:** Track real-time task progress, KPIs, SLA completion rates, and issue/ad-hoc task reports.
- **Master Data and User Management:** Manage certificates, skills, environment types, and role-based permissions.

---

## Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (React Framework)
- **Authentication:** Auth0 (OAuth2 / JWT)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Context API and Custom Hooks
- **Real-time Communication:** Socket.io-client (urgent incident notifications)
- **API Client:** Axios / Fetch API communicating with .NET Backend Modular Monolith

---

## Project Structure
The project follows a layered architecture for maintainability and scalability:

```text
src/
├── app/ (or pages/)     # Routes and page UI (Dashboard, Workflow, SLA...)
├── components/          # Shared UI components (Buttons, Modals, Cards...)
├── containers/          # Complex components with logic/state (WorkflowBuilderContainer...)
├── contexts/            # Global state managers (AuthContext, ThemeContext...)
├── hooks/               # Custom React Hooks (useFetch, useAuth...)
├── layouts/             # Layout components (Sidebar, Header, Main Layout)
├── services/            # Backend API modules (.NET API integration)
├── utils/               # Utility functions (formatDate, calculateScore...)
└── lib/                 # Third-party library setup (Axios instance, Socket.io, Auth0)
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18.x or higher)
- npm / Yarn / pnpm

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone <YOUR_GIT_REPO_URL>
cd cleanopsai-web
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:

```env
# Backend API Gateway URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Auth0 Configuration
NEXT_PUBLIC_AUTH0_DOMAIN=<YOUR_AUTH0_DOMAIN>
NEXT_PUBLIC_AUTH0_CLIENT_ID=<YOUR_AUTH0_CLIENT_ID>
NEXT_PUBLIC_AUTH0_AUDIENCE=<YOUR_AUTH0_AUDIENCE>

# Socket.io URL for real-time notifications
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

### 4. Run the Application
Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser at: `http://localhost:3000`

---

## Development Guidelines
- **API Services:** All backend requests must be defined in `services/` (do not call fetch/axios directly inside UI components).
- **Authentication:** Every protected component/page must be wrapped by Auth0 protection middleware. Retrieve tokens through a custom `useAuth()` hook.
- **Commit Convention:** Use `<type>: <short description>`.
Example: `feat: add workflow drag-and-drop`, `fix: resolve AI score rendering issue`.

---

## Contributors
- Nguyen Duy Anh - Leader
- Huynh Ngoc Khanh - Member
- Nguyen Nam Phong - Member
- Dang Nguyen Hai Nam - Member
- Vo Minh Luan - Member

**Supervisor:** Nguyen Nguyen Binh
