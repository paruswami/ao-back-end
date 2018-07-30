const candidates = require(`../models/candidates`);

/**
 * Allows users to delete a candidate from every
 * database using their email as the key.
 */
module.exports = function (req, db) {
    let email;

    return new Promise((resolve) => {
        new Promise((resolve, reject) => {
            try {
                if (req.body.email.length) {
                    email = req.body.email.toLowerCase();
                    candidates.isExistingCandidate(db, email).then((isExisting) => {
                        if (isExisting) {
                            candidates.deleteCandidate(db, {
                                email: email
                            }).then((deletedCandidate) => {
                                if (deletedCandidate) {
                                    resolve(email);
                                } else {
                                    reject(`Unable to delete`);
                                }
                            });
                        } else {
                            reject(`Unable to find candidate`);
                        }
                    });
                }
            } catch (error) {
                reject(`Unable to delete candidate`);
            }
        }).then((email) => {
            resolve({
                status: 1,
                candidate: email
            });
        }).catch((response) => {
            resolve({
                status: -1,
                message: response
            });
        });
    });
};
