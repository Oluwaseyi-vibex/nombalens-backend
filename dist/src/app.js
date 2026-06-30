import express from "express";
import routes from "./routes/index.js";
const app = express();
app.use(express.json());
app.get("/health", (req, res) => {
    res.json({
        status: "success",
        message: "NombaLens is running...",
    });
});
app.use("/api/v1", routes);
export default app;
//# sourceMappingURL=app.js.map