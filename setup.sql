\c cs375mapline2026

-- use this to clear any existing tables to reinsert fresh data
-- you'll need to add a DROP TABLE for every table you add
-- we don't drop the database because that causes errors with fly
DROP TABLE IF EXISTS markers;
DROP TABLE IF EXISTS maps;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS accounts;

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE,
    password VARCHAR(30)
);

CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INT,
    friend_id INT,
    status VARCHAR(8) DEFAULT 'pending'
);

CREATE TABLE maps (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(30) REFERENCES accounts(username),
    name VARCHAR(150)
);

CREATE TABLE markers (
    id SERIAL PRIMARY KEY,
    map_id INT REFERENCES maps(id) ON DELETE CASCADE,
    marker_id VARCHAR(36),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    title VARCHAR(150),
    description TEXT,
    image BYTEA,
    dt TIMESTAMP
);

\q