const auth = require(`./auth`);
const admin = require(`./admin`);

const register = require(`../controllers/register`);
const login = require(`../controllers/login`);
const createCandidate = require(`../controllers/newCandidate`);
const deleteCandidate = require(`../controllers/deleteCandidate`);
const getUsers = require(`../controllers/getUsers`);
const deleteUser = require(`../controllers/deleteUser`);
const jazzhr = require(`../helpers/jazzhr`);
const importOfferedCandidates = require(`../controllers/importOfferedCandidates`);
const searchCandidate = require(`../controllers/searchCandidate`);
const returnCandidates = require(`../controllers/returnCandidates`);
const getChecklist = require(`../controllers/getChecklist`);
const changeChecklist = require(`../controllers/changeChecklist`);
const editCandidate = require(`../controllers/editCandidate`);
const changeChecklistApplicability = require(`../controllers/changeChecklistApplicability`);

let database;

module.exports = function (app, db) {
    database = db;

    /**
     * This endpoint is a non-secure API
     * status.
     */
    app.post(`/ping`, (req, res) => {
        sendResponse(res, {
            status: `alive`
        });
    });

    /**
     * This endpoint provides a status,
     * only if a valid token has been
     * provided.
     */
    app.post(`/ping-auth`, auth, (req, res) => {
        sendResponse(res, `Valid Token!`);
    });

    /**
     * Here we return a validation status to the
     * front end for the supplied JWT.
     */
    app.post(`/validate-token`, auth, (req, res, next) => {
        sendResponse(res, {
            validToken: true
        });
    });

    /**
     * This is an endpoint to register a new User.
     */
    app.post(`/register`, (req, res) => {
        register(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint handles user login and
     * the issuance of tokens.
     */
    app.post(`/login`, (req, res) => {
        login(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint allows the user to create
     * a candidate in the database.
     */
    app.post(`/create-candidate`, (req, res) => {
        createCandidate(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * Return our list of candidates.
     */
    app.post(`/return-candidates`, auth, (req, res) => {
        returnCandidates(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint allows the user to delete
     * a candidate in the database.
     */
    app.post(`/delete-candidate`, auth, isAdmin, (req, res) => {
        deleteCandidate(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint allows the user to get
     * all users in the database.
     */
    app.post(`/get-all-users`, (req, res) => {
        getUsers(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint allows the user to delete
     * certain users in the database.
     */
    app.post(`/delete-user`, auth, isAdmin, (req, res) => {
        deleteUser(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * Import any new candidates from JazzHR.
     */
    app.post(`/import-candidates`, (req, res) => {
        importOfferedCandidates(db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint allows the user to search for candidate
     * based off of a parameter specified in the req body
     */
    app.post(`/search-candidate`, (req, res) => {
        searchCandidate(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint flips the status of the specified checklist and checklist item.
     */
    app.post(`/switch-status`, (req, res) => {
        changeChecklist(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    /**
     * This endpoint edits the information of the candidate.
     */
    app.post(`/edit-candidate`, auth, isAdmin, (req, res) => {
        editCandidate(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    app.post(`/return-checklist`, (req, res) => {
        getChecklist.returnChecklist(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    app.post(`/toggle-app-checklist`, (req, res) => {
        changeChecklistApplicability(req, db).then((response) => {
            sendResponse(res, response);
        });
    });

    app.post(`/checklist-progress`, (req, res) => {
        getChecklist.returnChecklistDone(req, db).then((response) => {
            sendResponse(res, response);
        });
    });
};

/**
 * This response attempts to append a new token
 * to the body if it exists.
 */
function sendResponse (res, body) {
    res.set({
        'Content-Type': `application/json`
    })
        .send(JSON.stringify({
            payload: body,
            renewedToken: res.renewedToken
        }));
}

/**
 * This helper function combines a reference to the
 * database along with the routing information to
 * call the helper function, checking if the user
 * has the rights to perform a given action.
 */
function isAdmin (req, res, next) {
    admin(database, req, res, next);
}
