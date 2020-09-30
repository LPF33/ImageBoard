DROP TABLE IF EXISTS reply;

CREATE TABLE reply(
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    replytext VARCHAR NOT NULL,
    replydate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment_id INTEGER NOT NULL REFERENCES comments(id),
    image_id INTEGER NOT NULL
);