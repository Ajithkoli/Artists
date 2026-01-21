const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./config.env" });
}
const connectDatabase = require("./db");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "";

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    console.log("CORS Check - Origin:", origin, "FrontendURL:", frontendUrl); // Debug Log

    const isVercelPreview = origin.endsWith(".vercel.app");

    // Add specifically allowed origins here if needed
    const allowedOrigins = [frontendUrl, "https://artists-ochre.vercel.app"];

    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug Middleware to log requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log("Headers Content-Type:", req.headers['content-type']);
  console.log("Body:", req.body);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Database connection
connectDatabase();

const errorMiddleware = require("./utils/errorHandler.js");

app.get("/", (req, res) => res.send("Hello, Backend!"));

// Add this line below your other app.use() calls
app.use("/api/v1/news", require("./routes/news.routes"));

app.use("/api/v1/image", express.static(`./uploads`));
// app.use("/images", express.static(path.join(__dirname, "public")));
app.use("/api/v1/upload", express.static("upload"));
app.use("/api/v1/artworks", require("./routes/artworkroutes.js"));

// app.use("/api/v1/ai", require("./routes/ai"));
// app.use("/api/v1/user", require("./routes/"));
app.use("/api/v1/watermark", express.static("public/artworks"));

app.use("/api/v1/users", require("./routes/auth.routes"));

app.use("/api/v1/courses", require("./routes/courseRoutes"));

app.use("/api/v1/explore", require("./routes/PostCreator"));

app.use("/api/v1/products", require("./routes/productRoutes"));

app.use("/api/v1/communities", require("./routes/community.routes"));
app.use("/api/v1/payment", require("./routes/payment.routes"));

// AI proxy routes (server-side generative AI calls)
app.use('/api/v1/ai', require('./routes/ai.routes'));

// With your other app.use() calls
app.use("/api/v1/admin", require("./routes/admin.routes.js"));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
