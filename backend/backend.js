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

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});