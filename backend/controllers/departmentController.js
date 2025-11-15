const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all departments
 */
async function getAllDepartments(req, res) {
  try {
    const { includeInactive = false } = req.query;

    const where = includeInactive === 'true' ? {} : { isActive: true };

    const departments = await prisma.department.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({ departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

/**
 * Get department by ID
 */
async function getDepartmentById(req, res) {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id }
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
}

/**
 * Create new department
 */
async function createDepartment(req, res) {
  try {
    const {
      name,
      description,
      headName,
      location,
      phoneNumber,
      email
    } = req.body;

    // Check if department already exists
    const existing = await prisma.department.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existing) {
      return res.status(400).json({ error: 'Department with this name already exists' });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        headName,
        location,
        phoneNumber,
        email
      }
    });

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
}

/**
 * Update department
 */
async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      headName,
      location,
      phoneNumber,
      email,
      isActive
    } = req.body;

    // Check if department exists
    const existing = await prisma.department.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // If changing name, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await prisma.department.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      });

      if (duplicate) {
        return res.status(400).json({ error: 'Department with this name already exists' });
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(headName !== undefined && { headName }),
        ...(location !== undefined && { location }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(email !== undefined && { email }),
        ...(typeof isActive === 'boolean' && { isActive })
      }
    });

    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
}

/**
 * Delete department
 */
async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    // Check if department exists
    const existing = await prisma.department.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Department not found' });
    }

    await prisma.department.delete({
      where: { id }
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
}

/**
 * Get department statistics
 */
async function getDepartmentStatistics(req, res) {
  try {
    const totalDepartments = await prisma.department.count();
    const activeDepartments = await prisma.department.count({ where: { isActive: true } });

    res.json({
      total: totalDepartments,
      active: activeDepartments,
      inactive: totalDepartments - activeDepartments
    });
  } catch (error) {
    console.error('Error fetching department statistics:', error);
    res.status(500).json({ error: 'Failed to fetch department statistics' });
  }
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStatistics
};
