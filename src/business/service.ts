import { Business, WorkflowAction, feinSchema, handleBusinessWorkflow, workflow } from "./models";
import businessRepository from "./repository"

type BusinessWorkflow = {
  business: Business,
  nextStep?: {
    type: string,
    payload: Array<string>
  }
}

const getBusinessWorkflow = (business: Business): BusinessWorkflow => {
  const nextStep = workflow.find(x => x.inputState === business.state);
  if (nextStep) {
    const payload = [];
    for (const field in nextStep.validationSchema.shape) {
      payload.push(field);
    }
    return {
      business,
      nextStep: { type: nextStep.step, payload }
    }
  }
  return { business };
};

const findAll = () => businessRepository.findAll();

const findOne = (fein: string) => {
  feinSchema.parse(fein);
  const entity = businessRepository.findOne(fein);
  if (!entity) {
    throw new Error(`Entity ${fein} not found.`);
  }
  return entity;
};

const findBusinessWorkflow = (fein: string): BusinessWorkflow => {
  return getBusinessWorkflow(findOne(fein));
}

const initBusinessWorkflow = (action: WorkflowAction): BusinessWorkflow => {
  const business = handleBusinessWorkflow(action);
  const entity = businessRepository.findOne(business.fein);
  if (entity) {
    throw new Error(`Business ${business.fein} already added.`);
  }
  businessRepository.createOrUpdate(business);
  return getBusinessWorkflow(business);
};

const processBusinessWorkflow = (fein: string, action: WorkflowAction): BusinessWorkflow => {
  const business = handleBusinessWorkflow(action, findOne(fein));
  businessRepository.createOrUpdate(business);
  return getBusinessWorkflow(business);
};

export default { findAll, findBusinessWorkflow, initBusinessWorkflow, processBusinessWorkflow };
