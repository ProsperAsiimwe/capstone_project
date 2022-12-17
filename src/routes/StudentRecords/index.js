const { Router } = require('express');
const studentRoutes = require('./studentRoutes');
const studentApprovalRoutes = require('./studentApprovalRoutes');
const studentRecordsRoutes = require('./studentsRecordsRoutes');
const studentReportsRouter = require('./studentsReportsRoutes');
const studentProgrammeRoutes = require('./studentProgrammeRoutes');

//  Programmes Module API Endpoints
const studentMgtRouter = Router();

studentMgtRouter.use('/students', studentRoutes);

studentMgtRouter.use('/students-records', studentRecordsRoutes);
studentMgtRouter.use('/programme-details', studentProgrammeRoutes);
studentMgtRouter.use('/students-reports', studentReportsRouter);
studentMgtRouter.use('/students/approvals', studentApprovalRoutes);

module.exports = studentMgtRouter;
