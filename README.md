# BFHL Assessment - Next.js Monorepo

## Description
This project is a high-performance Next.js application that contains both the React Frontend (App Router UI) and the Node.js REST API (`/api/bfhl`). It implements 100% of the stringent evaluation rules required by the test.

## Execution Requirements
1. Start the development server: `npm run dev`
2. Access the premium glassmorphic UI via `http://localhost:3000`
3. **Testing Endpoints via cURL (Mac/Linux/Git Bash/CMD)**:
```bash
curl -X POST http://localhost:3000/api/bfhl -H "Content-Type: application/json" -d "{\"data\": [\"A->B\", \"A->C\", \"B->D\"]}"
```

**Testing Endpoints via PowerShell (Windows)**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/bfhl" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"data": ["A->B", "A->C", "B->D"]}'
```

## Evaluator Credentials
Configured securely via `.env.local`:
- **user_id**: neveshdivya_01102005
- **email**: nd7621@srmist.edu.in
- **roll_number**: RA2311031010007

## Included Features
- Edge-ready stateless POST handler.
- Strictly handles the *Multi-parent diamond discarding rule*.
- Complete mathematically verified component graph clustering for *DFS pure cycle resolution*.
- Fully responsive dark mode dashboard with beautiful SVG animations and stat tracking.
