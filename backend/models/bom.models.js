import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide material name'],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity'],
        min: [1, 'Quantity must be at least 1'],
    },
    specifications: {
        type: String,
        trim: true,
    },
    unit: {
        type: String,
        default: 'pcs',
    },
});

const bomSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: [true, 'Please specify the team'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please specify who created this BOM'],
        },
        materials: [materialSchema],
        status: {
            type: String,
            enum: [
                'pending',
                'guide-approved',
                'guide-rejected',
                'labincharge-approved',
                'labincharge-rejected',
                'completed',
            ],
            default: 'pending',
        },
        guideApprovedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        guideApprovedAt: {
            type: Date,
        },
        guideComments: {
            type: String,
        },
        labinchargeApprovedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        labinchargeApprovedAt: {
            type: Date,
        },
        labinchargeComments: {
            type: String,
        },
        issuedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const BOM = mongoose.model('BOM', bomSchema);

export default BOM;
