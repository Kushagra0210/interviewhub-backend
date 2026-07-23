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
        platform: {
            type: String,
            required: true
        },
        platformLink: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model("Question", questionSchema);