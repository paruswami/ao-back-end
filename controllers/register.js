const hash = require(`../controllers/hash`);
const token = require(`../controllers/token`);

const users = require(`../models/users`);

/**
 * Creates a new user with their Saggezza email,
 * providing them with a hashed password.
 */
module.exports = function (req, db) {
    const emailReg = /\w+\.\w+@saggezza\.com/;

    return new Promise((resolve) => {
        new Promise((resolve, reject) => {
            try {
                const body = JSON.parse(JSON.stringify(req.body));

                if (body.email.length && body.password.length && body.firstName.length && body.lastName.length &&
                    body.department.length) {
                    const email = body.email.toLowerCase();
                    const department = body.department.toLowerCase();

                    if (!emailReg.test(email)) {
                        reject(`Please enter a valid Saggezza email address.`);
                    } else if (!validateDepart(department)) {
                        reject(`Please enter a valid department.`);
                    } else {
                        hash.encrypt(body.password).then((hash) => {
                            if (hash) {
                                users.isExistingUser(db, email).then((isExisting) => {
                                    if (isExisting) {
                                        reject(`Email is already in use.`);
                                    } else {
                                        users.createUser(db, {
                                            email: email,
                                            hashedPassword: hash,
                                            firstName: body.firstName,
                                            lastName: body.lastName,
                                            department: department
                                        }).then((createdUser) => {
                                            if (createdUser) {
                                                resolve(email);
                                            } else {
                                                reject(`Unable to register`);
                                            }
                                        });
                                    }
                                });
                            } else {
                                reject(`Failed to hash password.`);
                            }
                        });
                    }
                } else {
                    reject(`Please enter all information.`);
                }
            } catch (err) {
                reject(`Unable to register.`);
            }
        }).then((email) => {
            resolve({
                status: 1,
                email: email,
                token: token.issue(email)
            });
        }).catch((response) => {
            resolve({
                status: -1,
                message: response
            });
        });
    });
};

function validateDepart (department) {
    let departmentArray = [`hr`, `it`, `office_management`, `operations`, `recruiting`, `training`];
    for (let number in departmentArray) {
        if (departmentArray[number] === department) {
            return true;
        }
    }
    return false;
}
