-- Tabelle für Benutzer (optional, falls Benutzer spezifische Gerichte speichern möchten)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Tabelle für Gerichte mit Kategorie für Frühstück/Mittagessen/Abendessen
CREATE TABLE dishes (
    dish_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    calories INT NOT NULL,
    protein FLOAT NOT NULL,
    carbs FLOAT NOT NULL,
    fats FLOAT NOT NULL,
    vm_score FLOAT NOT NULL,
    meal_category ENUM('breakfast', 'lunch', 'dinner') NOT NULL -- Neue Spalte für die Mahlzeit-Kategorie
);

-- Tabelle für Benutzer-Gericht-Beziehungen (um anzugeben, welche Benutzer welche Gerichte bevorzugen oder speichern)
CREATE TABLE user_dishes (
    user_id INT NOT NULL,
    dish_id INT NOT NULL,
    PRIMARY KEY (user_id, dish_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE
);

-- Tabelle für Zutaten
CREATE TABLE ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    calories_per_100g FLOAT NOT NULL,
    protein_per_100g FLOAT NOT NULL,
    carbs_per_100g FLOAT NOT NULL,
    fats_per_100g FLOAT NOT NULL
);

-- Tabelle zur Verknüpfung von Gerichten und Zutaten
CREATE TABLE dish_ingredients (
    dish_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    amount_in_grams FLOAT NOT NULL,
    PRIMARY KEY (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
);

-- Tabelle für Zubereitungsschritte
CREATE TABLE preparation_steps (
    step_id INT AUTO_INCREMENT PRIMARY KEY,
    dish_id INT NOT NULL,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE
);
