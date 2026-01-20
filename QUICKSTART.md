# Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB running (local or Atlas)
- Email service credentials (Gmail recommended)

## Setup Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Replace with your connection string
MONGODB_URI=mongodb://localhost:27017/projectCEER

# JWT Secret - Change this to a random string
JWT_SECRET=your_super_secret_jwt_key_change_this

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@kletech.ac.in

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Note for Gmail:**
- Enable 2-factor authentication on your Google account
- Generate an "App Password" from Google Account settings
- Use the app password in EMAIL_PASSWORD field

### 3. Configure Frontend Environment

The `frontend/.env` file should already have:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Creating Initial Users

You'll need to create users before they can login. You can do this via API calls:

### Create Admin User (First)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@kletech.ac.in",
    "role": "admin",
    "department": "Administration"
  }'
```

### Create Other Users

Use the admin dashboard or API to create:
- Students
- Faculty members
- Lab incharge

**Default Passwords:**
- Student: `student@123`
- Faculty: `faculty@123`
- Lab Incharge: `labincharge@123`
- Admin: `admin@123`

## Testing the Workflow

1. **Login as Student** (student@kletech.ac.in / student@123)
   - Create a new BOM request
   - Check that guide receives email

2. **Login as Faculty** (faculty@kletech.ac.in / faculty@123)
   - View pending BOM requests
   - Approve a BOM
   - Check that student and lab incharge receive emails

3. **Login as Lab Incharge** (labincharge@kletech.ac.in / labincharge@123)
   - View guide-approved BOMs
   - Approve the BOM
   - Check that student receives final email

4. **Login as Admin** (admin@kletech.ac.in / admin@123)
   - View system statistics
   - Manage users and teams

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check Atlas connection
- Verify MONGODB_URI in `.env`

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD
- For Gmail, ensure app password is used (not regular password)
- Check spam folder for test emails

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: Vite will prompt to use different port

### CORS Errors
- Ensure backend is running on port 5000
- Check FRONTEND_URL in backend `.env`

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Use production MongoDB URI
4. Configure proper email service
5. Deploy to services like Heroku, Railway, or DigitalOcean

### Frontend
1. Build: `npm run build`
2. Deploy `dist` folder to Vercel, Netlify, or similar
3. Update VITE_API_URL to production backend URL

## Support

For issues or questions:
- Email: lab@kletech.ac.in
- Check README.md for detailed documentation
