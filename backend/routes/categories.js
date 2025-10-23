const express = require('express');
const { Category } = require('../models');

const router = express.Router();

// Retorna todas as categorias (pré-definidas).
// Esse endpoint agora é somente leitura para evitar criação/edição/removal de categorias pelo cliente.
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['type','ASC'], ['name','ASC']] });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
