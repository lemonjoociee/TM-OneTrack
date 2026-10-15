# NOC & OPS Management Portal

A unified, production-ready enterprise operations management portal that combines the operational depth of the **NOC Operational Dashboard** with the streamlined executive reporting of the **TM Issue Tracker**.

Driven by **Local AI (Ollama)** to autonomously read and parse emails regarding Nubitel issues from Outlook and WhatsApp workgroups, updating both NOC and OPS views in real time.

---

## 1. System Overview

### Core Architecture
- **Single Login Page**: Automatic role resolution upon authentication (Admin, NOC, OPS) with Remember Me and password recovery.
- **Local AI Ingestion Engine (Ollama)**:
  - Replaces external cloud connectors with private, on-premise AI via Ollama (`http://localhost:11434`, using models like `llama3`, `mistral`, or `qwen2.5`).
  - Scans designated Outlook mailboxes (`tmnoc@scicom.com.my` / `Inbox/Nubitel Issues`).
  - Ingests and cross-references WhatsApp group logs (`TM - NOC Internal`, `Scicom IT & TM UCC Ops Escalation`, `TM - NOC & OPS`).
  - Autonomously generates AI issue summaries, detects root causes, flags 15-minute response deadlines, and identifies next actions.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Complete system clearance (Admin Console, User Management, Invitations, Settings, NOC Dashboard, OPS Dashboard).
  - **NOC**: Operational workspace (What's New timeline, 15-minute response queue, Tickets log with conversation drawers, Asset tracking, WhatsApp workgroup monitoring, How-To operational SOPs, NOC performance metrics).
  - **OPS**: Executive 10-second summary (Dynamic Year & Month filters, 5 large KPI cards with YoY comparisons, Operations Health indicator, 3 clean Recharts widgets, dynamic categories/sites, SLA summary, and filtered issue tables with CSV/Excel export).
- **Protected Routes**: Hardened URL route guards that prevent unauthorized access or manual URL tampering, redirecting to an Access Denied view.
- **Theme Support**: Seamless Light, Dark, and System modes persisted in `localStorage`.

---

## 2. Environment Variables (`.env`)

The `.env` file is pre-configured with local defaults:

```ini
# Base Application URL
VITE_APP_URL=https://tmissuetracker.netlify.app

# Local AI Engine (Ollama)
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_OLLAMA_MODEL=llama3

# Local Folders for Ingestion
VITE_OUTLOOK_SCAN_FOLDER=Inbox/Nubitel Issues
VITE_WHATSAPP_FOLDER=C:\Users\fayiz.m\NOC Tracker v4\WhatsApp

# Standalone / Sample Mode
# Set to 'true' to use verified test data alongside local scans
# Set to 'false' to connect exclusively to your live Ollama daemon
VITE_USE_SAMPLE_DATA=true

# Scan Interval in Minutes
VITE_AUTO_SCAN_INTERVAL=15

# API Endpoint
VITE_API_BASE_URL=/.netlify/functions/ollama-sync
```

---

## 3. Demo Credentials (Testing & QA)

For initial evaluation and development testing, three verified demo accounts are provided:

| Role | Email / Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@scicom-tm.portal` (`admin`) | `AdminPass2026!` | Admin Console, NOC, OPS, Users, Settings |
| **NOC** | `noc@scicom-tm.portal` (`noc_agent`) | `NocPass2026!` | NOC Operations Workspace only |
| **OPS** | `ops@scicom-tm.portal` (`ops_lead`) | `OpsPass2026!` | OPS Executive Summary & Reports only |

---

## 4. Running Local AI (Ollama)

1. **Install & Start Ollama**:
   ```bash
   # Download Ollama from https://ollama.com
   ollama serve
   ```
2. **Pull Preferred Model**:
   ```bash
   ollama pull llama3
   # or
   ollama pull mistral
   ```
3. **Run the Portal**:
   ```bash
   npm run dev
   ```
4. In the portal, navigate to **Settings** & click **Test Ollama Connection** to verify connectivity with your local daemon.
