require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const connectDb = require("../config/db");

const seed = async () => {
  await connectDb();
  await User.deleteMany({});
  await Project.deleteMany({});

  const ownerPassword = await User.hashPassword("AdminPass123!");
  await User.create({
    name: "System Admin",
    email: "admin@arena.com",
    passwordHash: ownerPassword,
    role: "admin",
  });

  // eslint-disable-next-line no-console
  console.log("Database cleared. Created admin: admin@arena.com");
  await mongoose.connection.close();
};

seed();
