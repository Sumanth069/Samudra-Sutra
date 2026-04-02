# 🌊 Samudra Sutra (BlueTrace Intelligence)

A prevention-first, event-driven marine intelligence platform. Samudra Sutra empowers citizens and marine authorities to track, intercept, and eliminate terrestrial pollution before it ever reaches the ocean. 

Built specifically for live multi-tenant demonstration, tracking dynamic waste pathways via realtime citizen-captured intelligence.

![Samudra Sutra Overview](https://img.shields.io/badge/Status-Live_Demonstration-emerald?style=for-the-badge)

## 🔥 Core Features

- **📸 Citizen Verification Hub:** A mobile-first portal utilizing live-camera snapshot systems (to prevent spoofing) where locals act as the primary intel network. Citizens earn "BlueTrace Credits" securely verified against their Native Google Account.
- **🧠 Gemini Forensic AI Pipeline:** Serverless Next.js API endpoints (`/api/report`) pass citizen snapshots into the `Google Gemini Vision` multimodal AI. The model autonomously calculates the waste's composition, severity, and estimated volume without human intervention.
- **⚡ Firebase Cloud Synchronization:** The entire platform routes through Google Firebase. When an AI verification hits "Success", the client-side Firebase SDK natively pushes the payload directly into NoSQL `Cloud Firestore` collections across all global clients.
- **🗺️ Authority Command Dashboard:** An interactive Control Center containing:
    - **Visual Evidence Gallery:** A dedicated modal exclusively isolating `imageUrl` visual intel.
    - **Map Routing:** Realtime geo-coordinates plotted onto a custom dark-mode CartoDB tracking layer. 
    - **Action Deployment:** Immediate actionable "Deploy Team" tasks natively editing the remote Firebase state. 
- **✨ Micro-Animated UX:** Premium `Framer-Motion` layouts and continuous pulse mechanics dynamically guide the user's eye towards critical warnings.

## 🛠️ Technology Stack

- **Framework:** `Next.js 14` (React / TypeScript)
- **Styling:** `Tailwind CSS`, `Framer Motion`, `Shadcn/UI`
- **Backend & Database:** `Google Firebase` (Authentication, Cloud Firestore)
- **AI Processing:** `@google/genai` (Gemini 2.5 Flash API)
- **Mapping:** `React-Leaflet` 

## 🚀 Getting Started

### 1. Environment Variables
To run this application locally, create a `.env.local` file in the root directory:

```env
# Required for AI forensic analysis
GEMINI_API_KEY="your-gemini-secure-api-key"
```
*(Firebase configuration is strictly defined directly within the `/lib/firebase/client.ts` initialization due to client-side constraint requirements)*

### 2. Development Execution
Install and run the local development Node server:

```bash
npm install
npm run dev
```
Access the primary Authority Dashboard at `http://localhost:3000/admin/dashboard` or test the Google Auth citizen suite at `http://localhost:3000/citizen/login`.

## 🌐 Deployment Infrastructure
Designed specifically for extreme-speed serverless deployment using **Vercel**. By importing the GitHub repository into Vercel and pasting the Environment variables, Vercel natively hooks into the Next.js cache and generates the edge-routed URLs automatically.

---
*Built for the future of our oceans.*
