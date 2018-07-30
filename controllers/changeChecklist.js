const getChecklist = require(`./getChecklist`);
const checklist = require(`../models/checklists`);

/** 
 * Allows users to update the checklist and 
 * actually check complete events off.
 */
module.exports = function (req, db) {
    return new Promise((resolve) => {
        if (req.body.department) {
            getChecklist.returnChecklist(req, db)
                .then(() => {
                    let info = req.body;
                    let temp = info.department;
                    info.department = temp + `_checklist`;
                    checklist.alterChecklist(db, info)
                        .then((response) => {
                            resolve(response);
                        }).catch(() => {
                            resolve(`error`);
                        });
                }).catch((output) => {
                    resolve(`caught an error`);
                });
        } else {
            resolve(`enter a department`);
        }
    });
};
