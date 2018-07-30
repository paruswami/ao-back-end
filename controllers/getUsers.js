const users = require(`../models/users`);

/**
 * Gets all the users and their information
 * as in the credentials database.
 */
module.exports = function (req, db) {
    return new Promise((resolve, reject) => {
        try {
            users.returnAllUsers(db).then((response) => {
                resolve(response);
            }).catch((response) => {
                resolve({
                    status: -1,
                    message: response
                });
            });
        } catch (error) {
            reject(`Could not complete`);
        }
    });
};
