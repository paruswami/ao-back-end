const token = require(`../controllers/token`);

module.exports = function (req, res, next) {
    let passedToken = req.body.token || req.params.token || req.headers[`x-access-token`] || req.headers[`authorization`];
    passedToken = token === undefined ? `` : passedToken.replace(`Bearer `, ``);

    const status = token.validate(passedToken);

    if (status.isValid && !status.isExpired) {
        next();
    } else if (status.isExpired && status.renewedToken.length) {
        // Append a new token to request.
        res.renewedToken = status.renewedToken;
        next();
    } else {
        res.status(401).send({
            payload: status
        });
    }
};
