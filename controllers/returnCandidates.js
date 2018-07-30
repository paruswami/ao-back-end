const candidates = require(`../models/candidates`);

/**
 * Allows users to see all the candidates in the 
 * candidates database and all their basic information.
 */
module.exports = function (req, db) {
    let email = ``;

    if (`email` in req.body) {
        email = req.body.email;
    }
    return new Promise((resolve) => {
        candidates.returnCandidates(db, {
            email: email
        }).then((candidateList) => {
            resolve(candidateList);
        });
    });
};
