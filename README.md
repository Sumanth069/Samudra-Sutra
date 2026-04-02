<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/waves.svg" width="80" height="80" alt="Samudra Sutra">
  <h1 align="center">Samudra Sutra | BlueTrace Intelligence System 🌊</h1>
  <p align="center">
    <strong>A Devastating Prevention-First Telemetry System for Global Marine Preservation.</strong>
  </p>
  
  <p align="center">
    <a href="https://samudra-sutra.vercel.app/"><img src="https://img.shields.io/badge/Live_Deployment-Vercel-000000?style=for-the-badge&logo=vercel" alt="Deployed on Vercel" /></a>
    <img src="https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Gemini_2.5-Forensics-blue?style=for-the-badge&logo=google" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/Firebase-Core_Ops-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" />
  </p>
</div>

<br />

> "We cannot clean the ocean if the rivers never stop bleeding."

**Samudra Sutra** is an extreme-scale environmental intelligence platform designed to intercept terrestrial waste before it reaches the ocean. By turning citizens into distributed sensor nodes and utilizing **multimodal AI forensics**, this system locates and categorizes pollution signatures globally.

## 🚀 Live Production 

The entire system is globally distributed and running live on the Edge.
Explore the active instance here: **[🔗 samudra-sutra.vercel.app](https://samudra-sutra.vercel.app/)**

**Demo Access Flow:**
1. **Citizen Portal (`/citizen/login`)**: Use your Google Account securely to simulate uploading live waste evidence.
2. **Authority Dashboard (`/login`)**: Use `admin123` to bypass database authentication and view the unified Admin Command Center, complete with real-time maps and incoming evidence galleries!

---

## ⚡ Core Architecture

The operating system for the ocean relies on a brutalist, high-efficiency stack:

- **Hyperlocal Telemetry (Citizen App)**: Users act as distributed sensor nodes, mapping exact GPS coordinates of shoreline anomalies. The system rejects uploaded gallery photos—forcing live camera scans to prevent spoofing.
- **Gemini 2.5 Forensics Engine**: Every uploaded image is pinged to Google's multimodal AI model via serverless Edge functions to determine material composition and ecological severity without human intervention.
- **Tactical Authority Dashboard**: Turns generalized raw data into actionable physical clearance missions. Features live Map overlays, weather analytics, and evidence approval pipelines.
- **Framer Motion Engine**: Utilizes a highly custom 3D mathematical Particle Sphere simulation to represent global telemetry nodes seamlessly linked to system Light/Dark preference schemas.

---

## 🛠 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 19 |
| **Authentication & DB** | Google Firebase (Auth, Firestore) |
| **AI Processing** | `@google/genai` (Gemini Multimodal) |
| **UI Aesthetics** | Tailwind CSS v4, Framer Motion, Radix UI |
| **Mapping & Dataviz** | React-Leaflet, Recharts |
| **Deployment** | Vercel Edge Network |

---

## 💻 Local Development

Clone the intelligence repository and spin up the dashboard locally:

```bash
# 1. Clone the repository
git clone https://github.com/Sumanth069/Samudra-Sutra.git
cd Samudra-Sutra

# 2. Install Dependencies
npm install

# 3. Configure Environmental Variables
# Create a .env.local file in the root directory
# Include your FIREBASE configuration and GEMINI_API_KEY
cat <<EOT >> .env.local
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
GEMINI_API_KEY="..."
EOT

# 4. Launch the telemetry development server
npm run dev
```

Point your browser to `http://localhost:3000` to interact with the local command center!

## 🔐 Security & Infrastructure Note
* Firebase Security rules must be configured in production to safely accept writes to `pollution_reports` and `system_stats`. 
* Vercel domains must explicitly be whitelisted under the **Authentication > Settings > Authorized Domains** rule table inside your Firebase Console to permit secure Google Sign-In.

<div align="center">
  <br />
  <i>Samudra Sutra — Built for extreme-scale environmental preservation.</i>
</div>
