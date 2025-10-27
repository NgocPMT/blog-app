import { Router, type Request, type Response } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

const imageRouter = Router();
const upload = multer();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

imageRouter.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new Error("Missing file.");
    }
    const fileName = `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) return res.status(500).json({ error: error.message });

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(fileName);

    return res.json({ url: publicUrl });
  }
);

export default imageRouter;
