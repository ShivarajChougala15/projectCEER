import Team from '../models/team.models.js';
import User from '../models/user.models.js';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members', 'name email')
            .populate('guide', 'name email')
            .sort('teamName');

        res.status(200).json({
            success: true,
            count: teams.length,
            teams,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
export const getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('members', 'name email department')
            .populate('guide', 'name email department');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.status(200).json({
            success: true,
            team,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Admin, Faculty)
export const createTeam = async (req, res) => {
    try {
        const { teamName, projectTitle, projectDescription, members, guide } = req.body;

        // Check if team name already exists
        const teamExists = await Team.findOne({ teamName });

        if (teamExists) {
            return res.status(400).json({ message: 'Team name already exists' });
        }

        // Verify guide is a faculty member
        const guideUser = await User.findById(guide);
        if (!guideUser || guideUser.role !== 'faculty') {
            return res.status(400).json({ message: 'Guide must be a faculty member' });
        }

        // Verify all members are students
        const memberUsers = await User.find({ _id: { $in: members } });
        const allStudents = memberUsers.every((user) => user.role === 'student');

        if (!allStudents) {
            return res.status(400).json({ message: 'All team members must be students' });
        }

        const team = await Team.create({
            teamName,
            projectTitle,
            projectDescription,
            members,
            guide,
        });

        // Update team members with teamId
        await User.updateMany({ _id: { $in: members } }, { teamId: team._id });

        const populatedTeam = await Team.findById(team._id)
            .populate('members', 'name email')
            .populate('guide', 'name email');

        res.status(201).json({
            success: true,
            message: 'Team created successfully',
            team: populatedTeam,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin, Faculty)
export const updateTeam = async (req, res) => {
    try {
        const { teamName, projectTitle, projectDescription, members, guide, status } = req.body;

        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Remove teamId from old members
        if (members) {
            await User.updateMany({ teamId: team._id }, { $unset: { teamId: 1 } });
        }

        team.teamName = teamName || team.teamName;
        team.projectTitle = projectTitle || team.projectTitle;
        team.projectDescription = projectDescription || team.projectDescription;
        team.members = members || team.members;
        team.guide = guide || team.guide;
        team.status = status || team.status;

        await team.save();

        // Update new members with teamId
        if (members) {
            await User.updateMany({ _id: { $in: members } }, { teamId: team._id });
        }

        const populatedTeam = await Team.findById(team._id)
            .populate('members', 'name email')
            .populate('guide', 'name email');

        res.status(200).json({
            success: true,
            message: 'Team updated successfully',
            team: populatedTeam,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Remove teamId from members
        await User.updateMany({ teamId: team._id }, { $unset: { teamId: 1 } });

        await team.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Team deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my team (for logged-in student)
// @route   GET /api/teams/my-team
// @access  Private (Student)
export const getMyTeam = async (req, res) => {
    try {
        // Find team where the current user is a member
        const team = await Team.findOne({ members: req.user._id })
            .populate('members', 'name email department')
            .populate('guide', 'name email department');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'You are not assigned to any team yet'
            });
        }

        res.status(200).json({
            success: true,
            team,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
