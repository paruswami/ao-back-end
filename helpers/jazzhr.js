const https = require(`https`),
    apiBaseURL = `https://api.resumatorapi.com/v1`;

module.exports = {
    searchApplicant: (searchCriteria) => {
        let queryParams = `/applicants`;

        // Build our string of search parameters.
        for (let param in searchCriteria) {
            if (param.length) {
                queryParams += `/${param}/${searchCriteria[param]}`;
            }
        }

        return new Promise((resolve) => {
            call.get(queryParams).then((response) => {
                /**
                 * If it's a single object, we dump it into an array.
                 */
                if (Object.prototype.toString.call(response) !== `[object Array]`) {
                    response = [response];
                }

                resolve(response);
            }).catch(() => {
                resolve([]);
            });
        });
    },
    /**
     * function that takes a Jazz ID and 
     * returns a candidate object from JazzHR
     * (containing email, firstName, etc.)
     */
    selectApplicant: (id) => {
        const queryParams = `/applicants/${id}`;
        return new Promise((resolve) => {
            //using get function defined below to return information
            call.get(queryParams).then((response) => {
                resolve(response);
            }).catch(() => {
                resolve({});
            });
        });
    },

    /**
     * function that takes a Job ID from Jazz and
     * returns a job object from jazzHR 
     * (containing title, country_id, etc.)
     */
    getJob: (jobId) => {
        const queryParams = `/jobs/${jobId}`;

        return new Promise((resolve) => {
            call.get(queryParams).then((response) => {
                resolve(response);
            }).catch(() => {
                resolve({});
            });
        });
    }
};

/**
 * function that makes a general api call to jazz
 * that takes a set of query parameters as input;
 * if fixes these parameters to the end of the url 
 * in the call
 */
const call = {
    get: (queryParams) => {
        const fullURL = encodeURI(`${apiBaseURL}${queryParams}?apikey=${process.env.JAZZHR_KEY}`);

        let payload = ``;

        return new Promise((resolve, reject) => {
            https.get(fullURL, (response) => {
                response.on(`data`, (data) => {
                    payload += data;
                })
                    .on(`end`, () => {
                        resolve(JSON.parse(payload));
                    })
                    .on(`error`, () => {
                        reject();
                    });
            });
        });
    },
    post: () => {

    }
};
