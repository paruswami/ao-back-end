const candidates = require(`../models/candidates`);
const jazzhr = require(`../helpers/jazzhr.js`);
const newCandidate = require(`../controllers/newCandidate`);

/**
 * Gets the candidates ID from jazzHR
 * using the array of names.
 */
let getCandidateID = function (candidateArray) {
    let output = [];
    for (let i = 0; i < candidateArray.length; i++) {
        let candidate = candidateArray[i];
        let temp = new Promise((resolve) => {
            resolve(candidate.id);
        });
        output.push(temp);
    }
    return output;
};

/**
 * Creates candidate objects from the candidate
 * IDs that put into an array from above.
 */
let idArraytoCandObj = function (idArray) {
    let output = [];
    let temp;
    for (let i = 0; i < idArray.length; i++) {
        let id = idArray[i];
        let job;
        let jobRole;
        temp = new Promise((resolve) => {
            jazzhr.selectApplicant(id).then((candidate) => {
                //Wrap into array because of singular object problem
                if (Object.prototype.toString.call(candidate.jobs) !== `[object Array]`) {
                    candidate.jobs = [candidate.jobs];
                    jobRole = candidate.jobs[0].job_title;
                } else {
                    let stop = false;
                    for (let j = 0; j < candidate.jobs.length; j++) {
                        //Create candidate depending on their workflow status in JazzHR
                        if ((candidate.jobs[j].workflow_step_id === `7708404` || candidate.jobs[j].workflow_step_id === `7708405` ||
                                candidate.jobs[j].workflow_step_id === `7708406`) && (!stop)) {
                            stop = true;
                            jobRole = candidate.jobs[j].job_title;
                        }
                    }
                }
                job = candidate.jobs[0].job_id;
                resolve({
                    firstName: candidate.first_name,
                    lastName: candidate.last_name,
                    email: candidate.email,
                    phonePrimary: candidate.phone,
                    applicantId: candidate.id,
                    //Hardcoded values that JazzHR cannot fill in, but we cannot leave blank
                    phoneSecondary: ``,
                    offerAccepted: false,
                    offerNegotiated: false,
                    salaryInitial: ``,
                    salaryFinal: ``,
                    title: jobRole,
                    isRemote: false,
                    startDate: ``,
                    jobId: job
                });

            });
        });
        output.push(temp);
    }
    return output;
};

/**
 * Checks to see if the job is in the US because
 * the UK and India use the same JazzHR account.
 */
let isUsJob = function (jobId) {
    return new Promise((resolve) => {
        jazzhr.getJob(jobId).then((output) => {
            let country = output.country_id;
            if (country === `United States`) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

/**
 * Allows users to import all the relevant candidate's
 * information from JazzHR to save time.
 */
module.exports = function (db) {
    //possibly generalize searchApplicant to include multi search
    const searchCriteria = {
        status: 7708405
    };
    let idArray = [];

    let promiseArray = [];
    return new Promise((resolve) => {
        jazzhr.searchApplicant(searchCriteria).then((tempArray) => {
            promiseArray = getCandidateID(tempArray);
            Promise.all(promiseArray).then((output) => {
                idArray = output;
                let existsPromiseArray = [];
                Promise.all(idArraytoCandObj(idArray)).then((candArray) => {
                    //For loop goes through wanted candidates and creates them into our database
                    for (let i = 0; i < candArray.length; i++) {
                        let cand = candArray[i];
                        let temp = new Promise((resolve) => {
                            candidates.isExistingCandidate(db, cand.email).then((boolOutput) => {
                                if (boolOutput) {
                                    resolve(false);
                                } else {
                                    isUsJob(cand.jobId).then((isJob) => {
                                        if (isJob) {
                                            resolve(cand);
                                        } else {
                                            resolve(false);
                                        }
                                    });
                                }
                            });
                        });
                        existsPromiseArray.push(temp);
                    }
                    Promise.all(existsPromiseArray).then((output) => {
                        /* let exists;
                        let temp1;
                        let createCandPromiseArray = [];
                        for (let i = 0; i < output.length; i++) {
                            exists = output[i];
                            temp1 = new Promise((resolve) => {
                                //Check in case the object is empty
                                if (exists) {
                                    console.log(`candidiate ${exists.email} not in db...`);
                                    //change this so that input is validated
                                    let input = {
                                        body: exists
                                    };
                                    console.log(`calling new candidate...`);
                                    newCandidate(input, db).then((createdCandidate) => {
                                        if (createdCandidate.status === 1) {
                                            console.log(`success creating candidate...`);
                                            resolve(createdCandidate);
                                        } else {
                                            console.log(`failed to create candidate...`);
                                            resolve(createdCandidate);
                                            //fix this so if this happens, doesn't resolve 1
                                        }
                                    });
                                } else {
                                    console.log(`candidate already exists...`);
                                    resolve();
                                }
                            });
                            //Push candidate into our final array
                            createCandPromiseArray.push(temp1);
                        } */

                        /**
                         * I rewrote your function to simplify things
                         * and bring clarity. Always think about verbose naming
                         * conventions. Please consider what you will return
                         * for statuses.
                         */

                        let addCandidatesPromises = [],
                            addCandidate;

                        for (let candidate of output) {
                            addCandidate = new Promise((resolve) => {
                                if (Object.keys(candidate).length) {
                                    const params = {
                                        body: candidate
                                    };

                                    newCandidate(params, db).then((candidateCreated) => {
                                        // What are you trying to do here?
                                        if (candidateCreated.status == 1) {
                                            console.log(`created candidate...`);
                                        } else {
                                            console.log(`failed to create candidate...`);
                                        }
                                        resolve(candidateCreated);
                                    });
                                } else {
                                    resolve(false);
                                }
                            });

                            addCandidatesPromises.push(addCandidate);
                        }

                        Promise.all(addCandidatesPromises).then((output) => {
                            resolve({
                                status: 1,
                                output: output
                            });
                        }).catch(() => {
                            resolve({
                                status: -1,
                                output: output
                            });
                        });
                    }).catch(() => {
                        resolve({
                            status: -1,
                            message: `error`,
                            output: output
                        });

                    });
                });
            });
        });
    });
};
