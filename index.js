const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;

app.get('/cooktime', async (req, res) => {
    try {
        // Extract query parameters
        const { ingredient, day } = req.query;

        // Fetch prayer times from the API
        const prayerTimes = await getPrayerTimes(day);

        // Read dishes information from dishes.json
        const dishes = await readDishesInfo();

        // Calculate cooking times for each dish
        const cookingTimes = calculateCookingTimes(ingredient, prayerTimes, dishes);

        // Respond with the formatted result
        res.json(cookingTimes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/suggest', async (req, res) => {
    try {
        // Extract query parameters
        const { day } = req.query;

        // Fetch prayer times from the API
        const prayerTimes = await getPrayerTimes(day);

        // Read dishes information from dishes.json
        const dishes = await readDishesInfo();

        // Suggest a dish for the specified day
        const suggestedDish = suggestDish(prayerTimes, dishes);

        // Respond with the suggested dish
        res.json(suggestedDish);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error2' });
    }
});
// Function to suggest a dish for the specified day
function suggestDish(prayerTimes, dishes) {
    // Assume you want to suggest the first dish for simplicity
    const suggestedDish = dishes[0];

    // Calculate cooking time for the suggested dish
    const asrTime = new Date(`2022-01-01 ${prayerTimes.Asr}`).getTime();
    const maghribTime = new Date(`2022-01-01 ${prayerTimes.Maghrib}`).getTime();
    const suggestedCookTime = calculateRelativeTime(asrTime, maghribTime, dish.duration);

    // Format the response
    const response = {
        name: suggestedDish.name,
        ingredients: suggestedDish.ingredients,
        cooktime: suggestedCookTime,
    };

    return response;
}

// fetch prayer time api
async function getPrayerTimes(day) {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Les mois sont indexés à partir de zéro, donc on ajoute 1
    const city = 'Mecca'; // Utilisez la ville souhaitée
    const country = 'Saudi Arabia';
    const response = await axios.get('https://api.aladhan.com/v1/calendarByCity', {
        params: {
            city,
            country,
            method: 1,
            year: currentYear,
            month: currentMonth,
            day: day,
            
        },
    });

    const prayerTimes = response.data.data[0].timings;
    return prayerTimes;
}
// read dishes from file
async function readDishesInfo() {
    const dishesPath = path.join(__dirname, 'dishes.json');
    const fileContent = await fs.readFile(dishesPath, 'utf-8');
    const dishes = JSON.parse(fileContent);
    return dishes;
}
// calcul cooking time
function calculateCookingTimes(ingredient, prayerTimes, dishes) {
    const asrTime = new Date(`2022-01-01 ${prayerTimes.Asr}`).getTime();
    const maghribTime = new Date(`2022-01-01 ${prayerTimes.Maghrib}`).getTime();

    const filteredDishes = dishes.filter(dish => dish.ingredients.includes(ingredient));

    const cookingTimes = filteredDishes.map(dish => ({
        name: dish.name,
        time: calculateRelativeTime(asrTime, maghribTime, dish.duration),
    }));

    return cookingTimes;
}

// calcul relative time
function calculateRelativeTime(asrTime, maghribTime, duration) {
    const fifteenMinutesBeforeMaghrib = maghribTime - 15 * 60 * 1000 - duration * 60 * 1000;
    const relativeTime = fifteenMinutesBeforeMaghrib - asrTime;
    const minutes = Math.floor(relativeTime / (60 * 1000));

    return `${Math.abs(minutes)} minutes ${minutes >= 0 ? 'before' : 'after'} Asr`;
}
app.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});
