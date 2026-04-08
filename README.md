# 🏎️ Antigravity AutoRent Platform

A high-fidelity car rental landing page and management system inspired by the "Antigravity" modern design aesthetic. Featuring immersive scroll-triggered animations, a real-time Content Management System (CMS), and secure role-based authentication.

## 🚀 Teck Stack
- **Frontend**: React (Vite), Tailwind CSS (v4), Framer Motion, Lucide React, **Iconify**.
- **Backend**: Supabase (PostgreSQL, Authentication).
- **Styling**: Minimalist, full-bleed design with high-fidelity "Halo Glow" effects.
- **Icons**: Lucide React + Multi-set icons via `@iconify/react`.

---

## 🔐 System Credentials
These credentials are provided for testing and development purposes.

| User Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@autorent.com` | `admin123` |
| **Staff Employee** | `employee@autorent.com` | `employee123` |

---

## ✨ Key Features

### 1. Immersive User Experience
- **Scroll-Scale Fleet Showcase**: A full-screen window that expands as you scroll, providing a premium "app-within-a-site" feeling.
- **Dynamic Typewriter Hero**: Headlines that adapt to your brand personality.
- **6-Pillar Showcase**: Interactive, high-fidelity feature blocks (Concierge, Pricing, Delivery, etc.).

### 2. Control Center (Admin Dashboard)
- **Fleet Management**: Real-time management of vehicles and rental availability.
- **Landing Page CMS**: (Admin Only) Edit the website headlines, typewriter words, and heritage text directly from the dashboard. Changes are saved permanently to Supabase.

### 3. Security & Profile Management
- **Role-Based Access**: Specialized views for Admins vs. Employees.
- **Gmail Confirmation Flow**: 
  - Any change to an email address or password triggers a secure link to the user's **Gmail**.
  - Credential updates are **pending** and restricted until the Gmail link is verified.

---

## 🛠️ Setup & Maintenance

### Frontend
1. Navigate to `/frontend`
2. Run `npm install`
3. Launch with `npm run dev`

### Backend (Admin Utilities)
The system includes utility scripts for database management:
- `node backend/run_schema.js`: Rebuilds the database tables and initial data.
- `node backend/init_users.js`: Re-initializes the default Admin and Employee accounts.

### Database
Powered by **Supabase**. Ensure your `.env` files in both `frontend` and `backend` are configured with your `SUPABASE_URL` and keys.

---

## ⚖️ License
Internal Development - Antigravity AutoRent © 2026
