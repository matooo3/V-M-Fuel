export function algo(kcal, puffer, like, dislike) {
    // ...

    array = scale(kcal);

    const scaledBFkcal = array["Breakfast"];
    const scaledLUkcal = array["Lunch"];
    const scaledDIkcal = array["Dinner"];
    const scaledPUkcal = array["Puffer"];

    for(let i = 0; i < 7; i++) {
        createDay(kcal);
    }
    
}

export function createDay(scaledBDkcal, scaledLUkcal, scaledDIkcal, scaledPUkcal) {
    searchMealForBreakfast(scaledBDkcal); // => DB (MIN/MAX)
    searchMealForLunch(scaledLUkcal);
    searchMealForDinner(scaledDIkcal);
    searchMealForPuffer(scaledPUkcal);
}

export function scale(kcal) {
    // ........
    // 24% / 38% / 38%
    // 20%  / 35% / 35% / 10% 
    // 17%  / 32% / 32% / 19%
    const array = [];
    return array;
}

export function wojn9iebueb(){
    
}

export function searchMealForBreakfast(kcal) {
    // ...
    calcPuffer();
}

export function searchMealForLunch(kcal) {
    // ...
    calcPuffer();
}

export function searchMealForDinner(kcal) {
    // ...
    calcPuffer();
}

export function searchMealForPuffer(kcal) {
    // ...
    calcPuffer();
}

export function ieieieieieieiieieiei() {
    
}