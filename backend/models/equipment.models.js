import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide equipment name'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ['machinery', 'tools', 'electronics', 'testing', 'safety', 'other'],
            default: 'other',
        },
        model: {
            type: String,
            trim: true,
        },
        manufacturer: {
            type: String,
            trim: true,
        },
        serialNumber: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['available', 'in-use', 'maintenance', 'retired'],
            default: 'available',
        },
        purchaseDate: {
            type: Date,
        },
        purchasePrice: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        warrantyExpiry: {
            type: Date,
        },
        lastMaintenanceDate: {
            type: Date,
        },
        nextMaintenanceDate: {
            type: Date,
        },
        specifications: {
            type: Map,
            of: String,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        imagePublicId: {
            type: String,
            trim: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
