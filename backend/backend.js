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

app.get("/api/dishes-breakfast", (req, res) => {
    const query = "SELECT * FROM dishes WHERE meal_category ='breakfast'";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Fehler beim Abrufen der Gerichte:", err);
            res.status(500).send("Fehler beim Abrufen der Gerichte");
        } else {
            res.json(results);
        }
    });
});

app.get("/api/dishes-main", (req, res) => {
    const query = "SELECT * FROM dishes WHERE meal_category ='main'";
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
app.get("/api/users", authMiddleware, checkRole("admin"), (req, res) => {
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
app.get("/api/user_dishes", authMiddleware, checkRole("user"), (req, res) => {
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

// app.get("/api/dishes_full", (req, res) => {
//     const query = `
//         SELECT 
//             d.dish_id AS dish_id,
//             d.name AS dish_name,
//             i.ingredient_id,
//             i.name AS ingredient_name
//         FROM dishes d
//         JOIN dish_ingredients di ON di.dish_id = d.dish_id
//         JOIN ingredients i ON i.ingredient_id = di.ingredient_id
//         ORDER BY d.dish_id
//     `;

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error("Fehler bei der Abfrage von dishes_full:", err);
//             res.status(500).send("Serverfehler bei /api/dishes_full");
//         } else {
//             const dishMap = {};
//             results.forEach((row) => {
//                 const id = row.dish_id;
//                 if (!dishMap[id]) {
//                     dishMap[id] = {
//                         id,
//                         name: row.dish_name,
//                         ingredientNames: [],
//                         ingredientIDs: []
//                     };
//                 }
//                 dishMap[id].ingredientNames.push(row.ingredient_name);
//                 dishMap[id].ingredientIDs.push(row.ingredient_id);
//             });

//             const dishesWithIngredients = Object.values(dishMap);
//             res.json(dishesWithIngredients);
//         }
//     });
// });

// app.post("/api/dishes_full_filtered", authMiddleware, checkRole("user"), (req, res) => {
//   const { category } = req.body;

//     let query = `
//       SELECT 
//         d.dish_id AS dish_id,
//         d.name AS dish_name,
//         i.ingredient_id AS ingredient_id,
//         i.name AS ingredient_name
//       FROM dishes d
//       JOIN dish_ingredients di ON di.dish_id = d.dish_id
//       JOIN ingredients i ON i.ingredient_id = di.ingredient_id
//     `;

//     if (category && category !== "all") {
//       query += ` WHERE d.meal_category = ? `;
//     }

//     query += ` ORDER BY d.dish_id `;

//     const params = (category && category !== "all") ? [category] : [];

//     db.query(query, params, (err, results) => {
//       if (err) {
//         console.error("Fehler bei der Abfrage von dishes_full_filtered:", err);
//         return res.status(500).send("Serverfehler bei /api/dishes_full_filtered");
//       }

//       const dishMap = {};
//       results.forEach(row => {
//         const id = row.dish_id;
//         if (!dishMap[id]) {
//           dishMap[id] = {
//             id,
//             name: row.dish_name,
//             ingredientNames: [],
//             ingredientIDs: []
//           };
//         }
//         dishMap[id].ingredientNames.push(row.ingredient_name);
//         dishMap[id].ingredientIDs.push(row.ingredient_id);
//       });

//       const dishesWithIngredients = Object.values(dishMap);
//       res.json(dishesWithIngredients);
//     });
//   }
// );

app.post("/api/dishes_full_filtered", authMiddleware, checkRole("user"), (req, res) => {
  const { category } = req.body;

    let query = `
      SELECT 
        d.*,
        i.ingredient_id,
        i.name AS ingredient_name
      FROM dishes d
      JOIN dish_ingredients di ON di.dish_id = d.dish_id
      JOIN ingredients i ON i.ingredient_id = di.ingredient_id
    `;

    if (category && category !== "all") {
      query += ` WHERE d.meal_category = ? `;
    }

    query += ` ORDER BY d.dish_id `;

    const params = (category && category !== "all") ? [category] : [];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Failed to fetch dishes_full_filtered:", err);
        return res.status(500).send("Server error at /api/dishes_full_filtered");
      }

      const dishMap = {};
      results.forEach(row => {
        const id = row.dish_id;

        if (!dishMap[id]) {
            // Extract all columns from dishes (except ingredient_id and ingredient_name)
          // Since row contains all fields from dishes + ingredient_id + ingredient_name,
          // extract everything except the two ingredient fields separately:
          const {
            ingredient_id, 
            ingredient_name, 
            ...dishFields
          } = row;

          dishMap[id] = {
            ...dishFields,
            ingredientNames: [],
            ingredientIDs: []
          };
        }

        dishMap[id].ingredientNames.push(row.ingredient_name);
        dishMap[id].ingredientIDs.push(row.ingredient_id);
      });

      const dishesWithIngredients = Object.values(dishMap);
      res.json(dishesWithIngredients);
    });
  }
);




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

function checkRoleExact(requiredRole) {
    return function (req, res, next) {
        if (!req.user)
            return res.status(401).json({ message: "Not logged in" });
        if (req.user.role !== requiredRole && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }
        next();
    };
}

function checkRole(requiredRole) {
    return function (req, res, next) {
        if (!req.user)
            return res.status(401).json({ message: "Not logged in" });

        const role = req.user.role;

        const roleHierarchy = {
            user: ["user", "cook", "admin"],
            cook: ["cook", "admin"],
            admin: ["admin"]
        };

        const allowedRoles = roleHierarchy[requiredRole] || [];

        if (!allowedRoles.includes(role)) {
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

        // ✅ SUCCESSFUL
        return res.status(201).json({
            message: "Role updated successfully",
            userId: userId
        });
    });
});

app.post("/api/delete-user", authMiddleware, checkRole("admin"), (req, res) => {
    const { userID } = req.body;

    const query = `DELETE FROM users WHERE user_id = ?`;

    db.query(query, [userID], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ message: "Error deleting user" });
        }

        // Check if any row was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Successful deletion
        return res.status(200).json({ message: "User successfully deleted" });
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
app.post("/api/add-dish", authMiddleware, checkRole("cook"), (req, res) => {
    const { name, preparation, vmScore, category, time, calories, protein, fat, carbs, tags, ingredients } = req.body;

    const dishesData = { name, preparation, vmScore, category, time, calories, protein, fat, carbs, tags, ingredients };

    setDishesTable(dishesData, (err, dishId) => {
        if (err) {
            console.error(err);
            return res
                .status(509)
                .json({ message: "Failed to add meal." });
        }

        setDishIngredientTable(dishId, ingredients, (err2) => {
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
    const { name, calories, protein, fat, carbs, time, vmScore, category, tags, preparation } = dishesData;

    const query = `INSERT INTO dishes 
    (name, preparation, vm_score, meal_category, preparation_time_in_min, total_calories, total_protein, total_fat, total_carbs, tags) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, preparation, vmScore, category, time, calories, protein, fat, carbs, tags];

    db.query(query, values, (err, result) => {
        if (err) return callback(err);
        callback(null, result.insertId);
    });

}

function setDishIngredientTable(dishId, ingredients, callback) {
    if (!Array.isArray(ingredients) || ingredients.length === 0)
        return callback(null);

    const query = `INSERT INTO dish_ingredients (dish_id, ingredient_id, unit_of_measurement, amount) VALUES ?`;

    const values = ingredients.map((ing) => [
        dishId,
        ing.ingredient_id,
        ing.unit_of_measurement,
        ing.amount
    ]);

    db.query(query, [values], (err, result) => {
        if (err) return callback(err);
        callback(null);
    });

}

app.post("/api/add-ingredient", authMiddleware, checkRole("cook"), (req, res) => {

    const { name, uom, calories, carbs, fats, protein, category } = req.body;

    const query = `INSERT INTO ingredients 
    (name, Unit_of_Measurement, calories_per_UoM, carbs_per_UoM, fats_per_UoM, protein_per_UoM, category) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, uom, calories, carbs, fats, protein, category];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res
                .status(510)
                .json({ message: "Fehler bei add ingredients" });
        }

        // ✅ SUCCESSFUL
        return res.status(201).json({
            message: "Ingredient successfully added",
            ingredientId: result.insertId
        });

    });


});

app.post("/api/delete-dish", authMiddleware, checkRole("cook"), (req, res) => {
    const { dishID } = req.body;

    const query = `DELETE FROM dishes WHERE dish_id = ?`;

    db.query(query, [dishID], (err, result) => {
        if (err) {
            console.error("Error deleting dish:", err);
            return res.status(500).json({ message: "Error deleting dish" });
        }

        // Check if any row was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Dish not found" });
        }

        // Successful deletion
        return res.status(200).json({ message: "Dish successfully deleted" });
    });
});


app.post("/api/delete-ingredient", authMiddleware, checkRole("cook"), (req, res) => {
    const { ingredientID } = req.body;

    const query = `DELETE FROM ingredients WHERE ingredient_id = ?`;

    db.query(query, [ingredientID], (err, result) => {
        if (err) {
            console.error("Error deleting ingredient:", err);
            return res.status(500).json({ message: "Error deleting ingredient" });
        }

        // Check if any row was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ingredient not found" });
        }

        // Successful deletion
        return res.status(200).json({ message: "Ingredient successfully deleted" });
    });
});


