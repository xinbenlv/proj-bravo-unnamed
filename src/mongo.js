module.exports = function (app) {
    const MongoClient = require('mongodb').MongoClient;
    const MONGO_URL = "mongodb://heroku_4tl0fqj3:d38bdstnh35eh6m89afns2hfv4@ds249583.mlab.com:49583/heroku_4tl0fqj3";
    MongoClient.connect(MONGO_URL)
        .then((connection) => {
        app.accounts = connection.collection("accounts");
        console.log("Database connection established");
    })
        .catch((err) => console.error(err));
};
//# sourceMappingURL=mongo.js.map