import { Router, Request, Response, NextFunction } from 'express'
import businessService from "./service"

const findAll = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = businessService.findAll();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

const findOne = (req: Request, res: Response, next: NextFunction) => {
  try {
    const entity = businessService.findBusinessWorkflow(req.params.fein);
    res.status(200).json(entity);
  } catch (error) {
    next(error);
  }
}

const create = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = businessService.initBusinessWorkflow(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = businessService.processBusinessWorkflow(req.params.fein, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

const router = Router();

router.route('/').get(findAll);
router.route('/').post(create);
router.route('/:fein').get(findOne);
router.route('/:fein').post(update);

export default router;