// ADD Week Plan
app.post("/api/add-week-plan", authMiddleware, checkRole("user"), (req, res) => {

    const { userId, weekPlan } = req.body;

    if (!userId || !weekPlan) {
        return res.status(400).json({ message: "User ID and week plan are required" });
    }

    const query = `UPDATE users SET week_plan = ? WHERE user_id = ?`;

    db.query(query, [JSON.stringify(weekPlan), userId], (err, result) => {
        if (err) {
            console.error(err);
            return res
                .status(510)
                .json({ message: "Fehler bei add meal plan" });
        }

        // ✅ SUCCESSFUL
        return res.status(201).json({
            message: "Meal plan successfully added",
            mealPlanId: result.insertId
        });

    });
});

// get Week Plan
app.get("/api/get-week-plan", authMiddleware, checkRole("user"), (req, res) => {
    const userId = req.user.id; // from token

    const query = "SELECT week_plan FROM users WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching week plan");
        }

        if (results.length === 0 || !results[0].week_plan) {
            // No plan found for the user
            return res.json([]);
        }

        try {
            const weekPlan = JSON.parse(results[0].week_plan);
            return res.json(weekPlan);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return res.status(500).send("Fehler beim Verarbeiten des Wochenplans");
        }
    });
});

// SAVE USER DATA (gender - goal)
app.post("/api/save-user-data", authMiddleware, checkRole("user"), (req, res) => {
    const userId = req.user.id;
    const { gender, age, weight_kg, weight_pounds, height_cm, height_feet_and_inches, activityLevel, goal } = req.body;

    const query = `
    UPDATE users SET
      gender = ?, age = ?, weight_kg = ?, weight_pounds = ?,
      height_cm = ?, height_feet_and_inches = ?, activityLevel = ?, goal = ?
    WHERE user_id = ?`;

    db.query(query, [gender, age, weight_kg, weight_pounds, height_cm, height_feet_and_inches, activityLevel, goal, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to update user info" });
        }
        res.status(200).json({ message: "User info successfully updated" });
    });
});

