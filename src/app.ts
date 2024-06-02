import express, { Request, Response, NextFunction } from 'express';
import businessRouter from './business/handlers'
import { ZodError } from 'zod';

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    message: error.message,
    issues: error instanceof ZodError ? error.issues : []
  });
};

const app = express();
app.use(express.json());
app.use('/businesses/', businessRouter);
app.use(errorHandler);

export default app;
