const getUsers = (req, res) => {
    res.json({
        success: true,
        users: ["Kushagra", "Aman"]
    });
};

module.exports = {
    getUsers,
};