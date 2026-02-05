const mongoose = require("mongoose");

const DEFAULT_RETRY_DELAY_MS = 3000;
const DEFAULT_MAX_RETRIES = 10;

const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.set("strictQuery", true);

  const connectWithRetry = async (attempt = 1) => {
    try {
      await mongoose.connect(mongoUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      // eslint-disable-next-line no-console
      console.log("MongoDB connected");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `MongoDB connection failed (attempt ${attempt}/${DEFAULT_MAX_RETRIES})`,
        error.message
      );

      if (attempt >= DEFAULT_MAX_RETRIES) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_RETRY_DELAY_MS)
      );
      return connectWithRetry(attempt + 1);
    }
  };

  let isReconnecting = false;

  mongoose.connection.on("disconnected", async () => {
    if (isReconnecting) return;
    isReconnecting = true;
    // eslint-disable-next-line no-console
    console.warn("MongoDB disconnected. Attempting to reconnect...");
    try {
      await connectWithRetry(1);
    } finally {
      isReconnecting = false;
    }
  });

  mongoose.connection.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB error:", error.message);
  });

  await connectWithRetry(1);
};

module.exports = connectDb;