// GET USER DATA (gender - goal)
app.get("/api/get-user-data", authMiddleware, checkRole("user"), (req, res) => {
    const userId = req.user.id;

    const query = `
    SELECT gender, age, weight_kg, weight_pounds, height_cm, height_feet_and_inches, activityLevel, goal
    FROM users WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error fetching user data" });
        }
        res.json(results[0] || {});
    });
});


// GET INGREDIENTS FROM WEEK PLAN
app.get("/api/get-ingredients-from-week-plan", authMiddleware, checkRole("user"), async (req, res) => {
    try {
        const aggregated = await getAggregatedIngredientsForUser(req.user.id);
        res.json(aggregated);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || "Internal server error" });
    }
});

async function getAggregatedIngredientsForUser(userId) {
    const weekPlan = await getUserWeekPlan(userId);
    const dishMap = extractDishMapFromWeekPlan(weekPlan);

    if (dishMap.size === 0) {
        return [];
    }

    const ingredients = await getIngredientsFromDishMap(dishMap);
    return aggregateIngredients(ingredients, dishMap);
}

function getUserWeekPlan(userId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT week_plan FROM users WHERE user_id = ?";
        db.query(query, [userId], (err, results) => {
            if (err) {
                return reject({ message: "Error retrieving week plan", status: 500 });
            }

            if (!results.length || !results[0].week_plan) {
                return reject({ message: "No week plan found for the user", status: 400 });
            }

            try {
                const weekPlan = JSON.parse(results[0].week_plan);
                resolve(weekPlan);
            } catch (parseError) {
                reject({ message: "Error processing week plan", status: 500 });
            }
        });
    });
}

function extractDishMapFromWeekPlan(weekPlan) {
    const dishMap = new Map();

    for (const day of weekPlan) {
        for (const mealType of ["breakfast", "lunch", "dinner"]) {
            const meal = day[mealType];
            if (meal && meal.dish_id) {
                const dishId = meal.dish_id;
                const factor = meal.factor ?? 1;

                dishMap.set(dishId, (dishMap.get(dishId) || 0) + factor);
            }
        }
    }

    return dishMap;
}

function getIngredientsFromDishMap(dishMap) {
    return new Promise((resolve, reject) => {
        const dishIds = Array.from(dishMap.keys());
        const placeholders = dishIds.map(() => "?").join(",");
        const query = `
            SELECT 
                di.dish_id,
                di.amount,
                di.unit_of_measurement,
                i.ingredient_id,
                i.name,
                i.Unit_of_Measurement AS ingredient_unit,
                i.calories_per_UoM,
                i.carbs_per_UoM,
                i.fats_per_UoM,
                i.protein_per_UoM,
                i.category
            FROM dish_ingredients di
            JOIN ingredients i ON di.ingredient_id = i.ingredient_id
            WHERE di.dish_id IN (${placeholders})
        `;

        db.query(query, dishIds, (err, rows) => {
            if (err) {
                return reject({ message: "Error retrieving ingredients", status: 500 });
            }
            resolve(rows);
        });
    });
}

function aggregateIngredients(rows, dishMap) {
    const aggregated = {};

    for (const row of rows) {
        const key = `${row.ingredient_id}-${row.unit_of_measurement}`;
        const scaleFactor = dishMap.get(row.dish_id);

        if (!aggregated[key]) {
            aggregated[key] = {
                ingredient_id: row.ingredient_id,
                name: row.name,
                unit_of_measurement: row.unit_of_measurement,
                amount: 0,
                ingredient_unit: row.ingredient_unit,
                calories_per_UoM: row.calories_per_UoM,
                carbs_per_UoM: row.carbs_per_UoM,
                fats_per_UoM: row.fats_per_UoM,
                protein_per_UoM: row.protein_per_UoM,
                category: row.category
            };
        }

        aggregated[key].amount += row.amount * scaleFactor;
    }

    return Object.values(aggregated);
}

// SAVE NEXT MEALS
app.post("/api/save-next-meals", authMiddleware, checkRole("user"), (req, res) => {
    const userId = req.user.id;
    const { next_meals } = req.body;

    if(!userId || !next_meals){
        return res.status(400).json({ message: "User ID and next meals are required" });
    }

    const query = `
    UPDATE users SET next_meals = ? WHERE user_id = ?`;

    const nextMealsJson = JSON.stringify(next_meals);

    db.query(query, [nextMealsJson, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to update next meals" });
        }
        res.status(200).json({ message: "Next meals successfully updated" });
    });
});

// GET NEXT MEALS
app.get("/api/get-next-meals", authMiddleware, checkRole("user"), (req, res) => {
    const userId = req.user.id;

    const query = `
    SELECT next_meals FROM users WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error fetching next meals" });
        }

        if (results.length === 0 || !results[0].next_meals) {

            return res.json({});
        }

        try {
            const nextMeals = JSON.parse(results[0].next_meals);
            return res.json(nextMeals);
        } catch (parseErr) {
            console.error("Error parsing next_meals JSON:", parseErr);
            return res.status(500).send("Error processing next meals");
        }
    });
});


