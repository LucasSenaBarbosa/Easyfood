const express = require("express");
const cors = require("cors");
const path = require("path");

const restaurantRoutes = require("./modules/restaurant/restaurant.routes");
const authRoutes = require("./modules/auth/auth.routes")
const dishRoutes = require("./modules/dishes/dish.routes");
const searchRoutes = require("./modules/search/search.routes");
const favoriteRoutes = require("./modules/favorites/favorite.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const imageService = require("./modules/shared/image.service");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));
app.use(imageService.PUBLIC_PREFIX, express.static(imageService.UPLOAD_ROOT));


app.use("/auth", authRoutes); 
app.use(dishRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/search", searchRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/cart", cartRoutes);
app.use("/notifications", notificationRoutes);
    


module.exports = app;