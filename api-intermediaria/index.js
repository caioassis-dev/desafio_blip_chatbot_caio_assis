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
  const perPage = 6;  // Limita a quantidade de repositórios por página a 6
  const minRepos = 5;  // Número mínimo de repositórios com linguagem C# desejado conforme solicitado no desafio para criar 5 cards

  let page = 1;  // Começar da primeira página
  let allRepos = [];

  try {
    while (allRepos.length < minRepos) {
      const urlBase = `https://api.github.com/orgs/${org}/repos?sort=${sort}&direction=${direction}&per_page=${perPage}&page=${page}`;
      const repos = await fetchRepos(urlBase);

      // Filtra os repositórios pela linguagem C#
      const filteredRepos = repos.filter(repo => repo.language === language);

      // Adiciona os repositórios filtrados à lista final
      allRepos = allRepos.concat(filteredRepos);

      // Se encontrou 5 ou mais repositórios com a linguagem C#, para a busca
      if (allRepos.length >= minRepos) {
        break;
      }

      // Caso contrário, avança para a próxima página
      page++;
    }

    // Se tiver pelo menos 5 repositórios, retorna
    if (allRepos.length >= minRepos) {
      res.json(allRepos.slice(0, minRepos));  // Retorna os 5 primeiros repositórios encontrados
    } else {
      res.status(404).json({ error: 'Não foi possível encontrar 5 repositórios com a linguagem C#.' });
    }
  } catch (error) {
    console.error('Erro ao buscar repositórios:', error);
    res.status(500).json({ error: 'Erro ao buscar os dados do GitHub' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`API intermediária rodando na porta ${port}`);
});
