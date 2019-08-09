var express = require('express');
var app = express();

/**
 * #### USUARIO ####
 * {
 *      username* : string<uniq>
 *      name? : string
 *      email* : string
 *      tweets : Tweet[]
 * }
 */

/**
 * #### TWEET ####
 * {
 *      id* : string<uniq>
 *      text* : string
 *      owner* : string<ID>
 *      createdAt : timestamp
 * }
 */

app.use(express.json());


var tweets = [];
var users = [];

function existUsername(username) {
    for (let i = 0; i < users.length; i++) {
        const element = users[i];
        if (element.username == username) {
            return true;
        }
    }
    return false;
}

// De mientras, despues con los ficheros no ocurre 
// el mismo problema. En realidad si ocurre pero con ficheros
function updateTweetsOnProfile(){
    for (let user_index = 0; user_index < users.length; user_index++) {
        const user = users[user_index];
        user.tweets = [];
        for (let tweet_index = 0; tweet_index < tweets.length; tweet_index++) {
            const tweet = tweets[tweet_index];
            if(user.username == tweet.owner){
                user.tweets.push(tweet);
            }
        }
    }
}

// Muestra una lista con todos los tweets
app.get('/tweets', (req, res) => {
    let order = req.query.orderBy;
    if (order == 'asc'){
        return res.json(tweets.sort((a,b) => a.createdAt - b.createdAt));
    }

    if (order == 'desc'){
        return res.json(tweets.sort((a,b) => b.createdAt - a.createdAt));
   }

    return res.json(tweets);
});

// Muestra una lista con todos los tweets
app.delete('/tweets/:id', (req, res) => {
    const id = req.params.id;

    tweets = tweets.filter(tweet => tweet.id != id);
    updateTweetsOnProfile();

    return res.json();
});

// Muestra una lista con todos los usuarios
app.get('/users', (req, res) => {
    return res.json(users);
});

// Creación de X usuario
app.post('/users', (req, res) => {
    const user = {};

    if (!req.body.username) {
        return res.status(400).send('El campo username es obligatorio');
    }

    if (existUsername(req.body.username)) {
        return res.status(400).send('El usuario ' + req.body.username + " ya existe.");
    }
    user.username = req.body.username;

    user.name = req.body.name || '@sin_nombre';

    if (!req.body.email) {
        return res.status(400).send('El campo email es obligatorio');
    }
    user.email = req.body.email;

    user.tweets = [];

    users.push(user);

    return res.json(user);
});

// Borrado de X usuario
app.delete('/users/:username', (req, res) => {
    const username = req.params.username;

    users = users.filter(user => user.username != username);

    return res.json()
});

// Modificación de X parametros de un usuario
app.patch('users/:username', (req, res) => {
    const body = req.body;
    const username = req.params.username;

    const index = users.findIndex(i => i.username === username);

    if (body.name) {
        users[index].name = body.name;
    }

    if (body.email) {
        users[index].email = body.email;
    }

    return res.json(users[index]);
});

// El usuario X manda un tweet
app.post('/:username', (req, res) => {
    const body = req.body;
    const username = req.params.username;

    // Compruebo que no se intente mandar un tweet con un usuario inexistente
    if (!existUsername(username)) {
        return res.status(400).send('El usuario ' + username + " no existe.");
    }

    const tweet = {};

    if (!body.text) {
        return res.status(400).send('El campo text del tweet es obligatorio');
    }

    tweet.id = (Date.now()*Math.random() + '').replace('.','');
    tweet.text = req.body.text;
    tweet.owner = username;
    tweet.createdAt = Date.now();

    tweets.push(tweet);
    updateTweetsOnProfile();

    return res.json(tweet);
});

// Se obtienen los tweets de X usuario
app.get('/:username', (req, res) => {
    const username = req.params.username;
    const index = users.findIndex(i => i.username === username);
    return res.json(users[index].tweets);
});

app.listen(3000, e => {
    console.log('Servidor en el puerto 3000');
});