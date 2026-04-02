# BulkMaster ⚡️
**Raw Performance & Hypertrophy Tracking Engine**

BulkMaster is a brutalist-themed, full-stack fitness application specifically engineered for bodybuilding and bulking. Designed with a utilitarian interface, it strips away the noise and focuses purely on what matters: tracking workouts, counting macros, and visualizing real physical progression.

**This is the URL of the website that is already in production:** https://bulk-master-2arl.vercel.app/

## 🚀 Key Features

### 1. **Meticulous Onboarding & Profiling**
- Calculates Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor formula accurately based on user biometrics.
- Configurable caloric surplus phases (Lean, Standard, Aggressive) to automatically define daily macro goals.

### 2. **Live Workout Tracking (Training Engine)**
- **Session Manager**: Start, pause, or finish a live training session.
- **Dynamic Sets & Reps**: Log weights and repetitions set-by-set in real-time.
- Automatically records and aggregates "Weekly Load Volume" to visualize progressive overload.

### 3. **Nutrition & Macro Tracking**
- **Resilient Food Search Ecosystem**: A 3-layer progressive API system ensures food queries never fail:
  1. Open Food Facts API (Primary global database).
  2. Edamam API (Secondary fallback).
  3. Internal Static Fallback (Guaranteed to return results if external networks fail).
- Automatically tracks Protein, Carbohydrates, Fats, and Total Calories progress bars dynamically against daily targets.

### 4. **Progress Analytics & Media**
- **Mass Trajectory Chart**: A dynamic SVG graph plotting the user's daily logged weight over historical timeframes (7D, 30D, 90D).
- **Weekly Volume Bar Chart**: Shows total weight lifted over the current week to guarantee progressive hypertrophy.
- **Visual Evolution Gallery**: Users can upload, label, and securely store progress photos.

### 5. **Robust Account & Security Infrastructure**
- Fully authenticated via **NextAuth.js v5**.
- Avatar uploads and progress media securely bridged to **Supabase Storage**.
- **Danger Zone**: A complete tear-down functionality allowing users to permanently wipe their profile, logs, history, and media instantly from the database.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (with custom CSS variables for effortless Light/Dark UI modes)
- **Database & Storage**: Supabase (PostgreSQL + Supabase Storage)
- **Authentication**: NextAuth.js (Auth.js) connecting securely to Supabase.
- **Data Fetching/State**: TanStack React Query (`@tanstack/react-query`) for instant cache invalidation and UI syncing.
- **Icons & UI Elements**: Lucide React

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js installed (v18+)
- A new [Supabase](https://supabase.com/) project
- Your preferred code editor

### 2. Environment Variables
Create a `.env.local` file in the root of the project and populate it with the following keys:

```env
# NextAuth / Auth.js
AUTH_SECRET="your-super-secret-auth-key-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Keys
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-role-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Edamam API (Optional - for Food Search Fallback)
EDAMAM_APP_ID="your_edamam_app_id"
EDAMAM_APP_KEY="your_edamam_app_key"
```

### 3. Supabase Setup
You will need to run the SQL schemas to create tables for `users`, `profiles`, `workout_sessions`, `workout_sets`, `food_logs`, `weight_logs`, and `progress_photos`.

**Important**: You must create a new Storage Bucket called `bulkmaster-media` within your Supabase dashboard and set up the corresponding `INSERT` and `SELECT` security policies to allow avatar and progress photo uploads. *(See `tutorial_setup.md` for the exact step-by-step)*.

### 4. Installation & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` to launch the BulkMaster ecosystem.

---
*Built for the 1%. Burn out the weakness.*
