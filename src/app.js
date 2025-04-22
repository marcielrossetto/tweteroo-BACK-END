import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db.js';  // Certifique-se de que o caminho está correto
import User from './models/User.js';
import Tweet from './models/Tweet.js';

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

// POST /tweets
app.post('/tweets', async (req, res) => {
  const { username, tweet } = req.body;

  // Validação
  if (typeof username !== 'string' || typeof tweet !== 'string') {
    return res.status(422).json({ message: 'username e tweet são obrigatórios e devem ser strings.' });
  }

  // Verifica se o usuário existe
  const user = await User.findOne({ name: username });
  if (!user) {
    return res.status(401).json({ message: 'Usuário não autorizado. Faça o cadastro primeiro.' });
  }

  try {
    const newTweet = new Tweet({ username, tweet });
    await newTweet.save();
    res.status(201).json({ message: 'Tweet criado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar tweet.' });
  }
});

//Rota obter twets

app.get('/tweets',async(req, res)=>{
  try {
    const tweets = await Tweet.find().sort({ createdAt: -1 });

    const tweetsWithAvatar = await Promisse.all(
      tweets.map(async (tweet) => {
        const user = await User.findOne({ name: tweet.username});
        return { 
          _id: tweet._id,
          username: tweet.username,
          avatar: user?.avatar || '',
          tweet: tweet.tweet
        };
      })
    );
    res.status(200).json(tweetsWithAvatar);
  }catch (error) {
    console.error('Erro9 ao buscar tweets:', error);
    res.status(500).json({ message: 'Erro ao buscar tweets.'});
  }
});

//Editar tweets
app.put('/tweets/:id', async (req, res) => {
  const { id } = req.params;
  const { username, tweet } = req.body;

  // Validação básica
  if (!username || !tweet || typeof username !== 'string' || typeof tweet !== 'string') {
    return res.status(422).json({ message: 'Campos inválidos' });
  }

  // Verifica se o ID é válido do MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Tweet não encontrado' });
  }

  try {
    const tweetFound = await Tweet.findById(id);

    if (!tweetFound) {
      return res.status(404).json({ message: 'Tweet não encontrado' });
    }

    // Atualiza o tweet
    await Tweet.updateOne(
      { _id: id },
      { $set: { username, tweet } }
    );

    res.sendStatus(204); // Sucesso sem conteúdo
  } catch (error) {
    console.error('Erro ao editar tweet:', error);
    res.status(500).json({ message: 'Erro ao editar tweet' });
  }
});

//deletando tweet
app.delete('/tweets/:id', async (req, res) => {
  const { id } = req.params;

  // Verifica se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Tweet não encontrado' });
  }

  try {
    const tweet = await Tweet.findById(id);

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet não encontrado' });
    }

    await Tweet.deleteOne({ _id: id });

    res.sendStatus(204); // No Content
  } catch (error) {
    console.error('Erro ao deletar tweet:', error);
    res.status(500).json({ message: 'Erro ao deletar tweet' });
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
