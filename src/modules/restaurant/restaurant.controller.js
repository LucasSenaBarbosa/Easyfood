const restaurantService = require('./restaurant.service');
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

async function list(req, res) {
    try {
        const restaurantes = await restaurantService.listRestaurants();
        res.json(restaurantes);
    } catch (error) {
        console.error("Erro ao buscar restaurantes", error.message);
        res.status(500).json({error: "Erro interno do servidor"});
    }
}

async function create(req, res) {
    const { name, category } = req.body;

    if (!name || !category) {
        return res.status(400).json({error: "Nome e categoria são obrigatórios"});
    }

    const normalizedCategory = String(category).trim();
    if (!CATEGORIES.includes(normalizedCategory)) {
        return res.status(400).json({
            error: `Categoria inválida. Escolha uma das opções: ${CATEGORIES.join(', ')}`
        });
    }

    try {
        const novoRestaurante = await prisma.restaurant.create({
           data: {
                name,
                category: normalizedCategory,
                ownerId: req.user.id,
                rating: null
            }
        });

        res.status(201).json({
            restaurant: novoRestaurante,
            message: "Restaurante cadastrado com sucesso."
        });
    } catch (error) {
        console.error("Erro ao criar restaurante", error.message);
        res.status(500).json({error: "Erro interno do servidor"});
    }

}

module.exports = {
    list,
    create,
    CATEGORIES
};
