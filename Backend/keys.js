const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
const Jwt_secret = process.env.JWT_SECRET || "starknet_fallback_jwt_secret_key_9988";

module.exports = { mongoUrl, Jwt_secret };
