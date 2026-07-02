const jwt = require("jsonwebtoken");
const protect = async (req, res) => {
    try {
        let token;
        //check if authorisation header exists
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // extract token
            token = req.headers.authorization.split(" ")[1];
        }
        // if token is missing
        if (!token) {
            return res.status(401).json(
                {
                    succcess: false,
                    message: "Not authorized, token missing",
                }
            );
        }
        // verify token
        const decoded = jwt.verify(token, "secretkey");
        // save user data inside request 
        req.user = decoded;
        // move to nect middleware/controller
        next();
    }
    catch (error) {
        res.status(401).json({
            succcess: false,
            message: "invalid token "
        });

    }
};
// export middleware
module.exports = protect;