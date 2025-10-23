require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema financeiro rodando com SQLite!',
    timestamp: new Date().toISOString()
  });
});

// CSRF token simplificado
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: 'dev-csrf-token' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Arquivo muito grande. Máximo: 5MB' });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 5000;

// Iniciar servidor
sequelize.sync({ force: false })
  .then(() => {
    // --- Seed categorias pré-definidas (apenas se a tabela estiver vazia) ---
    const { Category } = require('./models');

    async function seedDefaultCategories() {
      try {
        const count = await Category.count();
        if (count === 0) {
          const defaults = [
            { name: 'Salário', type: 'income', color: '#2ecc71' },
            { name: 'Investimentos', type: 'income', color: '#27ae60' },
            { name: 'Presente', type: 'income', color: '#16a085' },
            { name: 'Alimentação', type: 'expense', color: '#e74c3c' },
            { name: 'Transporte', type: 'expense', color: '#c0392b' },
            { name: 'Lazer', type: 'expense', color: '#9b59b6' },
            { name: 'Contas', type: 'expense', color: '#34495e' },
            { name: 'Saúde', type: 'expense', color: '#e67e22' },
            { name: 'Educação', type: 'expense', color: '#f39c12' }
          ];
          await Category.bulkCreate(defaults);
          console.log('🔰 Categorias padrão semeadas.');
        } else {
          console.log('🔎 Categorias já existem, seed ignorado.');
        }
      } catch (err) {
        console.error('Erro ao semear categorias:', err);
      }
    }

    // --- Chamar a função para semear as categorias ---
    seedDefaultCategories();

    console.log('✅ Banco de dados SQLite conectado e tabelas sincronizadas!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ Erro ao conectar com o banco:', err);
  });
