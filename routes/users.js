
module.exports = io => {

    const express = require('express');
    const mongo = require('mongodb').MongoClient;
    const objectId = require('mongodb').ObjectID;
    const router = express.Router();
    const db = require('../config/keys').mongoURI;
    const multer = require('multer');
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './client/public/images/');
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '-' + Date.now() + '.png');
        }
    })
    const upload = multer({
        storage: storage
    }).single('upload');


    /*

        Until I can find a different (better) way for the server to check 
        for birthdays on the current day, setInterval is my only solution

    */

    setInterval(() => {
        mongo.connect(db, {useNewUrlParser: true} ,(err, client) => {
            console.log(new Date());
            const today = new Date().toDateString().split(/^\w*\s|\s\d+$/).join('');
            const bDayRegEx = new RegExp(today);
            client.db('metam8').collection('users').updateMany({
                "dob": {$regex: bDayRegEx}
            }, {$inc: {"age": 1}})
            client.db('metam8').collection('users').find({
                "dob": {$regex: bDayRegEx}
            }).toArray((err, r) => {
                if(err){ 
                    console.log(err)
                }else if(r.length){
                    r.forEach(r => {
                        console.log(`${r.f_name} ${r.l_name} is ${r.age} years old today!`)
                    })
                }else{
                    console.log("No birthdays today!")
                }
            })
            client.close();
        });
    }, 8.64e+7)


    // login
    router.post('/login', (req, res, next) => {
        const account = {
            "username": req.body.username,
            "password": req.body.password
        }
        mongo.connect(db, {useNewUrlParser: true} ,(err, client) => {
            client.db('metam8').collection('users').findOne(account, (err, r) => {
                if (err) {
                res.send(err);
                } else if (r) {
                res.send(r);
                } else {
                res.send('Username or password invalid!');
                }
            });
            client.close();
        });
    });

    io.on('connection', socket => {
        console.log('user connected...')

        socket.on('setUser', data => {
            console.log(data)
            mongo.connect(db, {useNewUrlParser: true} ,(err, client) => {
                client.db('metam8').collection('users').updateOne({username: data.username}, { $set: {socketID: data.socketID}}, (err, r) => {            
                    if (err) {
                    console.log(err);
                    } else {
                    console.log(`Socket ID was set to ${data.socketID}`)
                    }
                });
                client.close();
            });
        });

        socket.on('join room', room => {
            socket.join(room);
        });

        socket.on('disconnect', () => {console.log('User is offline...')});

        socket.on('user typing', (name, id) => {
            socket.broadcast.to(id).emit('user typing', name);
        });

        /*

            Fetch users
            Filter out according to users who have already been swiped
            Filters according to default preferences but can also be set

        */


        router.post('/', (req, res, next) => {
            const userType = {
                "gender": req.body.prefs.gender,
                "minAge" : req.body.prefs.minAge,
                "maxAge" : req.body.prefs.maxAge,           
                "location" : req.body.prefs.location,
                "likes": req.body.likes,
                "dislikes": req.body.dislikes
            }, 
            filterOutArr = [];
            
            userType.likes.map(user => filterOutArr.push(user.username));
            userType.dislikes.map(user => filterOutArr.push(user.username));
            
            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {


                client.db('metam8').collection('users').find({ 
                    "gender": userType.gender,
                    "location": userType.location,
                    "age": { $gte: userType.minAge, $lte: userType.maxAge},
                    "username" : { $nin : filterOutArr }
                }).toArray((err, r) =>{
                    if(err){
                    res.send(err);
                    } else {
                    res.send(r);
                    }
                });

            });
        });


        /*

            User interactions

            Stores actions performed on the user whether liked or disliked
            and stores user info within an array

        */


        router.post('/action', (req, res, next) => {
            const id = req.body._id,
                user = {
                    "_id": objectId(id)
                },
                action = req.body.action,
                mate = req.body.user;
            console.log(`${mate.f_name} has been added to ${action}`)
            mongo.connect(db, {useNewUrlParser: true} ,(err, client) => {
                client.db('metam8').collection('users').updateOne(user, { $addToSet: {[action]: mate}}, (err, r) => {            
                    if (err) {
                    res.send(err);
                    } else {
                    res.send(r);
                    }
                });
                client.close();
            });
        });


        // Create User


        router.post('/register', (req, res, next) => {
            const 
            
            bday = req.body.dob,

            getAge = (y,m,d) => {
                const today = new Date(),
                    birthday = new Date(y, m, d);
                return Math.floor((Date.parse(today) - Date.parse(birthday)) / 3.154e+10);
            },

            account = {
                "f_name" : req.body.f_name,
                "l_name" : req.body.l_name,
                "username": req.body.username,
                "email": req.body.email,
                "password": req.body.password,
                "likes": [],
                "dislikes": [],
                "location": req.body.location,
                "dob": new Date(bday.year, bday.month, bday.date).toDateString().split(/^\w*\s/).join(''),
                "age": getAge(bday.year, bday.month, bday.date),
                "gender": req.body.gender,
                "avatar": req.body.avatar,
                "geo": {
                    "lat": 0,
                    "lon": 0
                }
            }
            mongo.connect(db, {useNewUrlParser: true} ,(err, client) => {
                client.db('metam8').collection('users').insertOne(account, (err, r) => {
                    console.log(`Welcome ${account.f_name} ${account.l_name}!`);
                });
                client.close();
            });
        });

        /* 

            Uploaded pictures are controlled through this section

        */

        router.post('/uploadPic', upload, (req, res, next) => {
            
            const fileName = req.file.filename;
            
            upload(req,res,(err) => {
                if(err){
                    res.send(err)
                } else if(req.file === undefined){
                    res.send('Please select a file!');
                } else {
                    res.send('./images/'+ fileName)
                }
            });
        });


        /* 

            Updates the path for the uploaded picture to use 
            as a profile picture

        */

        router.post('/updateAvatar', (req, res, next) => {
            console.log('update avatar was called')
            const id = req.body._id,
                user = {
                    "_id": objectId(id)
                },
                newPath = req.body.avatar;
            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').updateOne(user, {$set: {"avatar": newPath}}, (err, r) => {
                    if(err){
                    res.send(err);
                    } else {
                    res.send(r)
                    }
                });
                client.close();
            });
        });

        router.post('/updateBio', (req, res, next) => {
            console.log('update avatar was called')
            const id = req.body._id,
                user = {
                    "_id": objectId(id)
                },
                bio = req.body.bio;
            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').updateOne(user, {$set: {"bio": bio}}, (err, r) => {
                    if(err){
                    res.send(err);
                    } else {
                    res.send(r)
                    }
                });
                client.close();
            });
        });

        // To-Do Update the following code...

        // Update User, profile pictures, geo-location, etc.

        router.post('/geo', (req, res, next) => {
            const id = req.body._id,
                user = {
                    "_id": objectId(id)
                },
                lat = req.body.lat,
                lon = req.body.lon;
            console.log('geolocation added to db for calculating distance');
            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').updateOne(user, {$set: {"geo": { "lat": lat, "lon": lon }}}, (err, r) => {
                    if(err){
                    res.send(err)
                    } else {
                    res.send(r)
                    }
                });
                client.close();
            });
        });

        // Match the users

        router.post('/matchRequest', (req, res, next) => {
            const match_id = req.body.match_id,
            matchUser = {
                "_id": objectId(match_id)
            },
            username = req.body.username,
            f_name = req.body.f_name,
            l_name = req.body.l_name,
            avatar = req.body.avatar,
            newMatch = {
                username: username,
                f_name: f_name,
                l_name: l_name,
                avatar: avatar,
                socketID: req.body.socketID,
                messages: []
            }

            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').updateOne(matchUser, {$addToSet: {"matches": newMatch}}, (err, r) => {
                    if(err){
                    res.send(err);
                    } else {
                    res.send(r);
                    }
                });
                client.close();
            });
        });

        router.post('/matchAccept', (req, res, next) => {
            const id = req.body._id,
            user = {
                "_id": objectId(id)
            },
            matchUsername = req.body.matchUsername,
            matchFname = req.body.matchFname,
            matchLname = req.body.matchLname,
            matchAvatar = req.body.matchAvatar,
            newMatch = {
                username: matchUsername,
                f_name: matchFname,
                l_name: matchLname,
                avatar: matchAvatar,
                socketID: req.body.socketID,
                messages: []
            }
            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').updateOne(user, {$addToSet: {"matches": newMatch }}, (err, r) => {
                    if(err){
                    res.send(err);
                    } else {
                    res.send(r);
                    }
                });
                client.close();
            });
        });

        // Messages
        //   Sent
        socket.on('messageSent', (msg, from, id, to) => {
            const sender = {
                "username": from,
                "matches.username": to
            },
            receiver = {
                "username": to,
                "matches.username": from   
            };

            io.to(id).emit('messageSent', {text: msg, from: from, time: new Date(Date.now()), to: to});
            //socket.emit('messageSent', {text: msg, from: from, time: new Date(Date.now()), to: to});

            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').updateOne(sender, {$addToSet: {"matches.$.messages": {from: from, time: new Date(), text: msg} }} , (err, r) => {
                    if(err) console.log(err)
                    //io.emit('messageSent', {text: msg, from: from, time: new Date(Date.now()), to: to})
                });
                client.db('metam8').collection('users').updateOne(receiver, {$addToSet: {"matches.$.messages": {from: from, time: new Date(), text: msg} }} , (err, r) => {
                    if(err) console.log(err)
                    console.log(`${from}: ${msg}`)
                    console.log(`Sent to ${id}`)
                });
            });
            
        });

        // Delete User

        router.post('/deleteAccount', (req, res, next) => {
            const id = req.body._id,
                user = {
                "_id": objectId(id)
                }
            console.log('delete account was called')
            mongo.connect(db, {useNewUrlParser: true}, (err, client) => {
                client.db('metam8').collection('users').deleteOne(user, (err, r) => {
                    if(err){
                    res.send(err);
                    } else {
                    console.log(r)
                    console.log(`User id: ${id} has been deleted!`);
                    }
                });
                client.close();
            });
        });
    });

    return router;

}