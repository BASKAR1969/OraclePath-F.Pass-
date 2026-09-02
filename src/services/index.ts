// ============================================================
// OraclePath — Services Registry
// Parent: Ervion Technologies
// Single entry point for all data services. Clean, typed, isolated.
// ============================================================

export { getServiceClient, getAdapterMode, isAdapterMock, isAdapterReal, isAdapterDead, resetAdapter } from './adapter';
export * as authService from './auth';
export * as courseService from './courses';
export * as enrollmentService from './enrollments';
export * as studentService from './students';
export * as internshipService from './internships';
export * as certificateService from './certificates';
export * as orderService from './orders';
