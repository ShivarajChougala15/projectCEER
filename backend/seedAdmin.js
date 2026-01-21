import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.models.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@kletech.ac.in';
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            // Update password
            user.password = 'admin@123';
            await user.save();
            console.log('Admin password updated');
        } else {
            // Create new admin
            user = new User({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin@123',
                role: 'admin',
                department: 'Administration',
                isFirstLogin: false
            });
            await user.save();
            console.log('Admin user created');
        }

        console.log('Email:', adminEmail);
        console.log('Password: admin@123');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedAdmin();
