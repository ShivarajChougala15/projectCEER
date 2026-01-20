import BOM from '../models/bom.models.js';
import Team from '../models/team.models.js';
import User from '../models/user.models.js';
import {
    sendBOMRequestToGuide,
    sendApprovalToStudent,
    sendBOMToLabIncharge,
    sendRejectionToStudent,
} from '../services/email.services.js';

// @desc    Create new BOM
// @route   POST /api/bom
// @access  Private (Student)
export const createBOM = async (req, res) => {
    try {
        const { materials } = req.body;

        // Get student's team
        const team = await Team.findOne({ members: req.user._id }).populate('guide');

        if (!team) {
            return res.status(400).json({ message: 'You are not assigned to any team' });
        }

        // Create BOM
        const bom = await BOM.create({
            team: team._id,
            createdBy: req.user._id,
            materials,
        });

        // Send email to guide
        await sendBOMRequestToGuide(team.guide, req.user, team, bom);

        res.status(201).json({
            success: true,
            message: 'BOM created successfully and sent to guide for approval',
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all BOMs (filtered by role)
// @route   GET /api/bom
// @access  Private
export const getBOMs = async (req, res) => {
    try {
        let boms;

        if (req.user.role === 'student') {
            // Students see their team's BOMs
            const team = await Team.findOne({ members: req.user._id });
            if (!team) {
                return res.status(200).json({ success: true, boms: [] });
            }
            boms = await BOM.find({ team: team._id })
                .populate('team')
                .populate('createdBy', 'name email')
                .populate('guideApprovedBy', 'name email')
                .populate('labinchargeApprovedBy', 'name email')
                .sort('-createdAt');
        } else if (req.user.role === 'faculty') {
            // Faculty see BOMs from their teams
            const teams = await Team.find({ guide: req.user._id });
            const teamIds = teams.map((team) => team._id);
            boms = await BOM.find({ team: { $in: teamIds } })
                .populate('team')
                .populate('createdBy', 'name email')
                .populate('guideApprovedBy', 'name email')
                .populate('labinchargeApprovedBy', 'name email')
                .sort('-createdAt');
        } else if (req.user.role === 'labincharge') {
            // Lab incharge sees guide-approved BOMs
            boms = await BOM.find({ status: 'guide-approved' })
                .populate('team')
                .populate('createdBy', 'name email')
                .populate('guideApprovedBy', 'name email')
                .populate('labinchargeApprovedBy', 'name email')
                .sort('-createdAt');
        } else if (req.user.role === 'admin') {
            // Admin sees all BOMs
            boms = await BOM.find()
                .populate('team')
                .populate('createdBy', 'name email')
                .populate('guideApprovedBy', 'name email')
                .populate('labinchargeApprovedBy', 'name email')
                .sort('-createdAt');
        }

        res.status(200).json({
            success: true,
            count: boms.length,
            boms,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single BOM
// @route   GET /api/bom/:id
// @access  Private
export const getBOM = async (req, res) => {
    try {
        const bom = await BOM.findById(req.params.id)
            .populate('team')
            .populate('createdBy', 'name email')
            .populate('guideApprovedBy', 'name email')
            .populate('labinchargeApprovedBy', 'name email');

        if (!bom) {
            return res.status(404).json({ message: 'BOM not found' });
        }

        res.status(200).json({
            success: true,
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve BOM by guide
// @route   PUT /api/bom/:id/guide-approve
// @access  Private (Faculty)
export const guideApproveBOM = async (req, res) => {
    try {
        const { comments, materials } = req.body;

        const bom = await BOM.findById(req.params.id).populate('team').populate('createdBy');

        if (!bom) {
            return res.status(404).json({ message: 'BOM not found' });
        }

        // Check if guide is assigned to this team
        const team = await Team.findById(bom.team._id);
        if (team.guide.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not the guide for this team' });
        }

        // Update materials if provided (guide can modify)
        if (materials && materials.length > 0) {
            bom.materials = materials;
        }

        bom.status = 'guide-approved';
        bom.guideApprovedBy = req.user._id;
        bom.guideApprovedAt = Date.now();
        bom.guideComments = comments;

        await bom.save();

        // Send email to student
        await sendApprovalToStudent(bom.createdBy, team, bom, req.user, 'Guide');

        // Send email to lab incharge
        const labIncharge = await User.findOne({ role: 'labincharge' });
        if (labIncharge) {
            await sendBOMToLabIncharge(labIncharge, team, bom, req.user);
        }

        res.status(200).json({
            success: true,
            message: 'BOM approved successfully',
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject BOM by guide
// @route   PUT /api/bom/:id/guide-reject
// @access  Private (Faculty)
export const guideRejectBOM = async (req, res) => {
    try {
        const { comments } = req.body;

        const bom = await BOM.findById(req.params.id).populate('team').populate('createdBy');

        if (!bom) {
            return res.status(404).json({ message: 'BOM not found' });
        }

        // Check if guide is assigned to this team
        const team = await Team.findById(bom.team._id);
        if (team.guide.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not the guide for this team' });
        }

        bom.status = 'guide-rejected';
        bom.guideComments = comments;

        await bom.save();

        // Send rejection email to student
        await sendRejectionToStudent(bom.createdBy, team, bom, req.user, 'Guide', comments);

        res.status(200).json({
            success: true,
            message: 'BOM rejected',
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve BOM by lab incharge
// @route   PUT /api/bom/:id/labincharge-approve
// @access  Private (Lab Incharge)
export const labinchargeApproveBOM = async (req, res) => {
    try {
        const { comments, materials } = req.body;

        const bom = await BOM.findById(req.params.id).populate('team').populate('createdBy');

        if (!bom) {
            return res.status(404).json({ message: 'BOM not found' });
        }

        if (bom.status !== 'guide-approved') {
            return res.status(400).json({ message: 'BOM must be guide-approved first' });
        }

        // Update materials if provided (lab incharge can modify)
        if (materials && materials.length > 0) {
            bom.materials = materials;
        }

        bom.status = 'labincharge-approved';
        bom.labinchargeApprovedBy = req.user._id;
        bom.labinchargeApprovedAt = Date.now();
        bom.labinchargeComments = comments;

        await bom.save();

        // Send email to student
        await sendApprovalToStudent(bom.createdBy, bom.team, bom, req.user, 'Lab Incharge');

        res.status(200).json({
            success: true,
            message: 'BOM approved successfully. Materials can now be issued.',
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject BOM by lab incharge
// @route   PUT /api/bom/:id/labincharge-reject
// @access  Private (Lab Incharge)
export const labinchargeRejectBOM = async (req, res) => {
    try {
        const { comments } = req.body;

        const bom = await BOM.findById(req.params.id).populate('team').populate('createdBy');

        if (!bom) {
            return res.status(404).json({ message: 'BOM not found' });
        }

        bom.status = 'labincharge-rejected';
        bom.labinchargeComments = comments;

        await bom.save();

        // Send rejection email to student
        await sendRejectionToStudent(bom.createdBy, bom.team, bom, req.user, 'Lab Incharge', comments);

        res.status(200).json({
            success: true,
            message: 'BOM rejected',
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark BOM as completed (materials issued)
// @route   PUT /api/bom/:id/complete
// @access  Private (Lab Incharge)
export const completeBOM = async (req, res) => {
    try {
        const bom = await BOM.findById(req.params.id);

        if (!bom) {
            return res.status(404).json({ message: 'BOM not found' });
        }

        if (bom.status !== 'labincharge-approved') {
            return res.status(400).json({ message: 'BOM must be lab incharge-approved first' });
        }

        bom.status = 'completed';
        bom.issuedAt = Date.now();

        await bom.save();

        res.status(200).json({
            success: true,
            message: 'Materials issued successfully',
            bom,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
