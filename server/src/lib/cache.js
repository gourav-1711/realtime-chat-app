const NodeCache = require("node-cache");

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects for better performance
});

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET" && req.method !== "POST") {
      return next();
    }

    // Create cache key from URL and user ID
    const userId = req.user?.id || "anonymous";
    const key = `${userId}:${req.originalUrl || req.url}`;

    // Check if we have cached data
    const cachedData = cache.get(key);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode === 200 && data.status === "success") {
        cache.set(key, data, duration);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache for a specific user
 * @param {string} userId - User ID to invalidate cache for
 */
const invalidateUserCache = (userId) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key.startsWith(`${userId}:`)) {
      cache.del(key);
    }
  });
};

/**
 * Clear all cache
 */
const clearAllCache = () => {
  cache.flushAll();
};

/**
 * Get cache stats
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateUserCache,
  clearAllCache,
  getCacheStats,
};
