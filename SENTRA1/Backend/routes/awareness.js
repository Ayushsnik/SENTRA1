import express from 'express';
import Awareness from '../models/Awareness.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/awareness
// @desc    Get all active awareness content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await Awareness.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/awareness
// @desc    Create awareness content
// @access  Private (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, category, content, icon, order } = req.body;

    const awarenessItem = await Awareness.create({
      title,
      category,
      content,
      icon,
      order,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Awareness content created successfully',
      awarenessItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/awareness/:id
// @desc    Update awareness content
// @access  Private (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, category, content, icon, order, isActive } = req.body;

    const awarenessItem = await Awareness.findById(req.params.id);

    if (!awarenessItem) {
      return res.status(404).json({ message: 'Content not found' });
    }

    awarenessItem.title = title || awarenessItem.title;
    awarenessItem.category = category || awarenessItem.category;
    awarenessItem.content = content || awarenessItem.content;
    awarenessItem.icon = icon || awarenessItem.icon;
    awarenessItem.order = order !== undefined ? order : awarenessItem.order;
    awarenessItem.isActive = isActive !== undefined ? isActive : awarenessItem.isActive;
    awarenessItem.updatedAt = Date.now();

    await awarenessItem.save();

    res.json({
      message: 'Awareness content updated successfully',
      awarenessItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/awareness/:id
// @desc    Delete awareness content
// @access  Private (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const awarenessItem = await Awareness.findById(req.params.id);

    if (!awarenessItem) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await awarenessItem.deleteOne();

    res.json({ message: 'Awareness content deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;