const mongoose = require("mongoose");
const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        logo: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    });
module.exports = mongoose.model("Company", companySchema);