const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const ejs = require('ejs');

app.use(express.json()); // body-parser
app.use(cookieParser());

const fs = require('fs');
const path = require('path');

// Data base
require('./src/database');
let ProductModel = require('./src/models/product');
let UsersModel = require('./src/models/users');
const { response } = require('express');


// npm install bcryptjs --save
const bcrypt = require("bcryptjs");

// Multer is a middleware that allows to store uploaded files
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage});


////////
//HOME//
////////

app.route('/').get((req, res) =>{
    res.redirect('/login');
});

app.route('/cart').get((req, res) =>{
    res.redirect('/shop');
});

////////////////////
//authentification//
////////////////////

const secret = "5tr0n6P@55W0rD";

function generateToken(user) {
    let payload = {
     username: user.name,
     id: user._id,
    };
    let oneDay = 60 * 60 * 24;
    return token = jwt.sign(payload, secret, { expiresIn: oneDay });
}


// middleware that add the user
function requireLogin(req, res, next){
    let accessToken = req.cookies.authorization
    // if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){ 
        console.log('Unauthorized user, redirecting to login'); 
        return res.redirect('/'); 
    }

    try{
        // use the jwt.verify method to verify the access token, itthrows an error if the token has expired or has a invalid signature
        payload = jwt.verify(accessToken, secret)
        // console.log('Logged user accessing the site ' + payload.username);
        req.user = payload; // you can retrieve further details from the database. Here I am just taking the name to render it wherever it is needed.
        next()
    }
    catch(e){
        //if an error occured return request unauthorized error, or redirect to login
        // return res.status(401).send():
        res.redirect(403, '/');
    }
}

function checkIfSameId(req, res, next){
    if (req.user && req.params.id == req.user.id){
	next()
    } else { 
        console.log('Unauthorized user, redirecting to shop'); 
        return res.redirect(403, '/shop'); 
    }
}

function checkIfAdmin(req, res, next){
    if (req.user && "admin" == req.user.username){
	next()
    } else { 
        console.log('Unauthorized user, redirecting to shop'); 
        return res.redirect(403, '/shop'); 
    }
}

////////
//CART//
////////

//Html Page of the shop
app.get('/shop', requireLogin, function(req, res){

    let id = req.user.id
   
    ejs.renderFile('./src/pages/shop.html', {userId: id}, null, function(err, str){
        if (err) res.status(503).send('error when rendering the view: ${err}'); 
        else {
            res.end(str);
        }
    });
});

//to check a specific product in the user´s cart
app.get('/cart/:id', requireLogin, checkIfSameId, async (req, res) => {
    let userId  = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
   
    if (user){
        res.send(user);
	}
    else
        res.status(404).end(`User with id ${userId} does not exist`)
});

// To edith a user's cart
app.post('/changecart/:id', requireLogin, checkIfSameId, async (req, res) => {
    let userId = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    user.cart = req.body.cart;
    user.save()
    .then(user => res.send(user))
    .catch(err => { console.log(error); res.status(503).end(`Could not update user ${error}`); });
});

//to add a product to user´s cart
app.post('/addCart/:id', requireLogin, checkIfSameId, async (req, res) => {
    let userId = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    let productName = req.body.productName;
    let productAmount = req.body.amount;
    
    if(productAmount == 0){
	user.cart.delete(productName);
    } else {
	user.cart.set(productName, productAmount);
    }
    user.save()
    .then(user => res.send(user))
    .catch(err => { console.log(error); res.status(503).end(`Could not update user ${error}`); });
});

// To empty user'scart
app.get('/emptycart/:id', requireLogin, checkIfSameId, async (req, res) => {
    let userId = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    user.cart = {};
    user.save()
    .then(user => res.redirect('/shop'))
    .catch(err => { console.log(error); res.status(503).end(`Could not update user ${error}`); });
});


/////////
//USERS//
/////////
// Html page to creating user record
app.get('/users/register', (req, res) => {
    res.sendFile('register.html', {root: './src/pages/users/'});
});

// to register a user
app.post('/users/register', upload.single('avatar'), (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    avatarObject = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        contentType: 'image/jpg'
    };
    
    let user = new UsersModel({name: name, email: email, password: password, avatar:avatarObject, cart:{}});
    user.save((err) => {
        if (err) res.status(503).send(`error: ${err}`); 
        else res.send(user);
    });
});

// Html page for updating
app.get('/users/:id/edit', requireLogin, checkIfSameId, function(req, res){
    let userId  = req.params.id;
    ejs.renderFile('./src/pages/users/edit.html', {userId: userId}, null, function(err, str){
        if (err) res.status(503).send(`error when rendering the view: ${err}`); 
        else {
            res.end(str);
        }
    });
});

// to get a user's data and to be updated
app.get('/users/:id', requireLogin, checkIfSameId, async (req, res) => {
    let userId  = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    if (user)
        res.send({
            _id: user._id, 
            name: user.name, 
            email: user.email,
            password: "",
            avatar: {
                contentType: user.avatar.contentType,
                data: user.avatar.data.toString('base64')
            }
        });
    else
        res.status(404).end(`User with id ${userId} does not exist`)
});

