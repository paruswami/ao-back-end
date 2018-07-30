const checklists = require(`../models/checklists`);

module.exports = function (req, db) {
    return new Promise((resolve) => {
        checklists.returnApplicabilityChecklist(db, req.body)
            .then((appChecklist) => {
                let checklistItem = req.body.checklistItem;
                let message = checklistItem + ` applicability toggled `;
                if (appChecklist[0][checklistItem]) {
                    checklists.alterChecklist(db, req.body.email, `checklist_applicability`, checklistItem, false)
                        .then(() => {
                            resolve({
                                status: 1,
                                message: message + ` off`
                            });
                        }).catch(() => {
                            resolve({
                                status: -1,
                                message: `error`
                            });
                        });
                } else {
                    checklists.alterChecklist(db, req.body.email, `checklist_applicability`, checklistItem, true)
                        .then(() => {
                            resolve({
                                status: 1,
                                message: message + ` on`
                            });
                        }).catch(() => {
                            resolve({
                                status: -1,
                                message: `error`
                            });
                        });
                }
            }).catch(() => {
                resolve({
                    status: -1,
                    message: `error`
                });
            });

    });
};
