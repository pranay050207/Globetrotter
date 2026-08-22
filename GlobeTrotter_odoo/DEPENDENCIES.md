# GlobeTrotter Project Dependencies

## Frontend Dependencies (Node.js/npm)

### Production Dependencies
- `react` (^18.3.1) - UI library
- `react-dom` (^18.3.1) - React DOM rendering
- `react-router-dom` (^7.8.0) - Client-side routing
- `axios` (^1.11.0) - HTTP client
- `@types/react` (^18.3.5) - React TypeScript types
- `@types/react-dom` (^18.3.0) - React DOM TypeScript types
- `@types/react-router-dom` (^5.3.3) - React Router TypeScript types
- `@types/leaflet` (^1.9.20) - Leaflet map library types
- `leaflet` (^1.9.4) - Interactive maps library
- `react-leaflet` (^4.2.1) - React wrapper for Leaflet
- `tailwindcss` (^3.4.1) - Utility-first CSS framework
- `chart.js` (^4.5.0) - Charting library
- `react-chartjs-2` (^5.3.0) - React wrapper for Chart.js
- `framer-motion` (^12.23.12) - Animation library
- `lucide-react` (^0.344.0) - Icon library
- `emailjs-com` (^3.2.0) - Email service integration

### Development Dependencies
- `vite` (^5.4.2) - Build tool and dev server
- `@vitejs/plugin-react` (^4.3.1) - Vite React plugin
- `typescript` (^5.5.3) - TypeScript compiler
- `eslint` (^9.9.1) - JavaScript linter
- `@eslint/js` (^9.9.1) - ESLint JavaScript rules
- `eslint-plugin-react-hooks` (^5.1.0-rc.0) - React hooks linter
- `eslint-plugin-react-refresh` (^0.4.11) - React refresh plugin
- `tailwindcss` (^3.4.1) - Tailwind CSS
- `postcss` (^8.4.35) - CSS processor
- `autoprefixer` (^10.4.18) - PostCSS autoprefixer

## Backend Dependencies (Python/pip)

### Core Framework
- `fastapi` - Modern Python web framework
- `uvicorn[standard]` - ASGI server for FastAPI

### Database
- `sqlalchemy` - SQL toolkit and ORM
- `pymysql` - MySQL client
- `mysqlclient` - Another MySQL client
- `mysql-connector-python` - Official MySQL connector

### Authentication & Security
- `passlib[bcrypt]==1.7.4` - Password hashing
- `bcrypt==3.2.2` - Cryptographic library
- `python-jose[cryptography]` - JWT token handling
- `python-multipart` - Multipart form data handling

### Configuration & Environment
- `python-dotenv` - Load environment variables
- `pydantic[email]` - Data validation
- `pydantic-settings` - Settings management

### File Handling & Cloud
- `cloudinary` - Cloud image storage and CDN

### Testing & API Documentation
- `pytest` - Testing framework
- `httpx` - Async HTTP client for testing

### Email Services
- `brevo-python` - Brevo email service SDK
- `sib_api_v3_sdk` - Sendinblue email service SDK

## System Requirements

- **Node.js**: v18+ (includes npm)
- **Python**: v3.10+
- **Database**: MySQL 5.7+ (or SQLite for development)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## Installation Instructions

### Frontend Setup
```bash
cd f:\GlobeTrotter_odoo
npm install
```

### Backend Setup
```bash
cd f:\GlobeTrotter_odoo\back_rent
pip install -r requirements.txt
```
