# 🔐 Security Setup Guide

## ⚠️ CRITICAL: Change Your Admin Credentials

Your current credentials are **exposed in the code**:
- Email: `admin@idealclasses.com`
- Password: `Bunny@2526`

**CHANGE THESE IMMEDIATELY!**

---

## Option 1: Quick Fix (Development Only)

Edit `config.js` and change the hardcoded values:
```javascript
const ADMIN_EMAIL = 'your_new_email@example.com';
const ADMIN_PASSWORD = 'your_super_strong_password_123!';
```

Generate a strong password:
```bash
# Linux/Mac - Copy the generated password
openssl rand -base64 12
```

---

## Option 2: Best Practice (Recommended)

### Step 1: Create/Update `.env` File

Create a `.env` file in your project root (do NOT commit to git):
```env
VITE_ADMIN_EMAIL=your_secure_email@example.com
VITE_ADMIN_PASSWORD=YourSuperSecurePassword123!@
```

### Step 2: Update config.js to Use Environment Variables

For **Vite-based projects**:
```javascript
// Admin Credentials - From environment variables
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@idealclasses.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Bunny@2526';
```

For **Regular HTML/JS projects**, use a script to load .env:
```javascript
// Add this in a separate config-loader.js
async function loadConfig() {
    const response = await fetch('/.env.local');
    const text = await response.text();
    const lines = text.split('\n');
    const config = {};
    
    lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            window[key] = value.trim();
        }
    });
}

loadConfig();
```

### Step 3: Add .gitignore Entry

Make sure `.env` is NOT committed to git:
```
.env
.env.local
.env.*.local
node_modules/
```

### Step 4: Use Environment Variables in Code

```javascript
// Instead of hardcoding:
// ❌ const ADMIN_EMAIL = 'admin@idealclasses.com';
// ✅ Use environment variables
```

---

## Option 3: Backend Authentication (Most Secure)

Move authentication to your backend server (`server.js`):

### Backend (server.js):
```javascript
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = generateToken(); // Create JWT
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});
```

### Frontend (main.js):
```javascript
async function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pass').value;
    
    const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
        localStorage.setItem('adminToken', data.token);
        // ... continue with login
    }
}
```

---

## Strong Password Guidelines

✅ **Use at least 16 characters**
✅ **Mix uppercase, lowercase, numbers, symbols**
✅ **Avoid common words or personal info**
✅ **Use a password manager** (1Password, Dashlane, etc.)

### Example Strong Passwords:
- `Kx9$mP2@vL7nQ4#`
- `BlueSky#Mountain2024!@`
- `SecureAcademyPass#2024`

### Password Generators:
- [Random.org Password Generator](https://www.random.org/passwords/)
- `openssl rand -base64 16`
- Your password manager's generator

---

## Checklist: Securing Your App

- [ ] Change `ADMIN_EMAIL` in config.js
- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Create `.env` file with secure credentials
- [ ] Add `.env` to `.gitignore`
- [ ] Remove `ADMIN_EMAIL` and `ADMIN_PASSWORD` from config.js
- [ ] Use environment variables instead
- [ ] Test admin login still works
- [ ] Delete/revoke old credentials from anywhere they're stored
- [ ] Never commit `.env` to git
- [ ] Use backend authentication for production

---

## For Deployed App (Production)

1. **Use Environment Secrets**
   - Heroku: Settings → Config Vars
   - Vercel: Settings → Environment Variables
   - Railway: Variables section

2. **Never expose secrets in code**
   - Use backend endpoints for auth
   - Implement JWT tokens
   - Use OAuth/SSO if possible

3. **Monitor Access**
   - Review login attempts
   - Set up alerts for failed logins
   - Use Supabase audit logs

4. **Rotate Credentials Regularly**
   - Change passwords monthly
   - Rotate API keys quarterly
   - Review access permissions

---

## Testing

After changing credentials:

```bash
# Test admin login in browser console:
console.log(ADMIN_EMAIL); // Should show new email
console.log(ADMIN_PASSWORD); // Should show new password
```

Then try logging in with new credentials to ensure it works!

---

## Need Help?

- GitHub Security Docs: https://docs.github.com/en/code-security
- Supabase Security: https://supabase.com/docs/guides/self-hosting/security
- OWASP Security: https://owasp.org/www-project-top-ten/
