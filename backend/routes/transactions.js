const express = require('express');
const { body, validationResult } = require('express-validator');
const { Transaction, Category } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Validation rules
const transactionValidation = [
  body('description')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Descrição deve ter entre 1 e 255 caracteres')
    .escape(),
  body('amount')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor deve ser um número decimal válido')
    .custom(value => parseFloat(value) > 0)
    .withMessage('Valor deve ser maior que zero'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipo deve ser income ou expense'),
  body('date')
    .isISO8601()
    .withMessage('Data deve ser uma data válida'),
  body('categoryId')
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido')
];

// Get all transactions with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, categoryId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    
    // Apply filters
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const transactions = await Transaction.findAndCountAll({
      where,
      include: [{
        model: Category,
        attributes: ['id', 'name', 'color']
      }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      transactions: transactions.rows,
      totalPages: Math.ceil(transactions.count / limit),
      currentPage: parseInt(page),
      totalCount: transactions.count
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create transaction
router.post('/', authenticateToken, transactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, type, date, categoryId, receiptUrl } = req.body;

    // Check if category belongs to user
    const category = await Category.findOne({
      where: { id: categoryId, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const transaction = await Transaction.create({
      description,
      amount,
      type,
      date,
      categoryId,
      userId: req.user.id,
      receiptUrl
    });

    const transactionWithCategory = await Transaction.findByPk(transaction.id, {
      include: [{
        model: Category,
        attributes: ['id', 'name', 'color']
      }]
    });

    res.status(201).json(transactionWithCategory);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, transactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { description, amount, type, date, categoryId, receiptUrl } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Check if category belongs to user
    const category = await Category.findOne({
      where: { id: categoryId, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await transaction.update({
      description,
      amount,
      type,
      date,
      categoryId,
      receiptUrl
    });

    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [{
        model: Category,
        attributes: ['id', 'name', 'color']
      }]
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await transaction.destroy();
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get financial summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = { userId: req.user.id };
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const transactions = await Transaction.findAll({ where });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;