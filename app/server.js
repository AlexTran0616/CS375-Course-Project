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
}).catch(function (error) {
    console.log("Could not connect to database:", error.message);
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
    const password = req.body.password;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: "Invalid username or password."
            });
        }

        console.log("Logged in user:", result.rows[0]);

        res.json({
            success: true,
            message: "Login successful!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Database error"
        });
    }
});

app.listen(port, hostname, () => {
  console.log(`Server running: http://${hostname}:${port}`);
});
