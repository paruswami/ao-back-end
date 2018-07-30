module.exports = {
    /**
     * This function takes in the email (as a key to userInformation)
     * and returns the information about that user
     */
    returnSingleUser: (db, userEmail) => {
        return new Promise((resolve) => {
            db.query(`SELECT * FROM credentials WHERE email='${userEmail.trim().toLowerCase()}'`).then((response) => {
                let user = ``;
                try {
                    if (response.rows.length == 1) {
                        user = response.rows[0];
                    } else {
                        user = {};
                    }
                } catch (err) {
                    user = {};
                } finally {
                    resolve(user);
                }
            }).catch(() => {
                resolve({});
            });
        });
    },

    /**
     * This function returns all users stored in the database.
     */
    returnAllUsers: (db) => {
        return new Promise((resolve) => {
            db.query(`SELECT * FROM credentials;`)
                .then((response) => {
                    resolve(response.rows);
                }).catch(() => {
                    resolve([]);
                });
        });
    },

    /**
     * This function createsUsers. It takes in the userInformation
     * (as keys email, password, first_name, last_name) and passes that to the database.
     * This function should take the hashedpassword, not the actual.
     */
    createUser: (db, userInformation) => {
        return new Promise((resolve) => {
            db.query(`INSERT INTO credentials (email, password, first_name, last_name, department) VALUES 
            ('${userInformation.email.trim().toLowerCase()}', 
            '${userInformation.hashedPassword}', 
            '${userInformation.firstName}', 
            '${userInformation.lastName}', 
            '${userInformation.department.toLowerCase()}');`)
                .then(() => {
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                });
        });
    },

    /**
     * This function checks if a user is an existing user.
     * It takes it the email as a key to candidateInformation
     * and returns a boolean describing if the user exists.
     */
    isExistingUser: (db, userEmail) => {
        return new Promise((resolve) => {
            db.query(`SELECT * FROM credentials WHERE email='${userEmail.trim().toLowerCase()}'`).then((response) => {
                let isExisting = false;

                try {
                    if (response.rows.length) {
                        isExisting = true;
                    } else {
                        isExisting = false;
                    }
                } catch (err) {
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
     * This function deletes a user. It takes in the email as
     * a key in candidateInformation and wipes that user from the
     * database.
     */
    deleteUser: (db, candidateInformation) => {
        return new Promise((resolve) => {
            db.query(`DELETE FROM credentials WHERE email='${candidateInformation.email.trim().toLowerCase()}'`)
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });

        });
    }

};
