require("dotenv").config();
const app = require("./app");
const connectDb = require("./config/db");
const { initCronJobs } = require("./utils/cronJobs");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    initCronJobs();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
