import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide material name'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ['metal', 'plastic', 'composite', 'electronic', 'chemical', 'other'],
            default: 'other',
        },
        density: {
            type: Number,
            min: [0, 'Density cannot be negative'],
        },
        energyFactor: {
            type: Number,
            min: [0, 'Energy factor cannot be negative'],
            default: 0,
        },
        carbonFactor: {
            type: Number,
            min: [0, 'Carbon factor cannot be negative'],
            default: 0,
        },
        unit: {
            type: String,
            default: 'kg',
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        imagePublicId: {
            type: String,
            trim: true,
        },
        pricePerUnit: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        stockQuantity: {
            type: Number,
            min: [0, 'Quantity cannot be negative'],
            default: 0,
        },
        supplier: {
            type: String,
            trim: true,
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

const Material = mongoose.model('Material', materialSchema);

export default Material;
