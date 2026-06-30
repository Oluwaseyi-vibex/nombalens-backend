import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.close(() => {
        process.exit(0);
    });
});
process.on("SIGTERM", () => {
    console.log("Shutting down server...");
    server.close(() => {
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map