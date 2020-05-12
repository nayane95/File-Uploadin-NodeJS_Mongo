const express = require('express');

const bodyParser = require('body-parser');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const mongodb = require('mongodb');

const app = express();

// use the middleware of bodyParser

app.use(bodyParser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage
})

//configuring mongodb

const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, {
    useUnifiedTopology: true, useNewUrlParser: true
}, (err, client) => {
    if (err) return console.log(err);

    db = client.db('images');

    app.listen(3000, () => {
        console.log('Mongodb Server Listening at 3000')
    })
})

// Configuring the home route

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

//configuring the upload file route 
// single contains the name value of index.html file myFile
app.post('/uploadFile', upload.single('myFile'), (req, res, next) => {
    const file = req.file;

    if (!file) {
        const error = new Error("Please upload the File");
        error.httpStatusCode = 400;
        return next(error);
    }
    res.send(file);
})

//configure the multiple file route
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res) => {
    const files = req.files;
    if (!files) {
        const error = new Error("Please choose File");
        error.httpStatusCode = 400;
        return next(error);
    }
    //no error
    res.send(files);
})

//configuring the image upload to the database

app.post('/uploadphoto',upload.single('myImage'),(req,res) => {
  var img=fs.readFileSync(req.file.path);
  var encode_image=img.toString('base64');

  //define a json object for the image

  var finalImg={
      contentType:req.file.mimetype,
      path:req.file.path,
      image:new Buffer(encode_image,'base64') 
  };
  ///insert the image to database
  db.collection('image').insertOne(finalImg,(err,result) => {
    console.log(result);

    if(err) return console.log(err);

    console.log("saved to DB");

    res.contentType(finalImg.contentType);

    res.send(finalImg.image);
  });
})
app.listen(5000, () => {
    console.log("Server is Listening on port 5000");
})