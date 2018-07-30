const express = require(`express`);
const helmet = require(`helmet`);
const cors = require(`cors`);
const bodyParser = require(`body-parser`);
const morgan = require(`morgan`);
const port = 8000;

// Configure environment variables.
require(`dotenv`).config();

// Set up the express app
const app = express();

app.use(cors());
app.use(helmet());

// Log requests to the console.
app.use(morgan(`dev`));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Database Connection
const {
    Client
} = require(`pg`);
const connectionString = `postgresql://${process.env.AODB_USER}:${process.env.AODB_PASSWORD}@10.2.2.49:5432/aodb`;
const client = new Client({
    connectionString: connectionString,
});
client.connect().then(() => {
    console.log(`Database connection established...`);
}).catch(() => {
    console.log(`Unable to connect to database...`);
});

require(`./routes`)(app, client);

// Start the server.
app.listen(port);
