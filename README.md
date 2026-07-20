# Social Media Mini - Web Client (Next.js & TypeScript)

A high-fidelity, interactive social media web client designed to replicate modern, premium user experiences (resembling Instagram, Threads, and WhatsApp hybrids). This application showcases production-grade frontend architecture, advanced component structures, performance optimization strategies, and real-time state management.

---

## 🚀 Tech Stack Overview

- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly-typed)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI Primitives](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for premium, fluid micro-interactions
- **Client State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Server Cache Management**: [TanStack React Query v5](https://tanstack.com/query/latest)
- **Real-Time Layer**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **Unit Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Yup](https://github.com/jquense/yup) validation

---

## 🏗️ Architectural Decisions & Engineering Highlights

This client was built with scalability, separation of concerns, and device performance as top-level priorities:

### 1. Hybrid State Management Strategy
Rather than putting all application data into Redux or React's component state, the application distinguishes between two kinds of state:
*   **Server State (TanStack Query)**: Manages network queries, pagination, caching, status transitions, and optimistic UI updates. This keeps components simple, automatically handles cache-invalidation, and prevents duplicate API requests.
*   **Client State (Redux Toolkit)**: Reserved exclusively for global client-side UI concerns, such as authentication tokens, modals, and persistent navigation settings.

### 2. Domain-Driven Layout (`src/features/*`)
The project organizes code using a **domain-driven feature architecture** instead of mixing all files in global folders:
```
src/
├── app/                  # Route layouts, pages, and entry points
├── components/           # Generic, globally reusable layout elements (Skeletons, UI, Buttons)
├── features/             # Business domain verticals (e.g., auth, reels, messages, profile)
│   └── messages/
│       ├── components/   # Feature-specific components (ChatArea, MessageSearch)
│       ├── hooks/        # Local custom React hooks
│       ├── services/     # API request hooks & messaging actions
│       └── types/        # Feature domain type definitions
├── lib/                  # Architecture wrappers (Socket configuration, Axios instances, EventBus)
├── store/                # Redux Toolkit global store and slices
└── types/                # Core global type declarations
```
This isolates changes, facilitates code-splitting, and makes the project easy to navigate and scale.

### 3. Decoupled real-time WebSockets
Real-time engines are prone to memory leaks and connection clutter when bound directly to React components. To resolve this:
*   An env-configured [SocketManager](src/lib/socket/SocketManager.ts) handles low-level socket connections as a singleton.
*   An event-bus system decouples messaging and notifications from raw sockets: components register with the [EventBus](src/lib/events/EventBus.ts) rather than subscribing directly to Socket.io events.
*   Automatic token re-auth handles JWT expiration during active connections.

### 4. Adaptive Media Preloading & Telemetry
High-density media streams (like Instagram/Tiktok Reels) require intensive memory and rendering power.
*   **Intelligent Preloader Hook** (`useVideoPreloader`): Dynamically manages a buffer pool of videos, preloading the next two videos while aggressively disposing of distant video streams to conserve browser memory.
*   **Performance Monitoring** (`usePerformanceMonitor`): Captures CPU, layout offsets, and memory telemetry in real-time, helping optimize GPU animations and keep rendering rates at a steady 60fps.

---

## 🎯 Implemented Features Showcase

### 1. Immersive Video Reels Feed (`src/features/reels`)
*   Full-screen vertical snap-scroll feed with smooth, responsive mouse/touch swipes.
*   Adaptive preloading pool and memory managers for lag-free video loading.
*   Interactive layers for comments overlay, sharing modals, and customizable playback controls (volume memory, loop, seek).
*   Live GPU performance monitoring logs.

### 2. Real-Time Chat Engine (`src/features/messages`)
*   **Direct & Group Conversations**: Dialogs for creating groups, assigning admin/moderator roles, invitations, and custom settings (disappearing messages, group metadata updates).
*   **Message Interactions**: Real-time typing indicators, online presence status indicators, text message editing, message deletion (unsend), replies, reactions, and forwarding.
*   **Advanced Sharing Tools**: Rich media upload manager supporting multiple files, visual thumbnails, and upload progress bars.
*   **Audio Voice Notes**: Fully integrated browser-native audio recorder featuring visual waveform playback, recording timers, and pause/resume functionality.
*   **Full-Text Search Engine**: In-chat keyword search with highlight markers, message filters (date, type, author), and paginated history with virtual-scrolling loaders.

### 3. Comprehensive Authentication System (`src/features/auth`)
*   Modular login, signup, and reset forms.
*   Strict client-side schemas using Yup.
*   Email OTP verification state machines.

### 4. High-Fidelity Profile Dashboards (`src/features/profile`)
*   Responsive Instagram-style grids highlighting posts, reels, and tagged layouts.
*   Story highlights drawers.
*   Personalized info edits.

---

## ⚙️ Project Development Strategy: Mock-Driven Frontend

This application was engineered using a **Mock-Driven Frontend Architecture**:
1. All domain data layers rely on clear TypeScript interfaces.
2. Services in `src/services/` are decoupled via helper boundaries (`ok` & `emptyPage`) that return validated mock responses in development.
3. This decouples the frontend team's work from backend status. It allows mock UI tests and UX prototyping to run instantly, ensuring 100% feature visibility on the frontend client even before backend deployment.

### 🔌 Transitioning to Live Integration
Connecting to a live REST API or WebSocket gateway requires minimal changes:
*   Configure the connection URL in the `.env` settings.
*   Inside `src/services/`, swap out the mock helpers for real HTTP client calls using the pre-configured Axios instance (`src/lib/axios.ts`):
```typescript
// Example: Transitioning posts.service.ts
import { axiosInstance } from '@/lib/axios';

export const postsService = {
  getFeed: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  }
};
```

---

## 🛠️ Getting Started & Setup

### Prerequisites
- **Node.js**: `18.17.x` or later.
- **Package Manager**: `npm` (configured), `pnpm`, or `yarn`.

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   npm install
   ```
2. Set up your local environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:3000`.

### Running Scripts
- `npm run dev` - Launches development server with Next.js Turbopack compiler.
- `npm run build` - Validates type-safety and builds production client bundles.
- `npm run start` - Starts production build server.
- `npm run lint` - Performs ESLint code analysis.
- `npm run test` - Runs the unit and integration suite using Vitest.

---

## 🔮 Upcoming Integration Milestones

- [ ] **Live API Hookup**: Migrate from stub services to live backend endpoints.
- [ ] **E2E Browser Coverage**: Integrate Cypress / Playwright flows.
- [ ] **CI/CD Actions**: Automated lint/type-check hooks on pull request actions.
