const admin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "access denied. admin only"
        });
    }
    next();
};
module.exports = admin;