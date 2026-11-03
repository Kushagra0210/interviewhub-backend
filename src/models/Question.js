const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true
        },
        companies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Company"
            }
        ],
        topics: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Topic"
            }
        ],
        roles: [String],
        expectedConcepts: [String],
        rubric: { type: String, default: '' },
        status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
        attribution: { type: String, default: 'Original practice question' },
        indexRevision: { type: Number, default: 1 },
        indexedRevision: { type: Number, default: 0 },
        platform: {
            type: String,
            default: 'Original'
        },
        platformLink: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model("Question", questionSchema);
