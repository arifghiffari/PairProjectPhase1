const express = require('express');
const session = require('express-session');
const app = express();
const routers = require('./routers');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'alakslsadklasd123021kndsankasds', 
    resave: false,
    saveUninitialized: false
}));

app.use(routers);

app.listen(port, () => {
    console.log('Surfin on PORT', port);
});
