require("dotenv").config();

const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("../src/app");
const prisma = require("../src/database/prisma");

let server;
let baseUrl;
let testEmail;
let userId;
let restaurantId;

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const body = await response.json();
    return { response, body };
}

before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    testEmail = `api-test-${Date.now()}@example.com`;
});

after(async () => {
    if (restaurantId) {
        await prisma.restaurant.deleteMany({ where: { id: restaurantId } });
    }
    if (userId) {
        await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.$disconnect();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("autenticacao e restaurantes funcionam sem verificacao de e-mail", async () => {
    const invalidRegister = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: "", email: testEmail, password: "senha123" })
    });
    assert.equal(invalidRegister.response.status, 400);

    const register = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: "Usuario de Teste", email: testEmail, password: "senha123" })
    });
    assert.equal(register.response.status, 201);
    assert.equal(register.body.email, testEmail);
    assert.equal(Object.hasOwn(register.body, "emailSent"), false);
    userId = register.body.id;

    const duplicate = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: "Outro Nome", email: testEmail, password: "senha123" })
    });
    assert.equal(duplicate.response.status, 409);

    const wrongLogin = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: testEmail, password: "senha-incorreta" })
    });
    assert.equal(wrongLogin.response.status, 401);

    const login = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: testEmail, password: "senha123" })
    });
    assert.equal(login.response.status, 200);
    assert.ok(login.body.token);

    const me = await request("/auth/me", {
        headers: { Authorization: `Bearer ${login.body.token}` }
    });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.id, userId);

    const unauthenticatedCreate = await request("/restaurants", {
        method: "POST",
        body: JSON.stringify({ name: "Restaurante sem token", category: "Italiana" })
    });
    assert.equal(unauthenticatedCreate.response.status, 401);

    const invalidCategory = await request("/restaurants", {
        method: "POST",
        headers: { Authorization: `Bearer ${login.body.token}` },
        body: JSON.stringify({ name: "Categoria Inválida", category: "Categoria Folclórica" })
    });
    assert.equal(invalidCategory.response.status, 400);

    const createRestaurant = await request("/restaurants", {
        method: "POST",
        headers: { Authorization: `Bearer ${login.body.token}` },
        body: JSON.stringify({ name: "Restaurante de Teste", category: "Italiana", rating: 5 })
    });
    assert.equal(createRestaurant.response.status, 201);
    assert.equal(createRestaurant.body.message, "Restaurante cadastrado com sucesso.");
    assert.equal(createRestaurant.body.restaurant.rating, null);
    restaurantId = createRestaurant.body.restaurant.id;

    const restaurants = await request("/restaurants");
    assert.equal(restaurants.response.status, 200);
    assert.ok(restaurants.body.some((restaurant) => restaurant.id === restaurantId));
});
