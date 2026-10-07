import app from "./src/app.js";
import connectMongoDb from "./src/database/mongo.db.js";

import { configs } from "./src/configs/config.js";

const startServer = async () => {
  try {
    await connectMongoDb();
    app.listen(configs.PORT, () => {
      console.log(`✅ link : http://localhost:${configs.PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