//////////////////// USER LIST ITEMS ///////////////////

// SET WHOLE LIST
app.post("/api/set-user-list-items", authMiddleware, checkRole("user"), async (req, res) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "No items provided" });
    }

    try {
        const inserted = await setUserListItems(req.user.id, items);
        res.status(200).json({ message: "List successfully saved", inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update list" });
    }
});

async function setUserListItems(userId, items) {
    return new Promise((resolve, reject) => {
        const deleteQuery = "DELETE FROM user_list_items WHERE user_id = ? AND ingredient_id IS NOT NULL";

        db.query(deleteQuery, [userId], (deleteErr) => {
            if (deleteErr) return reject(deleteErr);

            const insertQuery = `
                INSERT INTO user_list_items (user_id, ingredient_id, amount, unit_of_measurement)
                VALUES ?`;

            const values = items.map(item => [
                userId,
                item.ingredient_id,
                item.amount,
                item.unit_of_measurement
            ]);

            db.query(insertQuery, [values], (insertErr, result) => {
                if (insertErr) return reject(insertErr);
                resolve(result.affectedRows);
            });
        });
    });
}

// !! COMBINE: get ingredients from week plan and set user list items (DELETE OLD + UPDATE NEW) !!
app.post("/api/delete-old-and-create-new-list", authMiddleware, checkRole("user"), async (req, res) => {
    const userId = req.user.id;

    try {
        const aggregatedIngredients = await getAggregatedIngredientsForUser(userId);

        if (aggregatedIngredients.length === 0) {
            return res.status(400).json({ message: "No ingredients found for current week plan" });
        }

        const inserted = await setUserListItems(userId, aggregatedIngredients);
        res.status(200).json({ message: "List generated and saved", inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to generate and set list" });
    }
});


// GET USER LIST ITEMS
app.get("/api/get-user-list-items", authMiddleware, checkRole("user"), (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      uli.ingredient_id,
      COALESCE(i.name, uli.custom_name) AS name,
      uli.amount,
      uli.unit_of_measurement,
      uli.is_checked,
      COALESCE(i.category, uli.category) AS category,
      COALESCE(i.unit_of_measurement, uli.unit_of_measurement) AS ingredient_unit,
      COALESCE(i.calories_per_UoM, 0) AS calories_per_UoM,
      COALESCE(i.carbs_per_UoM, 0) AS carbs_per_UoM,
      COALESCE(i.fats_per_UoM, 0) AS fats_per_UoM,
      COALESCE(i.protein_per_UoM, 0) AS protein_per_UoM
    FROM user_list_items uli
    LEFT JOIN ingredients i ON uli.ingredient_id = i.ingredient_id
    WHERE uli.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user list items:", err);
      return res.status(500).json({ message: "Failed to fetch user list items" });
    }

    res.status(200).json(results); // direkt so nutzbar wie erwartet
  });
});



