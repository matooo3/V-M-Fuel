import * as Storage from "../storage.js";

export async function algo(kcal, puffer, like, dislike) {
    // get dishes form db
    const dishesBreakfast = await Storage.getDishesBreakfast();
    const dishesMain = await Storage.getDishesMain();

    // split kcal to meal of day
    const kcalArray = split(kcal, 0);

    const weekPlan = [];

    for (let i = 0; i < 7; i++) {
        const day = await createDay(kcalArray, dishesBreakfast, dishesMain);

        const scaledDay = scalePlan(day, kcalArray);

        weekPlan.push(scaledDay);
    }

    optimize();

    console.log("Generated week plan:", weekPlan);

    return weekPlan;
}

export function scalePlan(day, kcalArray) {
    // scale plan to kcalArray
    const scaledDay = {
        breakfast: scaleDish(day.breakfast, kcalArray[0]),
        lunch: scaleDish(day.lunch, kcalArray[1]),
        dinner: scaleDish(day.dinner, kcalArray[2]),
        puffer: null,
    };
 
    return scaledDay;
}

export function scaleDish(dish, kcalOptimal) {
    
    const DISH_SCALING = 0.2; // ±20%

    // if dis is already optimal RETURN
    if(dish.total_calories === kcalOptimal) {
        return dish;
    }
    
    // Scale-Zone of dish
    const [minDish, maxDish] = calcDishScalingZone(dish.total_calories, DISH_SCALING);

    // PERFECT MATCH
    if (minDish <= kcalOptimal && kcalOptimal <= maxDish) {
        const factor = kcalOptimal / dish.total_calories;
        return scaleDishByFactor(dish, factor);
    }

    // Optimal is too high
    if (kcalOptimal > maxDish) {
        // mache max
        const factor = maxDish / dish.total_calories;
        return scaleDishByFactor(dish, factor);
    }

    // Optimal is too low
    if (kcalOptimal < minDish) {
        // mache max
        const factor = minDish / dish.total_calories;
        return scaleDishByFactor(dish, factor);
    }

    // fallback (don't scale)
    return dish;

}

export function scaleDishByFactor(dish, factor) {
    
    const scaledDish = {
        dish_id: dish.dish_id,
        name: dish.name,
        preparation: dish.preparation,
        vm_score: dish.vm_score,
        meal_category: dish.meal_category,
        preparation_time_in_min: dish.preparation_time_in_min,
        total_calories: Math.round(dish.total_calories * factor),
        total_protein: Math.round(dish.total_protein * factor),
        total_fat: Math.round(dish.total_fat * factor),
        total_carbs: Math.round(dish.total_carbs * factor),
        tags: dish.tags
    };

    return scaledDish;

}

export async function createDay(kcalArray, dishesBreakfast, dishesMain) {
    const kcalB = kcalArray[0]; // breakfast
    const kcalL = kcalArray[1]; // lunch
    const kcalD = kcalArray[2]; // dinner
    const kcalP = kcalArray[3]; // puffer

    const day = {
        breakfast: null,
        lunch: null,
        dinner: null,
        puffer: null,
    };

    day.breakfast = pickDish(kcalB, dishesBreakfast);
    day.lunch = pickDish(kcalL, dishesMain);
    day.dinner = pickDish(kcalD, dishesMain);
    // day.puffer = pickDish(kcalP, dishesMain);

    return day;
}

export function split(kcal, puffer) {
    // ........
    // 24% / 38% / 38%
    // 20%  / 35% / 35% / 10%
    // 17%  / 32% / 32% / 19%

    switch (puffer) {
        case 0:
            return [kcal * 0.24, kcal * 0.38, kcal * 0.38];
        case 1:
            return [kcal * 0.2, kcal * 0.35, kcal * 0.35, kcal * 0.1];
        case 2:
            return [kcal * 0.17, kcal * 0.32, kcal * 0.32, kcal * 0.19];
        default:
            return [];
    }

    // return [kcal * 0.24, kcal * 0.38, kcal * 0.38, 0];
}

export function pickDish(kcalOptimal, dishes) {
    const DISH_SCALING = 0.2; // ±20 %

    for (
        let MEAL_PUFFER = 0;
        MEAL_PUFFER <= 0.2;
        MEAL_PUFFER = MEAL_PUFFER + 0.05
    ) {
        // PUFFER
        const mealPZ = calculateMealPufferZone(kcalOptimal, MEAL_PUFFER); // ±0% // ±5% // ±10% // ±15%

        // GET CANDIDATES
        const candidates = dishes.filter((dish) => {
            const dishScalingZone = calcDishScalingZone(
                dish.total_calories,
                DISH_SCALING
            );
            return isInPuffer(dishScalingZone, mealPZ);
        });

        // CANDIDATES FOUND!
        if (candidates.length > 0) {
            // CHOOSE FROM CANDIDATES
            return chooseBestCandidate(candidates);
        }
    }
    return noCandidateFound();
}

function noCandidateFound() {
    console.warn(`⚠️ Kein Gericht gefunden für kcal-Ziel ${kcalOptimal}`);
    return {
        name: "Kein Gericht gefunden",
        preparation: "-",
        total_calories: 0,
        total_protein: 0,
        total_fat: 0,
        total_carbs: 0,
        vm_score: 0,
        preparation_time_in_min: 0,
    };
}

function chooseBestCandidate(candidates) {
    if (candidates.length === 1) {
        return candidates[0];
    }

    const random = Math.floor(Math.random() * candidates.length); // PROTOTYPE
    return candidates[random];
}

// meal puffer
function calculateMealPufferZone(kcal, factor) {
    const puffer = kcal * factor;
    return [kcal - puffer, kcal + puffer];
}

// scaling
function calcDishScalingZone(kcal, factor) {
    // ...
    // Dish-Scaling based on pieces / ml in database!
    // Category for scalability for every ingredient
    // ...
    const scaling = kcal * factor;
    return [kcal - scaling, kcal + scaling];
}

//
function isInPuffer(dishScalingZone, mealPufferZone) {
    const [minDish, maxDish] = dishScalingZone;
    const [minMeal, maxMeal] = mealPufferZone;

    // Dish-Scaling overlaps with Meal-Puffer!!!
    // return minDish <= maxMeal <= maxDish || minDish <= minMeal <= maxDish;
    // simplified:
    return maxDish >= minMeal && minDish <= maxMeal;
}

function optimize() {
    // Optimize week plan
    // ...
}
