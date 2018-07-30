const token = require(`../controllers/token`);
const users = require(`../models/users`);

/**
 * Here we check if the user has the rights
 * required to perform various functions.
 */
module.exports = function (db, req, res, next) {
    let passedToken = req.body.token || req.params.token || req.headers[`x-access-token`] || req.headers[`authorization`];
    passedToken = token === undefined ? `` : passedToken.replace(`Bearer `, ``);

    const email = token.returnDecodedToken(passedToken);

    if (email) {
        users.returnSingleUser(db, email).then((user) => {
            if (user.admin) {
                next();
            } else {
                res.sendStatus(401);
            }
        });
    } else {
        res.sendStatus(401);
    }
};
