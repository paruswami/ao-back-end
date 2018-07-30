const users = require(`../models/users`);

/** 
 * Allows an uneccesary user to be deleted.
 */
module.exports = function (req, db) {
    let email;

    return new Promise((resolve) => {
        new Promise((resolve, reject) => {
            try {
                if (req.body.email.length) {
                    email = req.body.email.toLowerCase();
                    users.isExistingUser(db, {
                        email: email
                    }).then((isExisting) => {
                        if (isExisting) {
                            users.deleteUser(db, {
                                email: email
                            }).then((deletedUser) => {
                                if (deletedUser) {
                                    resolve();
                                } else {
                                    reject(`Unable to delete`);
                                }
                            });
                        } else {
                            reject(`Unable to find username`);
                        }
                    });
                }
            } catch (error) {
                reject(`Unable to delete candidate`);
            }
        }).then(() => {
            resolve({
                status: 1
            });
        }).catch((response) => {
            resolve({
                status: -1,
                message: response
            });
        });
    });
};
