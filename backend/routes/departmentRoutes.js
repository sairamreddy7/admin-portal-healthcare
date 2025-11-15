const express = require('express');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStatistics
} = require('../controllers/departmentController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');
const { apiLimiter, createUserLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// Apply rate limiting
router.use(apiLimiter);

// Department validation rules
const validateCreateDepartment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('headName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Head name must be less than 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
];

const validateUpdateDepartment = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('headName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Head name must be less than 100 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// GET /api/departments - Get all departments
router.get('/', getAllDepartments);

// GET /api/departments/statistics - Get department statistics
router.get('/statistics', getDepartmentStatistics);

// GET /api/departments/:id - Get department by ID
router.get('/:id', validateUUID('id'), getDepartmentById);

// POST /api/departments - Create new department
router.post('/', createUserLimiter, validateCreateDepartment, createDepartment);

// PUT /api/departments/:id - Update department
router.put('/:id', validateUUID('id'), validateUpdateDepartment, updateDepartment);

// DELETE /api/departments/:id - Delete department
router.delete('/:id', validateUUID('id'), deleteDepartment);

module.exports = router;
