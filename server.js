const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');

const container = require('./container');

require('dotenv').config();

container.resolve(function (users, _) {
  mongoose.Promise = global.Promise;
  mongoose.connect(
    `${process.env.MONGODB_URLPRE}${process.env.MONGODB_USER}:${
      process.env.MONGODB_PASSWORD
    }${process.env.MONGODB_URLEND}`, {
      useNewUrlParser: true
    }
  );

  const app = SetupExpress();

  function SetupExpress() {
    const app = express();
    const server = http.createServer(app);
    server.listen(3000, function () {
      console.log('listening on port 3000');
    });
    // Call configureExpress function below
    ConfigureExpress(app);

    // from install express-promise-router
    const router = require('express-promise-router')();
    // passing router to users.js
    users.SetRouting(router);
    // use router we created
    app.use(router);
  }

  // configure Express
  function ConfigureExpress(app) {
    require('./passport/passport-local');
    require('./passport/passport-facebook');
    require('./passport/passport-google');

    app.use(express.static('public'));
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    app.use(validator());
    app.use(
      session({
        secret: 'thisisasecretkey',
        resave: true,
        saveInitialized: true,
        saveUninitialized: true,
        store: new MongoStore({
          mongooseConnection: mongoose.connection
        })
      })
    );
    // passport must be added after session
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    app.locals._ = _;
  }
});