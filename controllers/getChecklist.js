const checklists = require(`../models/checklists.js`);

/**
 * Table Names:
 *
 * hr_checklist
 * it_checklist
 * office_management_checklist
 * operations_checklist
 * recruiting_checklist
 * training_checklist
 */

/**
 * Allows the user to view the checklists and
 * their current status.
 */
module.exports = {
    returnChecklist: (req, db) => {
        const tables = {
            hr: {
                tableName: `hr_checklist`,
                keyName: `hr`
            },
            it: {
                tableName: `it_checklist`,
                keyName: `it`
            },
            office: {
                tableName: `office_management_checklist`,
                keyName: `office`
            },
            operations: {
                tableName: `operations_checklist`,
                keyName: `operations`
            },
            recruiting: {
                tableName: `recruiting_checklist`,
                keyName: `recruiting`
            },
            training: {
                tableName: `training_checklist`,
                keyName: `training`
            },
        };

        return new Promise((resolve) => {
            try {
                if (req.body.email.length) {
                    const department = req.body.department.toLowerCase(),
                        criteria = {
                            email: req.body.email,
                            //Checks to see if in an object or array
                            department: department ? [tables[department]] : Object.values(tables)
                        };
                    checklists.returnChecklist(db, criteria).then((response) => {
                        resolve(response);
                    });
                } else {
                    resolve(`Missing email address.`);
                }
            } catch (error) {
                resolve(`Parameter error.`);
            }
        });
    },

    returnChecklistDone: (db, email) => {
        return new Promise((resolve) => {
            checklists.returnChecklist(email, db).then((checklist) => {
                var count = o;
                var incomplete = 0;
                var amountDone = [0, 0];
                try {
                    for (let i in checklist) {
                        for (let j in checklist[i]) {
                            if (checklist[i][j] === true)
                                count++;
                            else
                                incomplete++;
                        }

                    }
                    amountDone = [count, count + incomplete];

                    resolve(amountDone);
                } catch (error) {
                    resolve(`Sorry, there was an error.`);

                }

            });

        });

    }

};
