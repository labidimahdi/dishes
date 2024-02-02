const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;

app.get('/cooktime', async (req, res) => {
    try {
        const { ingredient, day } = req.query;
        const prayerTimes = await getPrayerTimes(day);
        const dishes = await readDishesInfo();
        const cookingTimes = calculateCookingTimes(ingredient, prayerTimes, dishes);

        res.json(cookingTimes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/suggest', async (req, res) => {
    try {
        const { day } = req.query;
        const prayerTimes = await getPrayerTimes(day);
        const dishes = await readDishesInfo();
        const suggestedDish = suggestDish(prayerTimes, dishes);

        res.json(suggestedDish);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error 2' });
    }
});
// Function to suggest a dish for the specified day
function suggestDish(prayerTimes, dishes) {
    const randomIndex = Math.floor(Math.random() * dishes.length);
    const suggestedDish = dishes[randomIndex];
    const asrTime = convertTimeToMinutes(prayerTimes.Asr);
    const maghribTime = convertTimeToMinutes(prayerTimes.Maghrib);
    const suggestedCookTime = calculateRelativeTime(asrTime, maghribTime, suggestedDish.duration);

    const response = {
        name: suggestedDish.name,
        ingredients: suggestedDish.ingredients,
        cooktime:  suggestedCookTime
    };

    return response;
}

// fetch prayer time api
async function getPrayerTimes(day) {

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; 
    const city = 'Mecca'; 
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
    const asrTime = convertTimeToMinutes(prayerTimes.Asr);
    const maghribTime = convertTimeToMinutes(prayerTimes.Maghrib);
    const filteredDishes = dishes.filter(dish => dish.ingredients.includes(ingredient));
    const cookingTimes = filteredDishes.map(dish => ({
        name: dish.name,
        ingredients :dish.ingredients,
        cooktime: calculateRelativeTime(asrTime, maghribTime, dish.duration),
    }));
  
    return cookingTimes;
}
function convertTimeToMinutes(time) {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}
// calcul relative time
function calculateRelativeTime(asrTime, maghribTime, duration) {
    const fifteenMinutesBeforeMaghrib = maghribTime - 15 ;
    const relativeTime = fifteenMinutesBeforeMaghrib - asrTime;
    const timecook = duration - relativeTime ;

    return `${Math.abs(timecook)} minutes ${timecook >= 0 ? 'before' : 'after'} Asr`;
}
app.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});
