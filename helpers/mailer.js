const nodemailer = require(`nodemailer`);

module.exports = {
    sendInternalEmail: (employeeEmail) => {
        const transporter = nodemailer.createTransport({
            service: `gmail`,
            auth: {
                user: process.env.INTERNAL_EMAIL,
                pass: process.env.INTERNAL_EMAIL_PASSWORD
            }
        });

        /* We'll actually need to point to email
        templates here instead of encoding a message
        right here. */
        const mailOptions = {
            from: process.env.INTERNAL_EMAIL,
            to: employeeEmail,
            subject: `Test Message`,
            html: `This is a test email!`
        };

        return new Promise((resolve) => {
            sendMail(transporter, mailOptions).then((sendConfirmation) => {
                resolve(sendConfirmation);
            });
        });
    },
    sendCandidateEmail: () => {

    }
};

function sendMail (transporter, mailOptions) {
    return new Promise((resolve) => {
        transporter.sendMail(mailOptions, (err, info) => {
            let sendConfirmation = false;

            if (err) {
                sendConfirmation = false;
            } else {
                sendConfirmation = true;
            }
            resolve(sendConfirmation);
        });
    });
}
