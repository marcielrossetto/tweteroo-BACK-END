export function signUp(req, res) {
    const { name, email } = req.body;
  
    if (!name || !email) {
      return res.status(400).send("Nome e e-mail são obrigatórios.");
    }
  
    // Aqui você pode salvar no banco depois
    console.log({ name, email });
  
    res.status(201).send("Usuário cadastrado com sucesso!");
  }
  