const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');

// Lade die geheime Konfigurationsdatei aus dem Home-Verzeichnis
const homeDirectory = os.homedir(); // Holt das Home-Verzeichnis des Benutzers
const configPath = path.join(homeDirectory, 'dbConfig.json'); // Pfad zur Konfigurationsdatei

let dbConfig;

try {
    // Versuche, die Konfigurationsdatei zu lesen
    dbConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
    console.error('Fehler beim Laden der DB-Konfiguration:', err);
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
        console.error('Fehler bei der Verbindung zu MariaDB:', err);
        return;
    }
    console.log('Erfolgreich mit MariaDB verbunden');
});

// API-Endpunkt: Alle Gerichte abrufen
app.get('/dishes', (req, res) => {
    const query = 'SELECT * FROM dishes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Gerichte:', err);
            res.status(500).send('Fehler beim Abrufen der Gerichte');
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

app.post('/parse-ingredients', async (req, res) => {
    const userInput = req.body.input;  // The input from the user

    // Prompt to ask the model to process the ingredients into name, amount, and unit
    const prompt = `
        Please split the following ingredients into Name, Amount, and Unit:
        ${userInput}

        Provide the response as JSON in the format:
        [{"name": "Ingredient", "amount": "Amount", "unit_of_measurement": "Unit_Of_Measurement"}, ...]
    `;

    try {
        // Send request to the model (Llama 2, Mistral, etc.)
        const response = await axios.post("http://localhost:11434/api/generate", {
            model: "deepseek-r1:14b",  
            prompt: prompt,
            stream: false
        });

        // Return the model's structured response
        res.json(response.data);
    } catch (error) {
        console.error("Error parsing ingredients:", error);
        res.status(500).json({ error: error.message });
    }
});



// Starte den Server
app.listen(PORT, () => {
    console.log(`Server läuft auf http://172.18.45.1:${PORT}`);
});
