
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

module.exports = {
    getUserWeekPlan,
    extractDishMapFromWeekPlan,
    getIngredientsFromDishMap,
    aggregateIngredients
};
