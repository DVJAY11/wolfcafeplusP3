## ☁️ To run the project without any hassle, do:

git clone https://github.com/RishithaRamesh/WolfCafePlus.git
npm install --prefix backend
npm install --prefix frontend
npm start


## ☁️ Deployment Guide (Render — No Docker)

### 1. Prepare the Project
Ensure the repository follows this structure:
wrikicafe/
├── backend/
│ ├── server.js
│ ├── package.json
├── frontend/
│ ├── vite.config.js
│ ├── package.json
├── INSTALL.md
├── DOCUMENTATION.md
└── README.md


###  Verify your backend is configured to serve the frontend build if needed:
app.use(express.static("../frontend/dist"));

###  Deploy the Backend on Render
Visit Render → click “New → Web Service.”
Connect your GitHub repository.
Under Root Directory, select backend/.

### Set:
Build Command: npm install
Start Command: npm start
Add environment variables:


MONGODB_URI = your_mongo_connection_string
NODE_ENV = production
Click Deploy.
Render will host your backend API (e.g., https://wrikicafe-backend.onrender.com).

### Deploy the Frontend on Render
Click “New → Static Site.”
Connect the same GitHub repository.
Under Root Directory, select frontend/.

Set:
Build Command: npm run build
Publish Directory: dist/
Add an environment variable:


VITE_API_BASE_URL = https://wrikicafe-backend.onrender.com/api
Click Deploy.
Your frontend will be available at https://wrikicafe.onrender.com.

### Connect Frontend and Backend
Update src/api/axios.js (or equivalent):

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});
