const pg = require("pg");
const express = require("express");

let app = express();
let port = 3000;
let hostname = "localhost";

app.use(express.static("public"));

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);

pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());
app.use(express.static("public"));

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const result = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, password]
        );

        console.log("Created user:", result.rows[0]);

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/login", async (req, res) => {
    const username = req.body.username;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        console.log("Retrieved user:", result.rows[0]);

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});


app.listen(port, hostname, () => {
  console.log(`Server running: http://${hostname}:${port}`);
});
