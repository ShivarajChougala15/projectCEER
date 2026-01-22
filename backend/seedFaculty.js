import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.models.js';

dotenv.config();

const seedFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const facultyEmail = 'shivaraj@kletech.ac.in';
        let user = await User.findOne({ email: facultyEmail });

        if (user) {
            // Update password
            user.password = 'faculty@123';
            await user.save();
            console.log('Faculty password updated');
        } else {
            // Create new faculty
            user = new User({
                name: 'Shivaraj Chougala',
                email: facultyEmail,
                password: 'faculty@123',
                role: 'faculty',
                department: 'Computer Science',
                isFirstLogin: false
            });
            await user.save();
            console.log('Faculty user created');
        }

        console.log('\n=== Faculty Login Credentials ===');
        console.log('Email:', facultyEmail);
        console.log('Password: faculty@123');
        console.log('Role: faculty');
        console.log('=================================\n');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedFaculty();
