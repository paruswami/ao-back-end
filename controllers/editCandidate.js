const candidates = require(`../models/candidates`);

/**
 * Allows users to edit candidates after specifying which
 * components they would like to edit.
 */
module.exports = function (req, db) {
    return new Promise((resolve) => {
        let currentEmail,
            newEmail;

        try {
            currentEmail = req.body.email.trim().toLowerCase();
            newEmail = req.body.new_email.trim().toLowerCase();
        } catch (err) {
            resolve(`Email parameter error.`);
        }

        new Promise((resolve, reject) => {
            candidates.isExistingCandidate(db, currentEmail).then((isCandidate) => {
                if (!isCandidate) {
                    reject(`Unable to locate candidate.`);
                } else {
                    candidates.updateCandidate(db, currentEmail, req.body).then((updateSuccess) => {
                        if (updateSuccess) {
                            resolve(`Candidate updated.`);
                        } else {
                            reject(`Unable to update candidate.`);
                        }
                    });
                }
            });
        }).then((response) => {
            /* if (newEmail !== currentEmail) {
                candidates.updateCandidateEmail(db, currentEmail, newEmail).then((emailUpdated) => {
                    if (emailUpdated) {
                        resolve(`Candidate profile and email updated.`);
                    } else {
                        resolve(`Candidate profile updated, but unable to update email.`);
                    }
                });
            } else {
                resolve(response);
            } */
            resolve(response);
        }).catch((response) => {
            resolve(response);
        });
    });
};
