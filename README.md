# civic-issue-reporter-
# 🏙️ Civic Issue Reporter

&gt; A modern, community-driven platform for reporting and tracking local civic issues — from potholes and broken streetlights to garbage collection and public safety concerns.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## ✨ Features

### 🗺️ Interactive Map Reporting
- Click anywhere on the map to drop a pin and report an issue
- Real-time location detection with geolocation API
- Visual clustering for dense issue areas

### 📸 Rich Media Support
- Upload photos directly from your device
- Drag-and-drop image upload with preview
- Client-side image compression for fast uploads

### 🔍 Smart Discovery
- Filter issues by category, status, and proximity
- Search by location or keyword
- Sort by recency, urgency, or community votes

### 👤 User Experience
- Clean, responsive design — works on mobile, tablet, and desktop
- Dark mode support for comfortable viewing
- Real-time toast notifications for actions
- Skeleton loaders and smooth transitions

### 📊 Issue Tracking
- Track status of reported issues (Pending → In Progress → Resolved)
- Community upvoting to prioritize urgent problems
- Comment threads for updates and discussions
- Notification system for status changes on your reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Maps** | Leaflet / Mapbox |
| **Auth** | Better Auth |
| **State** | React Query (TanStack Query) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm / bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Ammy2311/civic-issue-reporter-.git
cd civic-issue-reporter-

# Install dependencies
npm install

# Start the development server
npm run dev