// ADD USER LIST ITEM (inkl. custom_name)
app.post("/api/add-user-list-item", authMiddleware, checkRole("user"), (req, res) => {
  const userId = req.user.id;
  const { ingredient_id, custom_name, category, amount, unit_of_measurement } = req.body;

  // Validation: entweder ingredient_id ODER custom_name muss vorhanden sein
  if ((!ingredient_id && !custom_name) || (ingredient_id && custom_name)) {
    return res.status(400).json({ message: "Bitte entweder ingredient_id ODER custom_name angeben" });
  }

  const query = `
    INSERT INTO user_list_items (user_id, ingredient_id, custom_name, category, amount, unit_of_measurement)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // ingredient_id oder NULL, custom_name oder NULL setzen
  const ingredientIdValue = ingredient_id || null;
  const customNameValue = custom_name || null;
  const categoryValue = category || null;

  db.query(query, [userId, ingredientIdValue, customNameValue, categoryValue, amount, unit_of_measurement], (err, result) => {
    if (err) {
      console.error("Error inserting list item:", err);
      return res.status(500).json({ message: "Failed to add list item" });
    }
    res.status(200).json({ message: "Item successfully added to list", item_id: result.insertId });
  });
});


// DELETE USER LIST ITEM
app.post("/api/delete-user-list-item", authMiddleware, checkRole("user"), (req, res) => {
  const userId = req.user.id;
  // identifier is either item_id or custom_name
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: "Missing identifier" });
  }

  // Check if identifier is ingredient_id or custom_name:
  const isNumeric = !isNaN(identifier);

  const query = isNumeric
    ? "DELETE FROM user_list_items WHERE ingredient_id = ? AND user_id = ?"
    : "DELETE FROM user_list_items WHERE custom_name = ? AND user_id = ?";
    
  db.query(query, [identifier, userId], (err, result) => {
    if (err) {
      console.error("Error deleting item:", err);
      return res.status(500).json({ message: "Failed to delete item" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  });
});

// UPDATE USER LIST ITEM
app.post("/api/update-user-list-item", authMiddleware, checkRole("user"), (req, res) => {
    const userId = req.user.id;
    const { identifier, updatedItem } = req.body;
    if (!identifier || !updatedItem) {
        return res.status(400).json({ message: "Identifier or updatedItem is missing" });
    }

    const isNumeric = !isNaN(identifier);

    const query = `
        UPDATE user_list_items
        SET 
            ingredient_id = ?, 
            custom_name = ?, 
            category = ?, 
            amount = ?, 
            unit_of_measurement = ?, 
            is_checked = ?
        WHERE user_id = ? AND ${isNumeric ? "ingredient_id" : "custom_name"} = ?
    `;

    const values = [
        updatedItem.ingredient_id || null,
        updatedItem.custom_name || null,
        updatedItem.category || null,
        updatedItem.amount || 0,
        updatedItem.unit_of_measurement || null,
        updatedItem.is_checked ? 1 : 0,
        userId,
        identifier
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error updating item:", err);
            return res.status(500).json({ message: "Failed to update item" });
        }

        res.status(200).json({ message: "Item updated successfully" });
    });
});
////////////////// END USER LIST ITEMS /////////////////


///////////////// LIKE/DISLIKE DISH/INGREDIENT /////////////////
// Like/Dislike a dish
app.post("/api/set-user-preference", authMiddleware, checkRole("user"), (req, res) => {
  const userId = req.user.id;
  const { type, id, preference } = req.body;

  if (!id || !["like", "dislike", "neutral"].includes(preference) || !["dish", "ingredient"].includes(type)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  // Tabellen je nach Typ
  const likedTable = type === "dish" ? "user_preferred_dishes" : "user_preferred_ingredients";
  const blockedTable = type === "dish" ? "user_blocked_dishes" : "user_blocked_ingredients";
  const column = type === "dish" ? "dish_id" : "ingredient_id";

  const deleteLiked = `DELETE FROM ${likedTable} WHERE user_id = ? AND ${column} = ?`;
  const deleteBlocked = `DELETE FROM ${blockedTable} WHERE user_id = ? AND ${column} = ?`;

  // Zuerst beides entfernen
  db.query(deleteLiked, [userId, id], (err1) => {
    if (err1) return res.status(500).json({ message: "Failed to update preference (liked)" });

    db.query(deleteBlocked, [userId, id], (err2) => {
      if (err2) return res.status(500).json({ message: "Failed to update preference (blocked)" });

      if (preference === "like") {
        const insertLiked = `INSERT INTO ${likedTable} (user_id, ${column}) VALUES (?, ?)`;
        db.query(insertLiked, [userId, id], (err3) => {
          if (err3) return res.status(500).json({ message: "Failed to save like" });
          res.status(200).json({ message: `${type} liked` });
        });
      } else if (preference === "dislike") {
        const insertBlocked = `INSERT INTO ${blockedTable} (user_id, ${column}) VALUES (?, ?)`;
        db.query(insertBlocked, [userId, id], (err4) => {
          if (err4) return res.status(500).json({ message: "Failed to save dislike" });
          res.status(200).json({ message: `${type} disliked` });
        });
      } else {
        res.status(200).json({ message: "Preference reset to neutral" });
      }
    });
  });
});


app.get("/api/get-user-preferences", authMiddleware, checkRole("user"), async (req, res) => {
  const userId = req.user.id;

  try {
    const [
      preferredDishes,
      blockedDishes,
      preferredIngredients,
      blockedIngredients
    ] = await Promise.all([
      dbQuery("SELECT dish_id FROM user_preferred_dishes WHERE user_id = ?", [userId]),
      dbQuery("SELECT dish_id FROM user_blocked_dishes WHERE user_id = ?", [userId]),
      dbQuery("SELECT ingredient_id FROM user_preferred_ingredients WHERE user_id = ?", [userId]),
      dbQuery("SELECT ingredient_id FROM user_blocked_ingredients WHERE user_id = ?", [userId])
    ]);

    res.json({
      preferredDishes: preferredDishes.map(row => row.dish_id),
      blockedDishes: blockedDishes.map(row => row.dish_id),
      preferredIngredients: preferredIngredients.map(row => row.ingredient_id),
      blockedIngredients: blockedIngredients.map(row => row.ingredient_id)
    });
  } catch (err) {
    console.error("Error fetching preferences:", err);
    res.status(500).json({ message: "Failed to load preferences" });
  }
});

// Utility-Funktion (falls du sie noch nicht hast):
function dbQuery(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}




/////////////////////////////////////////////////////////////////////////////////////
// Starte den Server
app.listen(PORT, () => {
    console.log(`Server läuft auf http://172.18.45.1:${PORT}`);
});
//test 050725
