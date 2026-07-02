const jwt = require("jsonwebtoken");
//IMPORT USER MODEL
const User = require("../models/User");
//prptect middleware
const protect = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // find user drom db
        //User.findById(decoded.id) fetches REAL user from database.Now backend knows: name, email, createdAt, everything.

        req.user = await user.findById(decoded.id)
            //exclude password
            //.select("-password") OST IMPORTANT SECURITY PRACTICE.Means:Do NOT return password Even hashed passwords should not be exposed

            .select("-password");
        // continue request
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