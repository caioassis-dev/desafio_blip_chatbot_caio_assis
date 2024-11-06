
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

// Função para buscar todos os repositórios com paginação
async function fetchAllRepos(urlBase) {
  let repos = [];
  let page = 1;  // Começa na primeira página
  
  while (true) {
    const url = `${urlBase}&page=${page}`;
    const response = await fetch(url);

    if (response.ok) {
      const currentRepos = await response.json();
      
      // Se não houver mais repositórios, pare
      if (currentRepos.length === 0) {
        break;
      }

      // Adiciona os repositórios da página atual à lista de todos
      repos = [...repos, ...currentRepos];
      
      // Avança para a próxima página
      page++;
    } else {
      console.error(`Erro ao buscar os repositórios: ${response.status}`);
      break;
    }
  }
  
  return repos;
}

// Função para ordenar os repositórios pela data de criação (do mais antigo para o mais novo)
function sortReposByCreationDate(repos, direction = 'asc') {
  return repos.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

// Rota para pegar repositórios da organização do GitHub
app.get('/repos', async (req, res) => {
  const org = req.query.org || 'takenet';  // Nome da organização, padrão 'takenet'
  const language = req.query.language || ''; // Linguagem (filtra apenas se fornecido)
  const sort = req.query.sort || 'created_at';  // Parâmetro de ordenação (padrão 'created_at')
  const direction = req.query.direction || 'asc';  // Direção da ordenação (padrão 'asc')
  
  const urlBase = `https://api.github.com/orgs/${org}/repos?sort=${sort}&direction=${direction}&per_page=100`;

  try {
    // Buscar todos os repositórios da organização com paginação
    const allRepos = await fetchAllRepos(urlBase);
    
    // Filtra os repositórios pela linguagem, se fornecido
    const filteredRepos = language 
      ? allRepos.filter(repo => repo.language === language)
      : allRepos;

    // Ordena os repositórios pela data de criação
    const sortedRepos = sortReposByCreationDate(filteredRepos, direction);
    
    // Retorna os repositórios como resposta JSON
    res.json(sortedRepos);
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error);
    res.status(500).json({ error: 'Erro ao buscar os dados do GitHub' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`API intermediária rodando na porta ${port}`);
});
