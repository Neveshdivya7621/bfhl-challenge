
# BFHL Backend & UI Engine
A high-performance algorithmic visualization dashboard and REST API built logically to resolve hierarchical structural boundaries, duplicate paths, and multidimensional cyclic dependencies using JavaScript's Directed/Undirected mathematical abstractions.
## 🚀 Live Environments
- **Frontend Dashboard:** [https://bfhl-srmchallenge.netlify.app](https://bfhl-srmchallenge.netlify.app)
- **REST API Endpoint:** `POST https://bfhl-srmchallenge.netlify.app/api/bfhl`
---
## ⚙️ Architecture & Tech Stack
This project operates via a monolithic **Next.js** framework designed for sub-50ms Edge deployments.
- **Backend Core**: Next.js App Router (Server-side Edge Handlers)
- **Frontend UI**: React 19 + TailwindCSS + Framer Motion (Glassmorphism & Micro-animations)
- **Deployment & Hosting**: Netlify Continuous Deployment Pipeline
---
## 🧠 Logic & Rule Implementation
The fundamental logic strictly executes the BFHL evaluation parameters:
1. **Strict Payload Structure Validity**: Edges evaluate via Regular-Expression bounds removing erroneous looping edges (e.g. `A->A`). Extraneous edges are caught and routed to `invalid_entries`.
2. **First-Parent Constraint (Diamond Pattern Fix)**: Rejections are made silently when a child requests a secondary parent. It locks the topological graph strictly to `in-degree <= 1`, allowing flawless hierarchy mapping without collision.
3. **Pure Cycle Isolation**: If graph components map `in-degree` sums mathematically restricting `Roots = 0`, the application triggers a topological cycle exception, isolating that local graph branch logically.
4. **Depth Traversal**: Max distance bounds are recursively mapped using [O(V+E)](cci:1://file:///C:/Users/nevesh/Desktop/bajaj/bfhl-app/app/api/bfhl/route.ts:14:0-192:1) complexity to break ties alphabetically. 
---
## 🧪 Testing the API
You can test the Edge API directly locally or via the deployment link using **cURL**.
**(Mac / Linux / Command Prompt)**:
```bash
curl -X POST https://bfhl-srmchallenge.netlify.app/api/bfhl \
  -H "Content-Type: application/json" \
  -d "{\"data\": [\"A->B\", \"A->C\", \"B->D\"]}"
(Windows PowerShell):

powershell
Invoke-RestMethod -Uri "https://bfhl-srmchallenge.netlify.app/api/bfhl" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"data": ["A->B", "A->C", "B->D"]}'
🛠 Running Locally
To evaluate the mathematical grouping engine natively on your local machine:

1. Install Dependencies

bash
npm install
2. Hydrate Variables Create a .env.local file at the root initialized with your evaluator credentials:

env
USER_FULLNAME=john_doe
USER_DOB=01012000
USER_EMAIL=john@college.edu
USER_ROLL_NUMBER=12345678
3. Boot the Next.js Server

bash
npm run dev
Access the interactive glassmorphic dashboard via http://localhost:3000.

Created for the SRM Bajaj Finserv Health Limited Assessment.
