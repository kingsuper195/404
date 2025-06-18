const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const qs = require('qs');
app.set('query parser',
    (str) => qs.parse(str, { /* custom options */ }));

const port = 80;

let Ukey = [['user', '1234'], ['user2', '2468']];

let oneTimeKeys = {};

const urlencodedParser = bodyParser.urlencoded();
const jsonParser = bodyParser.json();

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function login(body) {
    console.log(body.user, body.key);
    for (let i = 0; i < Ukey.length; i++) {
        const user1 = Ukey[i];
        if (body.user === user1[0] && body.key === user1[1]) return true;
    }

    return false;

}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/boring.html'));
});

app.get('/home', (req, res) => {
    if (req.query.key !== undefined) {
        if (oneTimeKeys[req.query.key] !== undefined) {
            res.sendFile(path.join(__dirname, "/../public/index.html"));
        }
        else {
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(401);
    }
});

app.get('/bootstrap', (req, res) => {
    res.sendFile(path.join(__dirname, '/../public/bootstrap.min.css'));
});

app.get('/api/key/secret/users', (req, res) => {
    res.sendFile(path.join(__dirname, "/../public/sign.html"));
});

app.post("/", urlencodedParser, (req, res) => {
    if (login(req.body)) {
        let key = getRandomInt(100000000000000, 999999999999999);
        oneTimeKeys[key] = { 'uname': req.body.user };
        res.redirect('/home?key=' + key.toString());
    } else {
        res.sendStatus(401);
    }
});

app.get("/eyes", (req, res) => {
    res.sendFile(path.join(__dirname, "/../public/eyes.html"));
});

app.get("/ball", (req, res) => {
    res.sendFile(path.join(__dirname, "/../public/ball.html"));
});

app.get("/input", (req,res)=>{
    res.sendFile(path.join(__dirname, "/../public/input.html"));
});

app.post("/api/users", jsonParser, (req, res) => {
    if (oneTimeKeys[req.body.key] !== undefined) {
        res.send(JSON.stringify({ 'user': oneTimeKeys[req.body.key] }));
        delete oneTimeKeys[req.body.key];
    } else {
        res.sendStatus(404);
    }
});

app.post('/api/keys/secret/checkt', jsonParser, (req, res) => {
    if (req.body?.keys) {
        if (typeof req.body.keys == 'string' && req.body.keys.endsWith('login')) {
            res.send(JSON.stringify({ path: '/api/key/secret/users' }));
        } else if (typeof req.body.keys == 'string' && req.body.keys.endsWith('b')) {
            res.send(JSON.stringify({ path: '/input' }));
        }
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
