const jwt = require(`jsonwebtoken`);

/**
 * Deals with the token and its renewal.
 */
module.exports = {
    issue: (email) => {
        return issueToken(email);
    },
    validate: (token) => {
        let status = {
            isValid: false,
            isExpired: false,
            renewedToken: ``
        };

        jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
            if (decoded) {
                status.isValid = true;
            } else if (err.message === `jwt expired`) {
                let allowedExpirationDate = new Date();

                allowedExpirationDate.setDate(allowedExpirationDate.getDate() - 7);
                status.isValid = true;
                status.isExpired = true;

                // We'll renew the token if it hasn't been expired for more than seven days.
                if (allowedExpirationDate < err.expiredAt) {
                    /* let manualDecode = new Buffer(token, `base64`).toString(),
                        email = ``;

                    try {
                        email = manualDecode.match(/"email":"\w+\.\w+@saggezza\.com"/);
                        email = email[0].replace(/"/g, ``).replace(`email`, ``).replace(/:/, ``);

                        status.renewedToken = issueToken(email);
                    } catch (err) {
                        return status;
                    } */
                    const email = manualDecode(token);

                    if (email) {
                        status.renewedToken = issueToken(email);
                    } else {
                        return status;
                    }
                }
            }
        });
        return status;
    },
    returnDecodedToken: (token) => {
        return manualDecode(token);
    }
};

function issueToken (email) {
    return jwt.sign({
        email: email
    },
    process.env.TOKEN_KEY, {
        expiresIn: `1s`
    });
}

function manualDecode (token) {
    let manualDecode = new Buffer(token, `base64`).toString(),
        email = ``;

    try {
        email = manualDecode.match(/"email":"\w+\.\w+@saggezza\.com"/);
        email = email[0].replace(/"/g, ``).replace(`email`, ``).replace(/:/, ``);
    } catch (err) {
        email = false;
    } finally {
        return email;
    }
}
