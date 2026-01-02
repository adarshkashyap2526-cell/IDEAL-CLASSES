# Backend Server Setup Guide

## Overview
The backend server provides secure API endpoints for your IDEAL CLASSES application using Node.js and Express with environment variable configuration.

## Features
✅ Secure Supabase connection using service role key  
✅ Admin authentication with token validation  
✅ File upload/download management  
✅ RESTful API endpoints  
✅ CORS enabled for frontend communication  
✅ Environment variable support  

## Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Supabase project created

## Installation

### 1. Install Dependencies
```bash
cd /workspaces/IDEAL-CLASSES
npm install
```

### 2. Setup Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=https://hpudpcwmqmquwdcnbfni.supabase.co
SUPABASE_KEY=your_service_role_key_here
PORT=3000
ADMIN_TOKEN=your_secure_admin_token_here
VITE_API_URL=http://localhost:3000
```

### Getting Supabase Service Role Key
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Project → Settings → API
3. Copy the **Service Role Secret** (NOT the anon key)
4. Paste into `.env` as `SUPABASE_KEY`

⚠️ **NEVER commit `.env` file to git!**

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### 1. Health Check
```
GET /api/health
Response: { status: "Server is running", timestamp: "..." }
```

### 2. Get All Content
```
GET /api/content
Response: { success: true, data: [...] }
```

### 3. Get Content by Board & Class
```
GET /api/content/:board/:class
Example: GET /api/content/CBSE/Class%2010
Response: { success: true, data: [...] }
```

### 4. Create Content (Admin Only)
```
POST /api/content
Headers: { "adminToken": "your_admin_token" }
Body: {
  "type": "quiz",
  "title": "Science Test",
  "link": "https://...",
  "board": "CBSE",
  "class": "Class 10",
  "time": "30",
  "marks": "20"
}
Response: { success: true, data: [...] }
```

### 5. Delete Content (Admin Only)
```
DELETE /api/content/:id
Headers: { "adminToken": "your_admin_token" }
Response: { success: true, message: "Content deleted successfully" }
```

### 6. Upload File (Admin Only)
```
POST /api/upload
Headers: { "adminToken": "your_admin_token" }
Body: {
  "fileName": "notes.pdf",
  "fileContent": "base64_encoded_file_content"
}
Response: {
  success: true,
  fileName: "notes.pdf",
  storagePath: "1234567890-notes.pdf",
  publicUrl: "https://..."
}
```

### 7. Get Random Quote
```
GET /api/quotes
Response: { success: true, quote: "..." }
```

## Frontend Integration

### Option 1: Update Frontend to Use Backend

Replace your `config.js`:
```javascript
// Use backend API instead of direct Supabase
const API_URL = 'http://localhost:3000';
const ADMIN_TOKEN = 'your_admin_token_here'; // Or get from localStorage

// Example: Get content
async function loadContent() {
    const response = await fetch(`${API_URL}/api/content`);
    const data = await response.json();
    return data;
}
```

### Option 2: Keep Frontend Direct Connection

If you want to keep the browser-based connection working alongside the backend, ensure:
1. Frontend uses anon key (current setup)
2. Backend uses service role key (for admin operations)

## Security Best Practices

### For Production Deployment
1. **Secure Admin Token**
   - Use strong, random tokens
   - Store in environment variables
   - Rotate regularly

2. **Environment Variables**
   - Never commit `.env` to git
   - Add `.env` to `.gitignore`
   - Use secrets management for production

3. **CORS Configuration**
   - Restrict to specific frontend domains
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

4. **Rate Limiting**
   - Add express-rate-limit for production
   - Prevent brute force attacks

5. **Input Validation**
   - Validate all request data
   - Sanitize file uploads

## Deployment Options

### Heroku
```bash
# Install Heroku CLI
# heroku login
# heroku create your-app-name
# git push heroku main
```

### Vercel
```bash
# vercel deploy
```

### Railway
```bash
# railway up
```

### Self-hosted (VPS/Cloud)
1. Install Node.js on server
2. Upload code
3. Setup PM2 for process management
4. Use Nginx as reverse proxy

## Troubleshooting

### "SUPABASE_KEY environment variable not set"
→ Check your `.env` file has `SUPABASE_KEY` with valid service role key

### "Cannot find module 'express'"
→ Run `npm install`

### CORS errors from frontend
→ Verify CORS is enabled and frontend URL is allowed

### 401 Unauthorized on admin endpoints
→ Check `ADMIN_TOKEN` header matches `.env` value

## Next Steps

1. Update your frontend to use these API endpoints (optional)
2. Deploy to production server
3. Update frontend API URLs to point to production server
4. Test all endpoints with Postman or curl

## Example curl Commands

```bash
# Get all content
curl http://localhost:3000/api/content

# Get quotes
curl http://localhost:3000/api/quotes

# Create content (with admin token)
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -H "adminToken: your_secure_admin_token_here" \
  -d '{"type":"quiz","title":"Test","link":"https://...","board":"CBSE","class":"Class 10"}'

# Delete content
curl -X DELETE http://localhost:3000/api/content/123 \
  -H "adminToken: your_secure_admin_token_here"
```
