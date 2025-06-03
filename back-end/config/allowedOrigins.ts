const allowedOrigins = [
  "http://localhost:3000", // Local development
  "http://localhost:5173", // Vite dev server
  "https://gl.product-server.tech", // Production frontend
  "https://www.gl.product-server.tech", // Production frontend with www
  "https://gl1.product-server.tech", // Production backend API
  process.env.CLIENT_URL, // Environment variable override
];

export default allowedOrigins;
