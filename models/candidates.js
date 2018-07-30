module.exports = {
    /**
     * This function takes in the candidates email in an object and
     * returns the candidate object with that email
     */
    returnCandidates: (db, candidate) => {
        return new Promise((resolve) => {
            db.query(`SELECT * FROM candidates ${candidate.email.length ? `WHERE email='${candidate.email.trim().toLowerCase()}'` : ``};`).then((candidateList) => {
                resolve(candidateList.rows);
            }).catch(() => {
                resolve([]);
            });
        });
    },
    /**
     * This function takes in the candidateInformation object and
     * adds the candidate to all of the relevant databases (i.e.
     * candidate, hr_checklist, etc.)
     */
    createCandidate: (db, candidateInformation) => {
        return new Promise((resolve) => {
            let candidate = candidateInformation.candidate;

            let email = candidate.email;
            let firstName = candidate.firstName;
            let lastName = candidate.lastName;
            let phonePrimary = candidate.phonePrimary;
            let applicantId = candidate.applicantId;
            let phoneSecondary = candidate.phoneSecondary;
            let offerAccepted = candidate.offerAccepted;
            let offerNegotiated = candidate.offerNegotiated;
            let salaryInitial = candidate.salaryInitial;
            let salaryFinal = candidate.salaryFinal;
            let title = candidate.title;
            let isRemote = candidate.isRemote;
            let startDate = candidate.startDate;
            db.query(`INSERT INTO candidates
            (email, first_name, last_name, phone_primary, applicant_id, phone_secondary,
             offer_accepted, offer_negotiated, salary_offer_initial, salary_offer_final,
             title, is_remote, start_date) VALUES (
            '${email}',
            '${firstName}',
            '${lastName}',
            '${phonePrimary}',
            '${applicantId}',
            '${phoneSecondary}',
            '${offerAccepted}',
            '${offerNegotiated}',
            '${salaryInitial}',
            '${salaryFinal}',
            '${title}',
            '${isRemote}',
            '${startDate}');`)
                .then(() => {
                    /**
                     * The nested promise is neccessary because the candidate must first
                     * be added to the candidates table. This is due to the use of foriegn key
                     * references in the remaining tables.
                     */
                    db.query(
                        `INSERT INTO recruiting_checklist (email) VALUES
                        ('${email}');
                        INSERT INTO it_checklist (email) VALUES
                        ('${email}');
                        INSERT INTO office_management_checklist (email) VALUES
                        ('${email}');
                        INSERT INTO operations_checklist (email) VALUES
                        ('${email}');
                        INSERT INTO hr_checklist (email) VALUES
                        ('${email}');
                        INSERT INTO training_checklist (email) VALUES
                        ('${email}');
                        INSERT INTO checklist_applicability (email) VALUES
                        ('${email}');
                        `)
                        .then(() => {
                            resolve(true);
                        }).catch(() => {
                            resolve(false);
                        });
                }).catch(() => {
                    resolve(false);
                });
        });
    },

    /**
     * This function is used to update a candidate. It takes in an updateObject,
     * with keys description, newValue, and email. Email is used to identify the candidate,
     * description is used to select the column and newValue is used to set the new value
     * for that column.
     */
    updateCandidate: (db, email, candidateProfile) => {
        let updateParams = [],
            insertString = ``;

        delete candidateProfile.email;
        delete candidateProfile.new_email;

        return new Promise((resolve) => {
            for (let param in candidateProfile) {
                updateParams.push(`${param}='${candidateProfile[param]}'`);
            }
            insertString = `UPDATE candidates SET ${updateParams.join(`,`)} WHERE email='${email.trim().toLowerCase()}'`;

            db.query(insertString).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    },

    updateCandidateEmail: (db, currentEmail, newEmail) => {
        return new Promise((resolve) => {
            db.query(`UPDATE candidates SET email='${newEmail.trim().toLowerCase()}' WHERE email='${currentEmail.trim().toLowerCase()}'`).then(() => {
                resolve(true);
            }).catch((response) => {
                resolve(false);
            });
        });
    },
    /**
     * This function checks if a candidate already exists.
     * It does so by looking at the email key in the candidateInformation
     * object and looking in the candidates data table to find a row with
     * that email.
     */
    isExistingCandidate: (db, email) => {
        return new Promise((resolve) => {
            db.query(`SELECT * FROM candidates WHERE email='${email}';`)
                .then((response) => {
                    let isExisting = false;
                    try {
                        if (response.rows.length) {
                            isExisting = true;
                        } else {
                            isExisting = false;
                        }
                    } catch (error) {
                        isExisting = false;
                    } finally {
                        resolve(isExisting);
                    }
                }).catch(() => {
                    resolve(false);
                });
        });
    },
    /**
     * This function deletes candidates from all of the relevant data tables.
     * It takes in the email from the candididateInformation object.
     */
    deleteCandidate: (db, candidateInformation) => {
        return new Promise((resolve) => {
            const email = candidateInformation.email.trim().toLowerCase();

            new Promise((resolve, reject) => {
                db.query(`
                DELETE FROM recruiting_checklist        WHERE email='${email}';
                DELETE FROM it_checklist                WHERE email='${email}';
                DELETE FROM office_management_checklist WHERE email='${email}';
                DELETE FROM operations_checklist        WHERE email='${email}';
                DELETE FROM training_checklist          WHERE email='${email}';
                DELETE FROM hr_checklist                WHERE email='${email}';
                DELETE FROM checklist_applicability     WHERE email='${email}';
                `)
                    .then(() => {
                        resolve(true);
                    }).catch(() => {
                        reject(false);
                    });
                /**
                 * The nested promise is neccessary because the candidate must first be deleted
                 * from the checklist tables. This is due to the use of foriegn key references
                 * (to candidates table) in these tables.
                 */
            }).then(() => {
                db.query(`DELETE FROM candidates WHERE email='${email}';`)
                    .then(() => {
                        resolve(true);
                    }).catch(() => {
                        resolve(false);
                    });
            }).catch(() => {
                resolve(false);
            });
        });
    },
    /**
     * This function searches for candidates. It takes in the searchObject,
     * which has keys searchType and search. searchType selects which column will
     * be searched. search selects what to search for. The search function works by
     * returning all rows whose value in row searchType begins with search
     */
    searchCandidate: (db, searchObject) => {
        return new Promise((resolve) => {
            //is this query correct?
            db.query(`SELECT * FROM candidates WHERE 
            UPPER(${searchObject.searchType}) LIKE (UPPER('${searchObject.search}') || '%')`).then((response) => {
                resolve(response.rows);
            }).catch(() => {
                resolve(false);
            });
        });
    }
};