// to modify a user's data
app.put('/users/:id', requireLogin, checkIfSameId, upload.single('avatar'), async (req, res) => {
    let userId = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    user.name = req.body.name;
    user.email = req.body.email;
    if(req.body.password != ""){
	user.password = req.body.password;
    }

    if (req.file){
        console.log('User modified the avatar');
        avatarObject = {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/jpg'
        };
        user.avatar = avatarObject;
    }

    user.save()
    .then(user => res.send(user))
    .catch(err => { console.log(error); res.status(503).end(`Could not update user ${error}`); });
});

// to delete user
app.delete('/users/:id', requireLogin, checkIfSameId, function(req, res) {
    let userId  = req.params.id;
    UsersModel.findOneAndDelete({_id: userId})
    .then(user => res.send(user))
    .catch(err => { console.log(error); res.status(503).end(`Could not delete user ${error}`); });
});

// Html after checking the passwords
app.route('/login/').get((req, res) => {
    res.sendFile('login.html', {root: './src/pages/users/'}); 
})

// to check the passwords
app.route('/login/').post(async (req, res) => {
    let {email, password} = req.body;
    let user = await UsersModel.findOne({email: email});
    if (user){
        let success = bcrypt.compareSync(req.body.password, user.password);
        if (success === true){
            const accessToken = generateToken(user);
            res.cookie("authorization", accessToken, {secure: true, httpOnly: true});
            res.status(200).json(accessToken);
        }else
            res.status(404).send('Invalid credentials');
    }
    else{
        res.status(404).send('Invalid credentials');
    }
    
});

//to log out a user
app.post('/logout', requireLogin, function(req, res){
    console.log(`Logging out ${req.user.username}`)
    res.clearCookie('authorization');
    res.send('User logged out');
});

////////////
//Products//
////////////

//Html page to create products (ADMIN)
app.get('/products/create', requireLogin, checkIfAdmin, function (req, res){
    res.sendFile('insert.html', {root: './src/pages/products/'});
});

//to create product (ADMIN)
app.post('/products/create', requireLogin, checkIfAdmin, function (req, res){
    let{ name, price, brand} = req.body; // JS object deconstruction
    
    let product = new ProductModel({name: name, price: price, brand: brand});
    product.save((err) => {
        if (err) res.status(503).send('error: ${err}'); 
        else res.send(product);
    });
});

//Html page to view all products (ADMIN)
app.get('/products/all', requireLogin, checkIfAdmin, function (req, res){
    res.sendFile('productsList.html', {root: './src/pages/products/'});
});


//to see all products (USER)
app.get('/products', requireLogin, async (req, res) => {
    let allProducts = await ProductModel.find();
    res.send(allProducts);
});

//to see a specific product (USER)
app.get('/products/:id', requireLogin, async (req, res) => {
    let productId  = req.params.id;
    let product = await ProductModel.findOne({_id: productId});
    if (product)
        res.send(product);
    else
        res.status(404).end('product with id ${productId} does not exist')
});

//to edith a product (ADMIN)
app.put('/products/:id', requireLogin, checkIfAdmin, (req, res) => {
    let productId  = req.params.id;
    let{ name, price, brand } = req.body;
    ProductModel.findOneAndUpdate(
        {_id: productId}, // selection criteria
        {
            name: name,
            price: price,
            brand: brand
        }
    )
    .then(product => res.send(product))
    .catch(err => { console.log(error); res.status(503).end('Could not update product ${error}'); });
});

//to delete a product (ADMIN)
app.delete('/products/:id', requireLogin, checkIfAdmin, (req, res) => {
    let productId  = req.params.id;
    ProductModel.findOneAndDelete({_id: productId})
    .then(product => res.send(product))
    .catch(err => { console.log(error); res.status(503).end('Could not delete product '+error); });
});

//to edith a product (ADMIN)
app.get('/products/:id/edit', requireLogin, checkIfAdmin, (req, res) => {
    let productId  = req.params.id;

    ejs.renderFile('./src/pages/products/edit.html', {productId: productId}, null, function(err, str){
        if (err) res.status(503).send('error when rendering the view: ${err}'); 
        else {
            res.end(str);
        }
    });
});

//to insert many products (ADMIN)
app.get('/products/insert/insertMany/',  requireLogin, checkIfAdmin, (req, res) => {
    for (i=0; i<10; i++){
        name = generateRandomString(10);
        price = generateRandomInt(200,500);
        brand = generateRandomString(20);

        let product = new ProductModel({name: name, price: price, brand:brand});
        product.save((err) => {
            if (err) res.status(503).send('error: ${err}'); 
        });
    }
    res.send('done');
});


/////////////
//Functions//
/////////////

const portNumber = 3000;
var server = app.listen(portNumber, function(){
    console.log('Express Server ready and running');
});

function generateRandomString(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
}

function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}