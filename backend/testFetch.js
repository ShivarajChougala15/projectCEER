import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.models.js';
import Team from './models/team.models.js'; // Import Team to ensure it is registered

dotenv.config();

const testFetch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Fetching users...');
        const users = await User.find({}).select('-password').populate('teamId');
        console.log(`Fetched ${users.length} users successfully.`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) Team: ${u.teamId}`));

        process.exit();
    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
};

testFetch();
