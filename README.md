# Project CEER - Exploration Lab Management System

A comprehensive lab inventory and BOM (Bill of Materials) management system for the college exploration lab.

## Features

- **Role-based Access Control**: Student, Faculty, Lab Incharge, and Admin roles
- **BOM Workflow**: Complete approval workflow from student → guide → lab incharge
- **Email Notifications**: Automated notifications at each workflow step
- **Inventory Management**: Track and manage lab materials
- **Team Management**: Organize students into teams with faculty guides
- **Modern UI**: Beautiful, responsive design with glassmorphism and animations

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for email notifications
- bcryptjs for password hashing

### Frontend
- React with Vite
- React Router for navigation
- Axios for API calls
- Modern CSS with gradients and animations

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Email service credentials (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd projectCEER
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Edit `backend/.env` with your credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers**

   Backend (from backend directory):
   ```bash
   npm run dev
   ```

   Frontend (from frontend directory):
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Default Credentials

Users are created with role-based default passwords:
- Student: `student@123`
- Faculty: `faculty@123`
- Lab Incharge: `labincharge@123`
- Admin: `admin@123`

All emails must end with `@kletech.ac.in`

## Workflow

1. **Student** creates a BOM request with material details
2. **Guide** (Faculty) receives email notification and approves/rejects
3. **Lab Incharge** receives guide-approved BOMs and approves/rejects
4. **Student** receives email notifications at each step
5. **Lab Incharge** issues materials after final approval

## Project Structure

```
projectCEER/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & error middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Email service
│   └── server.js        # Entry point
└── frontend/
    ├── public/          # Static assets
    └── src/
        ├── components/  # Reusable components
        ├── context/     # Auth context
        ├── pages/       # Page components
        ├── utils/       # API utilities
        └── App.jsx      # Main app component
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### BOM
- `POST /api/bom` - Create BOM (Student)
- `GET /api/bom` - Get BOMs (role-filtered)
- `PUT /api/bom/:id/guide-approve` - Approve BOM (Faculty)
- `PUT /api/bom/:id/guide-reject` - Reject BOM (Faculty)
- `PUT /api/bom/:id/labincharge-approve` - Approve BOM (Lab Incharge)
- `PUT /api/bom/:id/labincharge-reject` - Reject BOM (Lab Incharge)

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Inventory
- `GET /api/inventory` - Get inventory
- `POST /api/inventory` - Add item (Lab Incharge/Admin)
- `PUT /api/inventory/:id` - Update item
- `PUT /api/inventory/:id/stock` - Update stock

## License

MIT

## Contact

For support, email lab@kletech.ac.in
