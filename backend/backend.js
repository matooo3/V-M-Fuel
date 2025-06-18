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
const JWT_SECRET = "dein_starkes_geheimes_passwort_123!";

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

/////////////////////////////////////////////////////////////////////////////////////
// Middleware: Auth & Rollenprüfung
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
            return res.status(401).json({ message: "Nicht eingeloggt" });
        if (req.user.role !== requiredRole && req.user.role !== "admin") {
            return res.status(403).json({ message: "Nicht erlaubt" });
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
            return res.status(401).json({ message: "Ungültige Login-Daten" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );
        if (!passwordMatch) {
            return res.status(401).json({ message: "Falsches Passwort" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token });
    });
});

app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
    db.query(query, [username, email, hashedPassword, "user"], (err) => {
        if (err)
            return res
                .status(500)
                .json({ message: "Fehler bei Registrierung" });
        res.status(201).json({ message: "Benutzer erstellt" });
    });
});

// Beispielgeschützter Endpunkt (nur cook oder admin)
app.post("/api/dishes", authMiddleware, checkRole("cook"), (req, res) => {
    const { name } = req.body;
    const query = "INSERT INTO dishes (name) VALUES (?)";
    db.query(query, [name], (err, result) => {
        if (err)
            return res.status(500).json({ message: "Fehler beim Hinzufügen" });
        res.status(201).json({ id: result.insertId, name });
    });
});

// Admin-Rollen-Zuweisung
app.post("/api/set-role", authMiddleware, checkRole("admin"), (req, res) => {
    const { userId, role } = req.body;
    if (!["admin", "cook", "user"].includes(role)) {
        return res.status(400).json({ message: "Ungültige Rolle" });
    }

    const query = 'UPDATE users SET role = ? WHERE user_id = ?';

    db.query(query, [role, userId], (err) => {
        if (err)
            return res
                .status(500)
                .json({ message: "Fehler beim Rollen-Update" });
        res.json({ message: "Rolle aktualisiert" });
    });
});
/////////////////////////////////////////////////////////////////////////////////////

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server läuft auf http://172.18.45.1:${PORT}`);
});
