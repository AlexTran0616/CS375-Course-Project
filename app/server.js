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

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile("public/login.html", {root: __dirname });
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const result = await pool.query(
            "INSERT INTO accounts (username, password) VALUES ($1, $2) RETURNING *",
            [username, password]
        );

        console.log("Created account:", result.rows[0]);

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
            "SELECT * FROM accounts WHERE username = $1 AND password = $2",
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
            message: "Login successful!",
            id: result.rows[0].id,
            username: result.rows[0].username
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Database error"
        });
    }
});

app.post("/search", async (req, res) => {
    const username = req.body.username;
    

    try {
        const result = await pool.query(
            "SELECT id, username FROM accounts WHERE username LIKE $1",
            [`${username}%`]
        );
    
        res.json(result.rows);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/add-friend", async (req, res) => {
    const userID = req.body.userID;
    const friendID = req.body.friendID;

    try {
        await pool.query(
            "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)",
            [userID, friendID]
        );

        res.json({
            success: true,
            message: "Friend added."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Could not add friend."
        });
    }
});

app.get("/friends", async (req, res) => {

    const userID = req.query.userID;

    try {
        const result = await pool.query(
            `SELECT DISTINCT accounts.id, accounts.username
             FROM friends
             JOIN accounts
             ON accounts.id =
                CASE
                    WHEN friends.user_id = $1 THEN friends.friend_id
                    ELSE friends.user_id
                END
             WHERE (friends.user_id = $1 OR friends.friend_id = $1)
             AND friends.status = 'accepted'`,
            [userID]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not get friends."
        });
    }
});

app.get("/friend-requests", async (req, res) => {

    const userID = req.query.userID;

    try {
        const result = await pool.query(
            `SELECT accounts.id, accounts.username
             FROM friends
             JOIN accounts ON friends.user_id = accounts.id
             WHERE friends.friend_id = $1
             AND friends.status = 'pending'`,
            [userID]
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not get friend requests."
        });
    }
});

app.post("/accept-friend", async (req, res) => {

    const userID = req.body.userID;
    const friendID = req.body.friendID;

    try {
        await pool.query(
            `UPDATE friends
             SET status = 'accepted'
             WHERE user_id = $1
             AND friend_id = $2
             AND status = 'pending'`,
            [friendID, userID]
        );

        res.json({
            success: true,
            message: "Friend request accepted."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Could not accept friend request."
        });
    }
});

app.get("/:userID", async (req, res) => {

    const userID = req.params.userID;

    try {

        const result = await pool.query(
            "SELECT id FROM accounts WHERE id = $1",
            [userID]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found.");
        }

        res.sendFile(__dirname + "/public/index.html");

    } catch (error) {

        console.error(error);
        res.status(500).send("Database error.");

    }
});

app.post("/create-map", async (req, res) => {
    let mapOwner = req.body.owner;
    let mapName = req.body.name;
    try{
        let result = await pool.query(
            "SELECT * FROM maps WHERE owner = $1",
            [mapOwner]
        );
        if (!result.rows[0]){
            result = await pool.query(
                "INSERT INTO maps (owner, name) VALUES ($1, $2) RETURNING *",
                [mapOwner, mapName]
            );
            console.log("New MapLine added:", result.rows[0]);
        } else {
            console.log("Map already exists", result.rows[0]);
        }
        res.json(result.rows[0]);
        
    } catch(error){
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/update-map", async (req, res) => {
    let markersToAdd = req.body.markersToAdd;
    let markersToDelete = req.body.markersToDelete;
    let markersToEdit = req.body.markersToEdit;
    let mapId = req.body.mapId;

    try {
        for(let marker of markersToAdd){
            await pool.query(
                "INSERT INTO markers (map_id, marker_id, lat, lng, title, description, image, dt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [mapId, marker.id, marker.lat, marker.lng, marker.title, marker.description, marker.imageSrc, marker.eventDate]
            );
            console.log("Marker added");
        }
        for (let marker of markersToEdit) {
            await pool.query(
                "UPDATE markers SET lat = $1, lng = $2, title = $3, description = $4, image = $5, dt = $6 WHERE marker_id = $7",
                [marker.lat, marker.lng, marker.title, marker.description, marker.imageSrc, marker.eventDate, marker.id]
            );
            console.log("Marker updated");
        }
        for(let marker of markersToDelete){
            console.log(marker);
            await pool.query(
                "DELETE FROM markers WHERE marker_id = $1 RETURNING *",
                [marker]
            );
            console.log("Marker deleted")
        }
        
        console.log("Map updated");
        res.send();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.get("/load-map/:mapID", async (req, res) => {
    let mapId = parseInt(req.params.mapID);
    console.log("loading request received");
    try {
        let result = await pool.query(
            "SELECT marker_id, lat, lng, title, description, image, dt FROM markers WHERE map_id = $1;",
            [mapId]
        );
        //console.log(result.rows);
        console.log("map loaded");
        let rows = result.rows.map(row => ({
            ...row,
            image: row.image ? row.image.toString('utf8') : null
        }));
        res.json(rows);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(port, hostname, () => {
  console.log(`Server running: http://${hostname}:${port}`);
});
