DROP DATABASE IF EXISTS accounts;
CREATE DATABASE accounts;
\c accounts
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30),
    password VARCHAR(30)
);
CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INT,
    friend_id INT,
    status VARCHAR(30)
);
CREATE TABLE maps (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES accounts(id),
    name VARCHAR(50)
);

CREATE TABLE markers (
    id SERIAL PRIMARY KEY,
    map_id INT REFERENCES maps(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    title TEXT,
    description TEXT,
    image BYTEA,
    dt TIMESTAMP
);