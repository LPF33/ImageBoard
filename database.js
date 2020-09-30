var spicedPg = require("spiced-pg");
var dbUrl = process.env.DATABASE_URL || "postgres:lars:lars@localhost:5432/image";
var db = spicedPg(dbUrl);

exports.getMoreImages = lastID => {
    return db.query('SELECT * FROM images WHERE created_at<$1 ORDER BY created_at DESC LIMIT 3;',
    [lastID]);
}

exports.addImage = (url, username , title , description, tags) => {    
    return db.query('INSERT INTO images (url, username , title , description, tags) VALUES ($1,$2,$3,$4,$5) RETURNING *;',
    [url, username , title , description,tags]);
};

exports.getComments = id => {
    return db.query('SELECT * FROM comments WHERE image_id = $1 ORDER BY commentdate DESC;', 
    [id]);
};

exports.addComment = (username, commenttext, image_id) => {
    return db.query('INSERT INTO comments (username, commenttext, image_id) VALUES ($1,$2,$3) RETURNING *;',
    [username, commenttext, image_id]);
};

exports.getImage = id => {
    return db.query(`SELECT *,(SELECT id FROM images WHERE id<$1 ORDER BY id DESC LIMIT 1) AS previousId, 
                    (SELECT id FROM images WHERE id>$1 ORDER BY id ASC LIMIT 1) AS nextId  FROM images WHERE id = $1;`, 
    [id]);
};

exports.deleteImage = id => {
    return db.query('DELETE FROM reply WHERE image_id = $1', [id])
        .then( () => db.query('DELETE FROM comments WHERE image_id = $1',[id])
            .then( () => db.query('DELETE FROM images WHERE id = $1;',[id])));    
};

exports.addReply = (username, replytext, comment_id, image_id) => {
    return db.query('INSERT INTO reply (username, replytext, comment_id, image_id) VALUES ($1,$2,$3,$4) RETURNING *;',
    [username, replytext, comment_id,image_id]);
};

exports.getTagImages = tagtext => {
    return db.query(`SELECT * FROM images WHERE tags LIKE $1;`,
    ['%'+tagtext+'%'])};

exports.getReply = imageId => {
    return db.query('SELECT * FROM reply WHERE image_id = $1',
    [imageId]);
}
