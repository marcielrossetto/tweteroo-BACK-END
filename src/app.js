import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './db.js';
import User from './models/User.js';
import Tweet from './models/Tweet.js'; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB(); // Conecta ao MongoDB

app.get('/', (req, res) => {
  res.send('Tweteroo API rodando!');
});

// POST /sign-up
app.post('/sign-up', async (req, res) => {
  const { username, avatar } = req.body;

  if (!username || !avatar) {
    return res.status(400).json({ message: 'username e avatar são obrigatórios.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Este username já está em uso.' });
    }

    const newUser = new User({ username, avatar });
    await newUser.save();

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
});

// POST /tweets
app.post('/tweets', async (req, res) => {
  const { username, tweet } = req.body;

  // Validação
  if (typeof username !== 'string' || typeof tweet !== 'string') {
    return res.status(422).json({ message: 'username e tweet são obrigatórios e devem ser strings.' });
  }

  // Verifica se o usuário existe
  const user = await User.findOne({ username }); // Corrigido de 'name' para 'username'
  if (!user) {
    return res.status(401).json({ message: 'Usuário não autorizado. Faça o cadastro primeiro.' });
  }

  try {
    const newTweet = new Tweet({ username, tweet });
    await newTweet.save();
    res.status(201).json({ message: 'Tweet criado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar tweet:', error);
    res.status(500).json({ message: 'Erro ao criar tweet.' });
  }
});

// GET /tweets/:username
app.get('/tweets/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const tweets = await Tweet.find({ username }).sort({ createdAt: -1 });

    const tweetsWithAvatar = await Promise.all(
      tweets.map(async (tweet) => {
        const user = await User.findOne({ username: tweet.username });
        return { 
          _id: tweet._id,
          username: tweet.username,
          avatar: user?.avatar || '',
          tweet: tweet.tweet
        };
      })
    );

    res.status(200).json(tweetsWithAvatar);
  } catch (error) {
    console.error('Erro ao buscar tweets do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar tweets.' });
  }
});

// GET /tweets
app.get('/tweets', async (req, res) => {
  try {
    const tweets = await Tweet.find().sort({ createdAt: -1 });

    const tweetsWithAvatar = await Promise.all(
      tweets.map(async (tweet) => {
        const user = await User.findOne({ username: tweet.username }); // Corrigido de 'name' para 'username'
        return { 
          _id: tweet._id,
          username: tweet.username,
          avatar: user?.avatar || '',
          tweet: tweet.tweet
        };
      })
    );
    res.status(200).json(tweetsWithAvatar);
  } catch (error) {
    console.error('Erro ao buscar tweets:', error);
    res.status(500).json({ message: 'Erro ao buscar tweets.' });
  }
});

// PUT /tweets/:id
app.put('/tweets/:id', async (req, res) => {
  const { id } = req.params;
  const { username, tweet } = req.body;

  if (!username || !tweet || typeof username !== 'string' || typeof tweet !== 'string') {
    return res.status(422).json({ message: 'Campos inválidos' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Tweet não encontrado' });
  }

  try {
    const tweetFound = await Tweet.findById(id);

    if (!tweetFound) {
      return res.status(404).json({ message: 'Tweet não encontrado' });
    }

    await Tweet.updateOne(
      { _id: id },
      { $set: { username, tweet } }
    );

    res.sendStatus(204);
  } catch (error) {
    console.error('Erro ao editar tweet:', error);
    res.status(500).json({ message: 'Erro ao editar tweet' });
  }
});

// DELETE /tweets/:id
app.delete('/tweets/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Tweet não encontrado' });
  }

  try {
    const tweet = await Tweet.findById(id);

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet não encontrado' });
    }

    await Tweet.deleteOne({ _id: id });

    res.sendStatus(204);
  } catch (error) {
    console.error('Erro ao deletar tweet:', error);
    res.status(500).json({ message: 'Erro ao deletar tweet' });
  }
});

// GET /users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));