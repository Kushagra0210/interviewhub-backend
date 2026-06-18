const getUsers = (req, res) => {
    res.json({
        success: true,
        users: ["Kushagra", "Aman"]
    });
};
const createUser = (req, res) => {
    const { name, email } = req.body;
    res.json({
        success: true,
        message: "user created successfully",
        user: {
            name,
            email
        }
    });
};
module.exports = {
    getUsers,
    createUser,
};