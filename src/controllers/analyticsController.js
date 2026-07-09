const User = require("../models/User");
// GET USERS BY CITY
const usersByCity = async (req, res) => {
    try {
        const analytics = await User.aggregate([
            {
                $group: {
                    _id: "$city",
                    totalUsers: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    city: "$_id",
                    totalUsers: 1
                }
            },
            {
                $sort: {
                    totalUsers: -1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            analytics
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    usersByCity
}