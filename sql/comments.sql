DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    commenttext VARCHAR NOT NULL,
    commentdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_id INTEGER NOT NULL REFERENCES images(id)
);