import mongoose from 'mongoose';

const materialConsumptionSchema = new mongoose.Schema(
    {
        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Material',
            required: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Please provide consumed quantity'],
            min: [0, 'Quantity cannot be negative'],
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        },
        project: {
            type: String,
            trim: true,
        },
        consumedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        consumedAt: {
            type: Date,
            default: Date.now,
        },
        purpose: {
            type: String,
            trim: true,
        },
        carbonEmission: {
            type: Number,
            default: 0,
        },
        energyConsumed: {
            type: Number,
            default: 0,
        },
        bom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BOM',
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by date range
materialConsumptionSchema.index({ consumedAt: 1 });
materialConsumptionSchema.index({ material: 1, consumedAt: 1 });

const MaterialConsumption = mongoose.model('MaterialConsumption', materialConsumptionSchema);

export default MaterialConsumption;
