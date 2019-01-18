const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const users = require('./routes/api/user');
const app = express();

// Body parser Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
// DB Config
const db = require('./config/keys').mongoURI;
// connect to mongodb
mongoose.connect(db).then(()=>console.log('mongodb Connected'))
.catch(err => console.log(err));

// passport middleware

app.use(passport.initialize());

// passport Config

require('./config/passport')(passport);

// use Routes

app.use('/api/users',users);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port : ${port}`));
