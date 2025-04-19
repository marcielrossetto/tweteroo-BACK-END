import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';  // Certifique-se de que o caminho está correto
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();  // Conecta ao MongoDB

app.get('/', (req, res) => {
  res.send('Tweteroo API rodando!');
});

// Rota de sign-up
app.post('/sign-up', async (req, res) => {
    const { name, email, avatar } = req.body;  

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso.' });
    }

    try {
      const newUser = new User({
        name, 
        email,
        avatar,  
      });

      await newUser.save();
      res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error) {
      console.error('Erro no servidor:', error);
      res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
    }
});

// Rota para buscar usuários
app.get('/users', async (req, res) => {
    try {
      const users = await User.find(); // Busca todos os usuários
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
