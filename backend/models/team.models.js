import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: [true, 'Please provide a team name'],
            unique: true,
            trim: true,
        },
        projectTitle: {
            type: String,
            required: [true, 'Please provide a project title'],
            trim: true,
        },
        projectDescription: {
            type: String,
            trim: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        guide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please assign a guide to the team'],
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model('Team', teamSchema);

export default Team;
