import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function (email) {
                    return email.endsWith('@kletech.ac.in');
                },
                message: 'Email must end with @kletech.ac.in',
            },
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['student', 'faculty', 'labincharge', 'admin'],
            required: [true, 'Please specify a role'],
        },
        department: {
            type: String,
            trim: true,
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        },
        isFirstLogin: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
