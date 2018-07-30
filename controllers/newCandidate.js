const candidates = require(`../models/candidates`);

/**
 * Creates a new candidate from scratch if they
 * are not created intially through JazzHR.
 */
module.exports = function (req, db) {
    return new Promise((resolve) => {
        new Promise((resolve, reject) => {
            try {
                /**
                 * You forgot to intialize this variable.
                 *
                 * Incorrect:
                 * candidateInfo = checkParams(req.body);
                 *
                 * Correct: let candidateInfo = checkParams(req.body);
                 */
                let candidateInfo = checkParams(req.body);
                console.log(req.body);

                if (candidateInfo.report.total) {
                    candidates.isExistingCandidate(db, candidateInfo.candidate.email).then((isExisting) => {
                        if (isExisting) {
                            reject({
                                message: `Candidate already exists.`,
                                cand: candidateInfo
                            });
                        } else {
                            candidates.createCandidate(db, candidateInfo).then((createdCandidate) => {
                                if (createdCandidate) {
                                    resolve({
                                        cand: candidateInfo
                                    });
                                } else {
                                    reject({
                                        cand: candidateInfo
                                    });
                                }
                            });
                            resolve({
                                status: 1
                            });
                        }
                    });
                } else {
                    reject({
                        cand: candidateInfo
                    });
                }
            } catch (error) {
                console.log(error);
                reject(`Unable to create candidate`);
            }
        }).then((response) => {
            response.status = 1;
            resolve(response);
        }).catch((response) => {
            response.status = -1;
            resolve(response);
        });
    });
};

function checkParams (candObj) {
    let report = {};
    let email = candObj.email;
    let firstName = candObj.firstName;
    let lastName = candObj.lastName;
    //lower two will return 0 if no int recieved
    let phonePrimary = parseInt(candObj.phonePrimary.replace(/[^0-9]/g, ``), 10);
    let phoneSecondary = parseInt(candObj.phonePrimary.replace(/[^0-9]/g, ``), 10);
    //pass these to the candObj rather than manage in model
    let offerAccepted = stringToBool(candObj.offerAccepted);
    //let offerAccepted = candObj.offerAccepted; //should come in as bool
    let offerNegotiated = stringToBool(candObj.offerNegotiated);
    //let offerNegotiated = candObj.offerNegotiated;
    let salaryInitial = parseFloat(candObj.salaryInitial.toString().replace(/[^0-9.]/g, ``));
    let salaryFinal = parseFloat(candObj.salaryFinal.toString().replace(/[^0-9.]/g, ``));
    let title = candObj.title;
    let isRemote = stringToBool(candObj.isRemote);
    //let isRemote = candObj.isRemote;
    let startDate = candObj.startDate;
    let applicantId = candObj.applicantId;
    if (validateEmail(email)) {
        report.email = true;
    } else {
        report.email = false;
    }
    if (validateName(firstName)) {
        report.firstName = true;
    } else {
        report.firstName = false;
    }
    if (validateName(lastName)) {
        report.lastName = true;
    } else {
        report.lastName = false;
    } //remove leading 1
    if (phonePrimary.toString().substring(0, 1) === `1`) {
        phonePrimary = parseInt(phonePrimary.toString().substring(1));
    }
    if (validatePhone(phonePrimary)) {
        report.phonePrimary = true;
    } else {
        report.phonePrimary = false;
    }
    if (phoneSecondary.toString().substring(0, 1) === `1`) {
        phoneSecondary = parseInt(phoneSecondary.toString().substring(1));
    }
    if (validatePhone(phoneSecondary)) {
        report.phoneSecondary = true;
    } else {
        if (candObj.phoneSecondary.length === 0) { //if empty, make default
            phoneSecondary = -1; //default
            report.phoneSecondary = true;
        } else {
            report.phoneSecondary = false;
        }
    }
    if (validateBool(offerAccepted)) {
        report.offerAccepted = true;
    } else {
        if (offerAccepted.length === 0) {
            report.offerAccepted = true;
            offerAccepted = true;
        } else {
            report.offerAccepted = false;
        }
    }
    if (validateBool(offerNegotiated)) {
        report.offerNegotiated = true;
    } else {
        if (offerNegotiated.length === 0) {
            offerNegotiated = true;
            report.offerNegotiated = true;
        } else {
            report.offerNegotiated = false;
        }
    }
    if (validateSalary(salaryInitial)) {
        report.salaryInitial = true;
    } else {
        if (candObj.salaryInitial === ``) {
            salaryInitial = -1;
            report.salaryInitial = true;
        } else {
            report.salaryInitial = false;
        }
    }
    if (validateSalary(salaryFinal)) {
        report.salaryFinal = true;
    } else {
        if (candObj.salaryFinal === ``) {
            salaryFinal = -1;
            report.salaryFinal = true;
        } else {
            report.salaryFinal = false;
        }
    }
    if (validateBool(isRemote)) {
        report.isRemote = true;
    } else {
        if (isRemote.length === 0) {
            report.isRemote = true;
            isRemote = false;
        } else {
            report.isRemote = false;
        }
    }
    if (validateDate(startDate)) {
        report.startDate = true;
    } else { //do we want a default?
        if (startDate === ``) {
            report.startDate = true;
            startDate = `01-01-1800`;
        } else {
            report.startDate = false;
        }
    }
    if (applicantId) {
        report.applicantId = true;
    } else {
        applicantId = `NotAJazzImport`;
        report.applicantId = true;
    }
    if (validateTitle(title)) {
        report.title = true;
    } else {
        report.title = false;
    }
    report.total = true;
    for (let test in report) {
        if (!report[test]) {
            report.total = false;
        }
    }
    return ({
        candidate: {
            email: email.toLowerCase().trim(),
            firstName: firstName,
            lastName: lastName,
            phonePrimary: phonePrimary,
            phoneSecondary: phoneSecondary,
            offerAccepted: offerAccepted,
            offerNegotiated: offerNegotiated,
            salaryInitial: salaryInitial,
            salaryFinal: salaryFinal,
            title: title,
            isRemote: isRemote,
            startDate: startDate,
            applicantId: applicantId
        },
        report: report
    });

}

function validateEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePhone (number) {
    if (typeof number === `number` && number >= 0 && number.toString().length === 10) {
        return true;
    } else {
        return false;
    }

}

function validateName (name) {
    if (typeof name === `string` && name.length > 0) {
        return true;
    } else {
        return false;
    }
}

function validateBool (bool) {
    if (typeof bool === `boolean`) {
        return true;
    } else {
        return false;
    }
}

function validateSalary (salary) {
    if (typeof salary === `number` && salary >= 0) {
        return true;
    } else {
        return false;
    }
}

function validateTitle (title) {
    //not really any validation here, but just put here to be
    //consistent and offer ability to customize
    if (title.length > 0) {
        return true;
    } else {
        return false;
    }

}

function validateDate (date) {
    var re = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
    return re.test(date);
}

function stringToBool (string) {
    if (typeof string === `string` && string.length > 0) {
        return (string == `true`);
    } else {
        return ``;
    }
}
