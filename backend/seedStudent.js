import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.models.js';

dotenv.config();

const seedStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const studentEmail = 'shiv@kletech.ac.in';
        let user = await User.findOne({ email: studentEmail });

        if (user) {
            // Update password
            user.password = 'student123';
            await user.save();
            console.log('Student password updated');
        } else {
            // Create new student
            user = new User({
                name: 'Shivaraj Chougala',
                email: studentEmail,
                password: 'student123',
                role: 'student',
                department: 'Computer Science',
                isFirstLogin: false
            });
            await user.save();
            console.log('Student user created');
        }

        console.log('\n=== Student Login Credentials ===');
        console.log('Email:', studentEmail);
        console.log('Password: student123');
        console.log('Role: student');
        console.log('================================\n');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedStudent();
