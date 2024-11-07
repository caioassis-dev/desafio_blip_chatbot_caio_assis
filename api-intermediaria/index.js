import fetch from 'node-fetch';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Middleware para habilitar o CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Função para buscar repositórios com um número limitado de itens por página
async function fetchRepos(urlBase) {
  const response = await fetch(urlBase);

  if (response.ok) {
    const repos = await response.json();
    return repos;
  } else {
    console.error(`Erro ao buscar os repositórios: ${response.status}`);
    throw new Error('Erro ao buscar os dados do GitHub');
  }
}

// Rota para pegar repositórios da organização do GitHub
app.get('/repos', async (req, res) => {
  const org = req.query.org || 'takenet';  // Nome da organização, padrão 'takenet'
  const language = req.query.language || 'C#'; // Linguagem a ser filtrada, padrão 'C#'
  const sort = 'created';  // Ordenar por data de criação
  const direction = 'asc';  // Ordem crescente (do mais antigo ao mais novo)
  const perPage = 5;  // Limita a quantidade de repositórios por página a 5

  const urlBase = `https://api.github.com/orgs/${org}/repos?sort=${sort}&direction=${direction}&per_page=${perPage}`;

  try {
    // Buscar os repositórios da primeira página
    const repos = await fetchRepos(urlBase);
    
    // Filtra os repositórios pela linguagem C#
    const filteredRepos = repos.filter(repo => repo.language === language);

    // Retorna os repositórios como resposta JSON
    res.json(filteredRepos);
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error);
    res.status(500).json({ error: 'Erro ao buscar os dados do GitHub' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`API intermediária rodando na porta ${port}`);
});
