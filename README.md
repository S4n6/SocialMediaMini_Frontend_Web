# Social Media Mini - Frontend Web Application

This is a modern social media mini application built with [Next.js](https://nextjs.org) and TypeScript, designed to provide a streamlined social networking experience.

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 19** - Latest React features
- **ESLint** - Code linting and quality

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and navigate to the project directory
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development

- Start editing by modifying `src/app/page.tsx`
- The page auto-updates as you edit the file
- Use the `src/` directory structure for better organization

## 📁 Project Structure

```
src/
├── app/                 # App Router pages and layouts
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable React components
├── lib/               # Utility functions and shared logic
└── types/             # TypeScript type definitions
public/                # Static assets
```

## 🎯 Features

### ✅ Phase C: Advanced Messaging System (Complete!)

**Task 1: Advanced Message Features**

- ✅ Message editing, deletion, and forwarding
- ✅ File attachments with upload progress
- ✅ Voice message recording and playback
- ✅ Message reactions and replies
- ✅ Rich content support (images, videos, documents)

**Task 2: Group Chat Functionality**

- ✅ Create and manage group chats
- ✅ Member role management (admin, moderator, member)
- ✅ Group invitations and member controls
- ✅ Customizable group settings and privacy

**Task 3: Message Search & History**

- ✅ Full-text message search with highlighting
- ✅ Advanced filtering by date, sender, content type
- ✅ Paginated message history with virtual scrolling
- ✅ Search statistics and conversation summaries

**Task 4: UI/UX Improvements**

- ✅ Smooth 60fps animations and transitions
- ✅ Skeleton loading states and progress indicators
- ✅ Mobile-first responsive design
- ✅ Touch optimizations and accessibility features
- ✅ Performance optimizations with GPU acceleration

### 🔄 Upcoming Features

- [ ] User authentication and profiles
- [ ] Create and share posts
- [ ] News feed with infinite scroll
- [ ] Real-time notifications
- [ ] Dark/Light theme support

## 🎮 Live Demos

Explore the completed Phase C features:

- **[Phase C Overview](http://localhost:3000/phase-c-complete)** - Complete summary and statistics
- **[Advanced Messages](http://localhost:3000/messages-advanced-test)** - Message actions, file uploads, voice messages
- **[Group Chat](http://localhost:3000/messages-group-test)** - Group management and member controls
- **[Message Search](http://localhost:3000/messages-search-test)** - Advanced search and message history
- **[UI Improvements](http://localhost:3000/ui-improvements-demo)** - Animations, loading states, responsive design

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Development Guidelines

- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement responsive design patterns
- Follow modern React patterns (hooks, functional components)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
