const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000; // Port für das Backend

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MariaDB-Verbindung
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Benutzername deiner Datenbank
    password: '', // Passwort deiner Datenbank
    database: 'fitness_app', // Name der Datenbank
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MariaDB:', err);
        return;
    }
    console.log('Connected to MariaDB');
});

// API-Endpunkt: Alle Gerichte abrufen
app.get('/dishes', (req, res) => {
    const query = 'SELECT * FROM dishes';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching dishes');
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Alle ingredients abrufen
app.get('/ingredients', (req, res) => {
    const query = 'SELECT * FROM ingredients';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching ingredients');
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Zutaten und Mengen für alle Gerichte abrufen
app.get('/dish_ingredients', (req, res) => {
    const query = 'SELECT * FROM dish_ingredients';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching dish_ingredients');
        } else {
            res.json(results);
        }
    });
});


// API-Endpunkt: Alle Nutzer abrufen
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching users');
        } else {
            res.json(results);
        }
    });
});

// API-Endpunkt: Alle Zuordnungen zwischen Nutzern und Gerichten abrufen
app.get('/user_dishes', (req, res) => {
    const query = 'SELECT * FROM user_dishes';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching user_dishes');
        } else {
            res.json(results);
        }
    });
});

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
