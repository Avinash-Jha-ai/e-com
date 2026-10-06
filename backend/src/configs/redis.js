import Redis from "ioredis";
import { configs } from "./config.js";

const redis = new Redis(configs.REDIS_URL);

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis Error:", error);
});

export default redis;