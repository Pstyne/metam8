const express = require('express');

const app = express();
const http = require('http').Server(app);

const port = process.env.PORT || 5000;
const io = require('socket.io')(http);
const users = require('./routes/users')(io);


app.use(express.json());
app.use(express.urlencoded( {extended: false} ));

app.use('/users', users);

http.listen(port, () => console.log(`Server listening on port ${port}`));