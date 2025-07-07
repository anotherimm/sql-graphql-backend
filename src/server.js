const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const schema = require("./graphql/schema");
const authMiddleware = require("./middleware/auth.middleware");
require("dotenv").config();

const app = express();

app.use(authMiddleware);


const graphQLHandler = createHandler({
  schema: schema,

  context: (req) => ({
    // `req.raw.user` berasal dari `req.user` yang diatur oleh auth.middleware.js
    user: req.raw.user,
    isAuth: req.raw.isAuth,
  }),
});


app.all("/graphql", graphQLHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}/graphql`);
});
