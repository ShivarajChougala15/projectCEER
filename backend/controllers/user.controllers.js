import User from '../models/user.models.js';
import '../models/team.models.js'; // Ensure Team model is registered for population

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
    try {
        const { role } = req.query;

        const filter = role ? { role } : {};

        const users = await User.find(filter).select('-password').populate('teamId').sort('name');

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('teamId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
    try {
        const { name, email, role, department } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Set default password based on role
        const defaultPassword = `${role}@123`;

        const user = await User.create({
            name,
            email,
            password: defaultPassword,
            role,
            department,
        });

        res.status(201).json({
            success: true,
            message: `User created with default password: ${defaultPassword}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, teamId } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.department = department || user.department;
        user.teamId = teamId || user.teamId;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                teamId: user.teamId,
            },
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
export const resetPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Reset to default password
        const defaultPassword = `${user.role}@123`;
        user.password = defaultPassword;
        user.isFirstLogin = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: `Password reset to: ${defaultPassword}`,
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get available students (not assigned to any team)
// @route   GET /api/users/available-students
// @access  Private (Faculty, Admin)
export const getAvailableStudents = async (req, res) => {
    try {
        // Find all students who don't have a teamId
        const availableStudents = await User.find({
            role: 'student',
            $or: [
                { teamId: null },
                { teamId: { $exists: false } }
            ]
        })
            .select('_id name email department')
            .sort('name');

        res.status(200).json({
            success: true,
            count: availableStudents.length,
            students: availableStudents,
        });
    } catch (error) {
        console.error('Error in getAvailableStudents:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
