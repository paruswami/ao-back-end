const token = require(`../controllers/token`);
const hash = require(`../controllers/hash`);

const users = require(`../models/users`);

/**
 * Allows users to login if they have already
 * registered using their email and given password.
 */
module.exports = function (req, db) {
    return new Promise((resolve) => {
        new Promise((resolve, reject) => {
            try {
                if (req.body.email.length && req.body.password.length) {
                    const userEmail = req.body.email.toLowerCase();

                    users.returnSingleUser(db, userEmail).then((user) => {
                        if (user) {
                            hash.compare(req.body.password, user.password).then((isValid) => {
                                if (isValid) {
                                    resolve(user);
                                } else {
                                    reject(`Invalid Username/Password`);
                                }
                            });
                        } else {
                            reject(`Invalid Username/Password`);
                        }
                    });
                } else {
                    reject(`Username And Password Required`);
                }
            } catch (err) {
                reject(`Parameter Error`);
            }
        }).then((user) => {
            resolve({
                status: 1,
                email: user.email,
                firstName: user.first_name,
                isAdmin: user.admin,
                token: token.issue(user.email)
            });
        }).catch((response) => {
            resolve({
                status: -1,
                message: response
            });
        });
    });
};
