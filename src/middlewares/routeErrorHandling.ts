import type { Request, Response, NextFunction } from "express";

const routeErrorHandling = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({ error: "Route not found" });
};

export default routeErrorHandling;
