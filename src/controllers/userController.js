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

const getSingleUser = (req, res) => {

    const userId = req.params.id;

    res.json({
        success: true,
        message: `Fetched user ${userId}`,
    });
};
const searchUsers = (req, res) => {
    const page = req.query.page;
    res.json({
        success: true,
        currentpage: page
    })
}
module.exports = {
    getUsers,
    createUser,
    getSingleUser,
    searchUsers,
};
