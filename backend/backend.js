const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = "dein_starkes_geheimes_passwort_123!u";

// Lade die geheime Konfigurationsdatei aus dem Home-Verzeichnis
const homeDirectory = os.homedir(); // Holt das Home-Verzeichnis des Benutzers
const configPath = path.join(homeDirectory, "dbConfig.json"); // Pfad zur Konfigurationsdatei

let dbConfig;

try {
    // Versuche, die Konfigurationsdatei zu lesen
    dbConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
    console.error("Fehler beim Laden der DB-Konfiguration:", err);
    process.exit(1); // Beende den Prozess, wenn die Datei fehlt oder fehlerhaft ist
}

const app = express();
const PORT = 3000; // Port für das Backend

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MariaDB-Verbindung mit den geladenen Zugangsdaten
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error("Fehler bei der Verbindung zu MariaDB:", err);
        return;
    }
    console.log("Erfolgreich mit MariaDB verbunden");
});

// API-Endpunkt: Alle Gerichte abrufen
app.get("/api/dishes", (req, res) => {
    const query = "SELECT * FROM dishes";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Fehler beim Abrufen der Gerichte:", err);
            res.status(500).send("Fehler beim Abrufen der Gerichte");
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Alle ingredients abrufen
app.get("/api/ingredients", (req, res) => {
    const query = "SELECT * FROM ingredients";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching ingredients");
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Zutaten und Mengen für alle Gerichte abrufen
app.get("/api/dish_ingredients", (req, res) => {
    const query = "SELECT * FROM dish_ingredients";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching dish_ingredients");
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Alle Nutzer abrufen
app.get("/api/users", (req, res) => {
    const query = "SELECT * FROM users";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching users");
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Alle Zuordnungen zwischen Nutzern und Gerichten abrufen
app.get("/api/user_dishes", (req, res) => {
    const query = "SELECT * FROM user_dishes";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching user_dishes");
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Gerichte mit ihren Zutaten abrufen (JOIN-basiert, effizient)
app.get("/api/dishes_full", (req, res) => {
    const query = `
        SELECT 
            d.dish_id AS dish_id,
            d.name AS dish_name,
            i.name AS ingredient_name
        FROM dishes d
        JOIN dish_ingredients di ON di.dish_id = d.dish_id
        JOIN ingredients i ON i.ingredient_id = di.ingredient_id
        ORDER BY d.dish_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Fehler bei der Abfrage von dishes_full:", err);
            res.status(500).send("Serverfehler bei /api/dishes_full");
        } else {
            const dishMap = {};
            results.forEach((row) => {
                const id = row.dish_id;
                if (!dishMap[id]) {
                    dishMap[id] = {
                        id,
                        name: row.dish_name,
                        ingredients: [],
                    };
                }
                dishMap[id].ingredients.push(row.ingredient_name);
            });

            const dishesWithIngredients = Object.values(dishMap);
            res.json(dishesWithIngredients);
        }
    });
});

/////////////////////////////////////////////////////////////////////////////////////
// Middleware: Auth & Rollenprüfung
/////////////////////////////////////////////////////////////////////////////////////
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token fehlt" });

    const token = authHeader.split(" ")[1];
    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (e) {
        res.status(403).json({ message: "Ungültiger Token" });
    }
}

function checkRole(requiredRole) {
    return function (req, res, next) {
        if (!req.user)
            return res.status(401).json({ message: "Not logged in" });
        if (req.user.role !== requiredRole && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }
        next();
    };
}

// Auth-API
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res
                .status(401)
                .json({ message: "Invalid login credentials" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );
        if (!passwordMatch) {
            return res.status(401).json({ message: "Wrong password!" });
        }

        const token = jwt.sign(
            {
                id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "1w" }
        );

        res.json({ token });
    });
});

app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
        "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    db.query(query, [username, email, hashedPassword, "user"], (err) => {
        if (err)
            return res
                .status(500)
                .json({ message: "Error during registration" });
        res.status(201).json({ message: "User created" });
    });
});
// app.post("/api/register", (req, res) => {
//   res.json({ message: "Test register endpoint funktioniert!" });
// });

// Check if token is valid
app.get("/api/check-token", authMiddleware, (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
});

// Admin-Rollen-Zuweisung
app.post("/api/set-role", authMiddleware, checkRole("admin"), (req, res) => {
    const { userId, role } = req.body;
    if (!["admin", "cook", "user"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const query = "UPDATE users SET role = ? WHERE user_id = ?";

    db.query(query, [role, userId], (err) => {
        if (err)
            return res.status(500).json({ message: "Error updating role" });
        res.json({ message: "Role updated" });
    });
});

// -------------- ADD MEAL -----------------
// Beispielgeschützter Endpunkt (nur cook oder admin)
// app.post("/api/dishes", authMiddleware, checkRole("cook"), (req, res) => {
//     const { name } = req.body;
//     const query = "INSERT INTO dishes (name) VALUES (?)";
//     db.query(query, [name], (err, result) => {
//         if (err)
//             return res.status(500).json({ message: "Error adding dish" });
//         res.status(201).json({ id: result.insertId, name });
//     });
// });

// Beispielgeschützter Endpunkt (nur cook oder admin)
app.post("/api/add-dishes", authMiddleware, checkRole("cook"), (req, res) => {
    const { name, calories, protein, fat, carbs, time, vmScore, category, tags, ingredientsData, instructions } = req.body;

    carbs =3;

    const dishesData = { name, calories, protein, fat, carbs, time, vmScore, category, tags, instructions };

    setDishesTable(dishesData, (err, dishId) => {
        if (err) {
            console.error(err);
            return res
                .status(509)
                .json({ message: "Failed to add meal." });
        }

        setDishIngredientTable(dishId, ingredientsData, (err2) => {
            if (err2) {
                console.error(err2);
                return res
                    .status(508)
                    .json({ message: "Fehler beim Hinzufügen der Zutaten" });
            }

            return res.status(201).json({
                message: "Gericht erfolgreich hinzugefügt",
                dishId,
            });
        });
    });
});

function setDishesTable(dishesData, callback) {
    const { name, calories, protein, fat, carbs, time, vmScore, category, tags, instructions } = dishesData;

    const sql = `INSERT INTO dishes 
    (name, preparation, vm_score, meal_category, preparation_time_in_min, total_calories, total_protein, total_fat, total_carbs, tags) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [ name, instructions, vmScore, category, time, calories, protein, fat, carbs, tags ];

    db.query(sql, values, (err, result) => {
        if (err) return callback(err);
        callback(null, result.insertId);
    });
}

function setDishIngredientTable(dishId, ingredientsData, callback) {
    if (!Array.isArray(ingredientsData) || ingredientsData.length === 0)
        return callback(null);

    const sql = `INSERT INTO dish_ingredients (dish_id, ingredient_id, unit_of_measurement, amount) VALUES ?`;

    const values = ingredientsData.map((ing) => [
        dishId,
        ing.ingredient_id,
        ing.unit_of_measurement,
        ing.amount
    ]);

    db.query(sql, [values], (err, result) => {
        if (err) return callback(err);
        callback(null);
    });
}

/////////////////////////////////////////////////////////////////////////////////////

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server läuft auf http://172.18.45.1:${PORT}`);
});
//test 050725
