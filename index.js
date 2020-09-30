const express = require("express");
const database = require("./database");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./S3.js");

const app = express();

app.use(express.static('public'));
app.use('/upload', express.static('uploads') );
app.use(express.json());


const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
      uidSafe(24).then(function(uid) {
          callback(null, uid + path.extname(file.originalname));
      });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.get("/images/:lastID", (request, response) => { 
    const date = new Date(request.params.lastID);
    database.getMoreImages(date)
        .then(result => {  
            response.json(result.rows)
        })
        .catch( error => console.log(error));
})

app.post('/upload', uploader.single("file"), (request, response) => {
    const URL = s3.getBucketURL(request.file.filename);
    const {username,title,description,tags} = request.body;

    database.addImage(URL,username,title,description,tags)
        .then( result => {
                s3.uploadToS3(request.file).then(result2 => {
                    response.json({
                        "success": true,
                        image: result.rows[0]
                });
            });            
        })
        .catch( error => console.log(error));      
});

app.post("/saveComments", (request,response) => {
    const {username, commenttext, image_id} = request.body;
    
    database.addComment(username,commenttext,image_id)
        .then( result => {
            response.json({
                comment: result.rows[0]
            });
        })
        .catch( error => console.log(error));
});

app.get("/imageData/:id", (request,response) => { 
    Promise.all([
        database.getComments(request.params.id),
        database.getImage(request.params.id),
        database.getReply(request.params.id)
    ])
    .then(result => { 
        if(result[1].rows.length>0){
            response.json({comments:result[0].rows,
                            image: result[1].rows[0],
                            reply: result[2].rows})
        } else {
            response.status(404).json({
                success: "failed"
            })
        }
        
    })
    .catch( error => console.log(error));
})

app.get("/deleteImage/:id", (request, response) => {
    database.deleteImage(request.params.id)
    .then(result => response.status(200).json({success: "deleted"}))
    .catch( error => console.log(error));
})

app.post("/saveReply", (request,response) => {
    const {username, replytext, comment_id, image_id} = request.body;
    
    database.addReply(username, replytext, comment_id, image_id)
        .then( result => {
            response.json({
                reply: result.rows[0]
            });
        })
        .catch( error => console.log(error));
});

app.get("/search/:tags", (request,response) => {
    database.getTagImages(request.params.tags)
    .then(result => { 
        response.json({
            images: result.rows
        })
    })
    .catch( error => console.log(error));
})

app.listen(process.env.PORT || 8080);