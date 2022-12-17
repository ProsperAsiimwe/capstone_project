const { Router } = require('express');
const feesElementRouter = require('./feesElementRoutes');
const feesWaiverRouter = require('./feesWaiverRoutes');
const feesWaiverDiscountRouter = require('./feesWaiverDiscountRoutes');
const tuitionAmountRouter = require('./tuitionAmountRoutes');
const functionalFeesAmountRouter = require('./functionalFeesAmountRoutes');
const otherFeesAmountRouter = require('./otherFeesAmountRoutes');
const graduationFeesRouter = require('./graduationFeesRoutes');

const feesAmountPreviewHandlerRouter = require('./feesAmountPreviewHandlerRoutes');
const feesApprovalRouter = require('./feesApprovalRoutes');
const exemptedTuitionCampusRouter = require('./exemptedTuitionCampusRoutes');

//  Fees Module API Endpoints
const feesRouter = Router();

feesRouter.use('/fees-elements', feesElementRouter);
feesRouter.use('/fees-waivers', feesWaiverRouter);
feesRouter.use('/fees-waiver-discounts', feesWaiverDiscountRouter);
feesRouter.use('/tuition-amounts', tuitionAmountRouter);
feesRouter.use('/functional-fees-amounts', functionalFeesAmountRouter);
feesRouter.use('/other-fees-amounts', otherFeesAmountRouter);
feesRouter.use('/fees-amount-preview', feesAmountPreviewHandlerRouter);
feesRouter.use('/fees-approvals', feesApprovalRouter);
feesRouter.use('/manage-affiliates', exemptedTuitionCampusRouter);
feesRouter.use('/graduation-fees', graduationFeesRouter);

module.exports = feesRouter;
