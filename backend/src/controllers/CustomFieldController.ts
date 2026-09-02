import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class CustomFieldController {
  
  static async getFields(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const entityType = req.query.entityType as string;

      const whereClause: any = { workspaceId };
      if (entityType) {
        whereClause.entityType = entityType;
      }

      const fields = await prisma.customFieldDefinition.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' }
      });

      res.json(fields);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      res.status(500).json({ error: 'Failed to fetch custom fields' });
    }
  }

  static async createField(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const { entityType, name, key, type, options, required } = req.body;

      // Validate inputs
      if (!entityType || !name || !key || !type) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Check for duplicate key
      const existing = await prisma.customFieldDefinition.findFirst({
        where: { workspaceId, entityType, key }
      });

      if (existing) {
        res.status(400).json({ error: `A field with key "${key}" already exists for this entity type.` });
        return;
      }

      const newField = await prisma.customFieldDefinition.create({
        data: {
          workspaceId,
          entityType,
          name,
          key,
          type,
          options,
          required: required || false
        }
      });

      res.status(201).json(newField);
    } catch (error) {
      console.error('Error creating custom field:', error);
      res.status(500).json({ error: 'Failed to create custom field' });
    }
  }

  static async updateField(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const fieldId = parseInt(req.params.id as string, 10);
      const { name, type, options, required } = req.body;

      // Verify ownership
      const field = await prisma.customFieldDefinition.findFirst({
        where: { id: fieldId, workspaceId }
      });

      if (!field) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      const updatedField = await prisma.customFieldDefinition.update({
        where: { id: fieldId },
        data: {
          name: name !== undefined ? name : field.name,
          type: type !== undefined ? type : field.type,
          options: options !== undefined ? options : field.options,
          required: required !== undefined ? required : field.required
        }
      });

      res.json(updatedField);
    } catch (error) {
      console.error('Error updating custom field:', error);
      res.status(500).json({ error: 'Failed to update custom field' });
    }
  }

  static async deleteField(req: AuthRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId!;
      const fieldId = parseInt(req.params.id as string, 10);

      const field = await prisma.customFieldDefinition.findFirst({
        where: { id: fieldId, workspaceId }
      });

      if (!field) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      await prisma.customFieldDefinition.delete({
        where: { id: fieldId }
      });

      res.json({ message: 'Field deleted successfully' });
    } catch (error) {
      console.error('Error deleting custom field:', error);
      res.status(500).json({ error: 'Failed to delete custom field' });
    }
  }
}
