const candidates = require(`../models/candidates`);

module.exports = {
    alterChecklist: (db, info) => {
        return new Promise((resolve) => {
            db.query(`UPDATE ${info.department} SET ${info.checklistStep} = ${info.check} WHERE email='${info.email}';`).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    },

    returnChecklist: (db, criteria) => {
        const email = criteria.email.trim().toLowerCase();

        let checklist = {};

        return new Promise((resolve) => {
            const department = criteria.department;

            new Promise((resolve, reject) => {
                candidates.isExistingCandidate(db, email)
                    .then((isExisting) => {
                        if (isExisting) {
                            resolve(true);
                        } else {
                            reject(false);
                        }
                    });
            }).then(() => {
                let queryList = [];

                for (let i in department) {
                    queryList[i] = new Promise((resolve) => {
                        db.query(`SELECT * FROM ${department[i].tableName} WHERE email='${email}';`)
                            .then((response) => {
                                if (response.rows.lengh > 1) {
                                    resolve({});
                                } else {
                                    checklist[department[i].keyName] = response.rows[0];
                                    resolve(response.rows[0]);
                                }
                            }).catch(() => {
                                resolve({});
                            });
                    });
                }

                Promise.all(queryList).then(() => {

                    // Strip out email key from all entries.
                    for (let i of Object.keys(checklist)) {
                        delete checklist[i].email;
                    }
                    resolve(checklist);
                }).catch(() => {
                    resolve({});
                });
            }).catch(() => {
                resolve({});
            });
        });
    },

    returnApplicabilityChecklist: (db, candidate) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM checklist_applicability WHERE email='${candidate.email.trim().toLowerCase()}';`)
                .then((response) => {
                    resolve(response.rows);
                }).catch(() => {
                    reject(`error`);
                });
        });
    }
};
