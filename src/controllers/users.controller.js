import User from '../models/User.js';

export async function signUp(req, res) {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send("Nome e e-mail são obrigatórios.");
  }

  try {
    // Cria um novo usuário
    const newUser = new User({ name, email });
    
    // Salva o usuário no banco
    await newUser.save();

    res.status(201).send("Usuário cadastrado com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    res.status(500).send("Erro ao cadastrar usuário.");
  }
}
