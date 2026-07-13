# Architecture

## Pattern
- Static Frontend + Serverless Backend
- HTML/CSS/JS talks to Apps Script Web App via `fetch` POST.

## Data Flow
1. User submits form on HTML page (`js/main.js` intercepts).
2. Data POSTed to Google Apps Script (`Code.gs` via `doPost`).
3. Apps Script appends row to Google Sheet (`Leads`).
4. Apps Script triggers emails (`sendResourceEmail`, `sendAlertEmail`).

## Entry Points
- Frontend: HTML pages (`index.html`, `10k-roadmap.html`, etc.)
- Backend: `apps-script/Code.gs` (`doPost`)
