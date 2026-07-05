import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import morgan from "morgan";
import fileUpload from "express-fileupload";
import { errorHandler } from "./middlewares/error.middleware.js"
import authRoutes from "./routes/auth.routes.js";
import userRouter from './routes/User.route.js';
import boardRouter from './routes/Board.route.js';
import commentRouter from './routes/Comment.route.js';
import pinRouter from './routes/Pin.route.js';
import { ENVS } from "./config/constants.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: ENVS.FRONTEND_URL,
    credentials: true,
}))
app.use(morgan("combined"))
app.use(fileUpload())

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hello World"
    })
})

// routes
app.use("/api/auth", authRoutes)
app.use("/users", userRouter)
app.use("/boards", boardRouter)
app.use("/pins", pinRouter)
app.use("/comments", commentRouter)

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// error handlers
app.use(errorHandler)

export default app;
