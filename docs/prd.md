# WhatsApp Dispatcher Premium - Product Requirements Document (PRD)

## 1. Goals and Background Context

### Goals
- Implement a robust WhatsApp messaging engine using `whatsapp-web.js`.
- Provide a high-end, premium dashboard with real-time feedback (Socket.io).
- Enable secure, anti-ban messaging through intelligent delay systems.
- Create a user-friendly interface for managing contacts and campaigns.

### Background Context
The project aims to solve the problem of complex or unreliable WhatsApp automation tools by providing a "Premium" developer-centric but user-friendly tool. It leverages the AIOX framework to ensure high quality and story-driven progress.

### Change Log
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-03-10 | 0.1.0 | Initial PRD draft | @pm (Morgan/Aiox-master) |

## 2. Requirements

### Functional (FR)
- **FR1:** The system must display a WhatsApp QR Code for authentication via WebSockets.
- **FR2:** The system must show the connection status (Disconnected, Waiting, Connected).
- **FR3:** Users must be able to send individual messages to a specific number.
- **FR4:** Users must be able to import a list of contacts (CSV/Excel) for mass messaging.
- **FR5:** Intelligent Delay System: Min/Max delay between messages and batching intervals (break after X messages).
- **FR6:** Real-time reporting showing Sent, Failed, and Pending status.
- **FR7:** Export sending reports to CSV/XLSX.
- **FR8:** Message templates with variable support ({nome}, {var1}, etc).

### Non-Functional (NFR)
- **NFR1:** The UI must follow "Premium" design standards (Dark mode, Glassmorphism).
- **NFR2:** The backend must be container-ready (Docker).
- **NFR3:** Real-time updates must have a latency of less than 500ms.

## 3. User Interface Design Goals

### UX Vision
A "Mission Control" style dashboard that feels powerful yet elegant. Dark backgrounds with vibrant green accents (`#25d366`).

### Core Screens
- **Auth Screen:** Minimalist screen with QR Code.
- **Main Dashboard:** Statistics, connection status, and quick send.
- **Campaign Manager:** Table for contacts and message composer.

### Target Platforms
- Web Responsive (Primary: Desktop).

## 4. Technical Assumptions

- **Language:** TypeScript/JavaScript.
- **Frontend:** Next.js 15 (App Router).
- **Backend:** Node.js, Express, Socket.io.
- **WA Engine:** `whatsapp-web.js` (Puppeteer).
- **Repository:** Monorepo/Standard structure (`/backend`, `/frontend`).

## 5. Epic List

- **Epic 1: Foundation & WhatsApp Engine:** Setup infrastructure and QR Code authentication.
- **Epic 2: Bulk Messaging Engine:** Intelligent delay system and batching logic.
- **Epic 3: Campaign & Lists:** File upload (CSV/Excel) and contact parsing.
- **Epic 4: Reporting & Export:** Live dashboard tracking and file export.

## 6. Epic 1: Foundation & WhatsApp Engine

### Story 1.1: Project Setup & WA Integration
As a developer, I want to initialize the backend with `whatsapp-web.js` and local authentication, so that I can maintain a persistent WhatsApp session.
- **AC1:** Backend initializes `whatsapp-web.js` with `LocalAuth`.
- **AC2:** Backend emits `qr` event via Socket.io when needing authentication.
- **AC3:** Backend emits `ready` event when authenticated.

### Story 1.2: Premium Auth UI
As a user, I want to scan a QR Code on a beautiful glassmorphic interface, so that I can connect my WhatsApp account.
- **AC1:** Frontend displays QR Code received via WebSockets.
- **AC2:** UI indicates "Waiting for Scan" and "Connected" states.
- **AC3:** Design matches Premium design tokens (globals.css).

---
— Orion, orquestrando o sistema 🎯
