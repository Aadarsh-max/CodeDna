import express from "express";
import cors from "cors";
import morgan from "morgan";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import repoRoutes from "./routes/repoRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;