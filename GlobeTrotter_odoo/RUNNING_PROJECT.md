# Running GlobeTrotter Project

## Prerequisites
- Node.js installed (v18+)
- Python installed (v3.10+)
- Dependencies installed (see DEPENDENCIES.md)

---

## Running in Development Mode

### Option 1: Run Both Servers (Recommended)

#### Terminal 1 - Start Backend Server
```bash
cd f:\GlobeTrotter_odoo\back_rent
set PYTHONPATH=f:\GlobeTrotter_odoo\back_rent
python -m uvicorn doc.main:app --reload --host 127.0.0.1 --port 8000
```

**Backend will be available at:**
- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

#### Terminal 2 - Start Frontend Server
```bash
cd f:\GlobeTrotter_odoo
npm run dev
```

**Frontend will be available at:**
- Local: `http://localhost:5175`
- Network: View in terminal output

---

### Option 2: Run Frontend Only (if backend is running elsewhere)
```bash
cd f:\GlobeTrotter_odoo
npm run dev
```

### Option 3: Run Backend Only (if frontend is built)
```bash
cd f:\GlobeTrotter_odoo\back_rent
set PYTHONPATH=f:\GlobeTrotter_odoo\back_rent
python -m uvicorn doc.main:app --reload --host 127.0.0.1 --port 8000
```

---

## Building for Production

### Build Frontend
```bash
cd f:\GlobeTrotter_odoo
npm run build
```

Output will be in `dist/` folder

### Preview Production Build
```bash
cd f:\GlobeTrotter_odoo
npm run preview
```

---

## Other Useful Commands

### Lint Frontend Code
```bash
cd f:\GlobeTrotter_odoo
npm run lint
```

### Check Project Structure
- Frontend source: `src/`
- Backend source: `back_rent/doc/`
- Configuration files: Root directory

---

## Troubleshooting

### Backend Module Import Error
If you get `ModuleNotFoundError: No module named 'doc'`:
- Ensure PYTHONPATH is set to `back_rent` directory
- Run command from the correct directory or set full module path

### Frontend Port Already in Use
If port 5175 is already in use:
```bash
npm run dev -- --port 5176
```

### Backend Port Already in Use
Change the port:
```bash
python -m uvicorn doc.main:app --reload --host 127.0.0.1 --port 8001
```

### Dependencies Not Found
Reinstall dependencies:
```bash
# Frontend
npm install

# Backend
pip install -r requirements.txt
```

---

## Hot Reload
Both servers support hot reload:
- **Frontend (Vite)**: Automatically reloads on file changes
- **Backend (Uvicorn)**: Automatically reloads with `--reload` flag

---

## Environment Setup (If Needed)

Create `.env` file in `back_rent/` directory for configuration:
```
DATABASE_URL=mysql://user:password@localhost/globetrotter
JWT_SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
