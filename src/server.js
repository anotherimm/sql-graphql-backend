const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const schema = require("./graphql/schema");
const authMiddleware = require("./middleware/auth.middleware");
require("dotenv").config();

// 1. Inisialisasi aplikasi Express
const app = express();

// 2. Terapkan middleware keamanan di setiap request
// Middleware ini akan memeriksa token dan menempelkan `req.user` jika valid
app.use(authMiddleware);

// 3. Buat GraphQL handler
const graphQLHandler = createHandler({
  schema: schema,
  // 4. Sediakan `context` untuk semua resolver
  // `context` adalah jembatan antara middleware Express dan logika GraphQL Anda
  context: (req) => ({
    // `req.raw.user` berasal dari `req.user` yang diatur oleh auth.middleware.js
    user: req.raw.user,
    isAuth: req.raw.isAuth,
  }),
});

// 5. Terapkan handler ke endpoint `/graphql`
app.all("/graphql", graphQLHandler);

// 6. Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}/graphql`);
});
