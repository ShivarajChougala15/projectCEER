import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.models.js';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const studentEmail = 'shiv@kletech.ac.in';
        const user = await User.findOne({ email: studentEmail });

        if (user) {
            console.log('✅ User found in database!');
            console.log('==================================');
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Department:', user.department);
            console.log('==================================\n');
            console.log('LOGIN CREDENTIALS:');
            console.log('Email: shiv@kletech.ac.in');
            console.log('Password: student123');
            console.log('Role: student (select from dropdown)');
            console.log('==================================\n');
        } else {
            console.log('❌ User NOT found in database!');
            console.log('Run: node seedStudent.js to create the user');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
