import { z } from 'zod'

const industrySchema = z.enum(["restaurants", "stores", "wholesale", "services"]);
const stateSchema = z.enum(["NEW", "MARKET_APPROVED", "MARKET_DECLINED", "SALES_APPROVED", "DEAL_WON", "DEAL_LOST"]);
const feinSchema = z.string().regex(/^\d+$/).length(9);
const contactSchema = z.object({
  name: z.string(),
  phone: z.string()
}).strict();
const businessSchema = z.object({
  fein: feinSchema,
  name: z.string(),
  industry: industrySchema.optional(),
  contact: contactSchema.optional(),
  state: stateSchema
}).strict();
const addPayloadSchema = businessSchema.pick({
  fein: true,
  name: true
}).strict();
const approveForMarketSchema = z.object({
  industry: industrySchema
}).strict();
const approveForSalesSchema = contactSchema.strict();
const dealClosedSchema = z.object({
  won: z.boolean()
}).strict();

type BusinessIndustry = z.infer<typeof industrySchema>;
type Business = z.infer<typeof businessSchema>;
type WorkflowActionAdd = {type: "ADD", payload: z.infer<typeof addPayloadSchema>};
type WorkflowActionApproveForMarket = {type: "APPROVE_FOR_MARKET", payload: z.infer<typeof approveForMarketSchema>};
type WorkflowActionApproveForSales = {type: "APPROVE_FOR_SALES", payload: z.infer<typeof approveForSalesSchema>};
type WorkflowActionDealClosed = {type: "DEAL_CLOSED", payload: z.infer<typeof dealClosedSchema>};
type WorkflowAction = WorkflowActionAdd
  | WorkflowActionApproveForMarket 
  | WorkflowActionApproveForSales 
  | WorkflowActionDealClosed;

const MARKET_APPROVED: BusinessIndustry[] = ["restaurants", "stores"];

const workflow = [
  { step: 'ADD', validationSchema: addPayloadSchema },
  { step: 'APPROVE_FOR_MARKET', validationSchema: approveForMarketSchema, inputState: 'NEW' },
  { step: 'APPROVE_FOR_SALES', validationSchema: approveForSalesSchema, inputState: 'MARKET_APPROVED' },
  { step: 'DEAL_CLOSED', validationSchema: dealClosedSchema, inputState: 'SALES_APPROVED' },
];

const handleBusinessWorkflow = (action: WorkflowAction, business?: Business): Business => {

  const step = workflow.find(x => x.step === action.type);
  if (!step || business?.state !== step.inputState) {
    throw new Error(`Invalid workflow step ${action.type}`);
  }

  step.validationSchema.parse(action.payload);

  if (action.type === "ADD") {
    return {
      state: "NEW",
      ...action.payload,
    };
  }

  if (!business) {
    throw new Error(`Uninitialized business entity.`);
  }

  switch (action.type) {
    case "APPROVE_FOR_MARKET":
      business.industry = action.payload.industry;
      if (MARKET_APPROVED.includes(business.industry)) {
        business.state = "MARKET_APPROVED";
      } else {
        business.state = "MARKET_DECLINED";
      }
      break;

    case "APPROVE_FOR_SALES":
      business.contact = action.payload;
      business.state = "SALES_APPROVED"
      break;

    case "DEAL_CLOSED":
      business.state = action.payload.won ? "DEAL_WON" : "DEAL_LOST";
      break;
  }

  return business;
};

export { Business, WorkflowAction, handleBusinessWorkflow, feinSchema, workflow };
