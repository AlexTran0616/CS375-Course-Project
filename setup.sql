DROP DATABASE IF EXISTS accounts;
CREATE DATABASE accounts;
\c accounts

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