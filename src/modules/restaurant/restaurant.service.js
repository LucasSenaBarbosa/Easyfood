const prisma = require('../../database/prisma');

const CATEGORIES = [
    'Italiana',
    'Japonesa',
    'Brasileira',
    'Burger',
    'Pizza',
    'Mexicana',
    'Chinesa',
    'Fast Food',
    'Saudável',
    'Sobremesas',
    'Cafeteria'
];

async function listRestaurants(data) { 
    return await prisma.restaurant.findMany();
}

async function createRestaurant(data) {
    const category = String(data.category || '').trim();

    if (!CATEGORIES.includes(category)) {
        throw new Error('Categoria inválida');
    }

    return prisma.restaurant.create({
        data: {
            name: data.name,
            category,
            rating: null,
            ownerId: data.ownerId
        }
    });
}

module.exports = {
    listRestaurants,
    createRestaurant,
    CATEGORIES
};