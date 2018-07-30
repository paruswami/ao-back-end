const candidates = require(`../models/candidates`);

/**
 * Allows users to search for a specific candidate
 * in the database, partial searches allowed.
 */
module.exports = function (req, db) {
    let searchObject = req.body;
    //let type = req.body.searchType;
    //let searchSubject = req.body.search;
    return new Promise((resolve) => {
        new Promise((resolve, reject) => {
            try {
                if (searchObject.searchType.length && searchObject.search.length) {
                    candidates.searchCandidate(db, searchObject).then((searchFound) => {
                        if (searchFound) {
                            resolve(searchFound);
                            console.log(searchFound);
                        } else {
                            reject(`Unable to find candidate!`);
                        }
                    });
                } else {
                    console.log(`hey`);
                    candidates.returnCandidates(db, {
                        email: ``
                    }).then((candidateList) => {
                        resolve(candidateList);
                    });

                }
            } catch (error) {
                reject(`Error`);
            }
        }).then((output) => {
            resolve(output);
        }).catch(() => {
            resolve(false);
        });
    });
};
