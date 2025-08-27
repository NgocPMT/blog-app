import express from "express";
import "dotenv/config";

const app = express();

app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Hello World" }));

const PORT = process.env.PORT;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is running on PORT ${PORT}`);
});
