# Ramadan Dishes

## Project Description

This project provides an application that offers information about prayer times and dish suggestions for the month of Ramadan. Users can explore cooking times based on ingredients and get dish suggestions for a specific day in Ramadan.

## Usage

- Run the application: `node index.js`

## Endpoints/API
// first endpoint: cooking time
router.get('/cooktime', dishesController.getCookTime);

// 2nd endpoint: suggestions
router.get('/suggest',dishesController.getSuggest);


- **Endpoint**: `/cooktime`
- **Parameters**:
  - `ingredient`: Ingredient for which you want to know the cooking time.
  - `day`: Ramadan day for which you want information.
- **Example Usage**:
 
  GET   http://localhost:3000/api/cooktime?ingredient=Chicken&day=25


- **Endpoint**: `/suggest`
- **Parameters**:
  - `ingredient`: Ingredient for which you want to know the cooking time.
  - `day`: Ramadan day for which you want information.
- **Example Usage**:
   GET   http://localhost:3000/api/suggest?day=20
