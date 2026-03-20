const express = require('express');
const router = express.Router();
const courseMaterialController = require('../controllers/courseMaterialController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const tenantScope = require('../middlewares/tenantScope.middleware');

// Upload course material
router.post(
  '/upload',
  authenticate,
  authorize('teacher', 'admin'),
  tenantScope,
  courseMaterialController.uploadMiddleware.single('file'),
  courseMaterialController.uploadMaterial
);

// Get materials for a course
router.get(
  '/course/:courseId',
  authenticate,
  tenantScope,
  courseMaterialController.getCourseMaterials
);

// Update material
router.patch(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  tenantScope,
  courseMaterialController.updateMaterial
);

// Delete material
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  tenantScope,
  courseMaterialController.deleteMaterial
);

module.exports = router;