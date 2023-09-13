import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import "./loadEnvironment.mjs";
import categories from "./controllers/categoriesController.mjs";
import services from "./controllers/servicesController.mjs";
import users from "./controllers/usersController.mjs";
import appointments from "./controllers/appointmentsController.mjs";
import promocodes from "./controllers/promocodeController.mjs";
import reservations from "./controllers/reservationsController.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

const dbURI = process.env.ATLAS_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});

app.use("/categories", categories);
app.use("/services", services);
app.use("/users", users);
app.use("/appointments", appointments);
app.use("/promocodes", promocodes);
app.use("/reservations", reservations);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});