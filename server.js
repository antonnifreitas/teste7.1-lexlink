const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Caminhos dos arquivos de dados
const EMPRESAS_FILE = path.join(__dirname, 'data', 'empresas.json');
const PARCEIROS_FILE = path.join(__dirname, 'data', 'parceiros.json');
const INFO_PARCEIRO_FILE = path.join(__dirname, 'data', 'info-login-parceiro.json');
const INFO_EMPRESA_FILE = path.join(__dirname, 'data', 'info-login-empresa.json');
const MENSAGEM_EMPRESA_PARA_ADMIN_FILE = path.join(__dirname, 'data', 'mensagens-empresa-para-admin.json');
const PERFIL_EMPRESA_FILE = path.join(__dirname, 'data', 'perfil-empresa.json');
const PERFIL_PARCEIRO_FILE = path.join(__dirname, 'data', 'perfil-parceiro.json');

// Função para salvar dados genéricos
function salvarDados(file, data) {
  const conteudoAtual = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  conteudoAtual.push(data);
  fs.writeFileSync(file, JSON.stringify(conteudoAtual, null, 2));
}

// Função para salvar mensagens simples
function salvarMensagem(file, mensagem) {
  fs.writeFileSync(file, JSON.stringify({ mensagem }, null, 2));
}

// Rota de cadastro (empresa/parceiro)
app.post('/api/cadastrar', (req, res) => {
  const { tipo, usuario, senha } = req.body;

  if (!usuario || !senha || !tipo) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios não preenchidos.' });
  }

  const novoCadastro = { usuario, senha };
  if (tipo === 'empresa') {
    salvarDados(EMPRESAS_FILE, novoCadastro);
    return res.json({ redirecionar: '/login-empresas.html' });
  } else if (tipo === 'parceiro') {
    salvarDados(PARCEIROS_FILE, novoCadastro);
    return res.json({ redirecionar: '/login-parceiro.html' });
  } else {
    return res.status(400).json({ mensagem: 'Tipo de cadastro inválido.' });
  }
});

// Buscar empresas e parceiros cadastrados
app.get('/api/empresas', (req, res) => {
  const empresas = fs.existsSync(EMPRESAS_FILE) ? JSON.parse(fs.readFileSync(EMPRESAS_FILE)) : [];
  res.json(empresas);
});

app.get('/api/parceiros', (req, res) => {
  const parceiros = fs.existsSync(PARCEIROS_FILE) ? JSON.parse(fs.readFileSync(PARCEIROS_FILE)) : [];
  res.json(parceiros);
});

// Buscar mensagens de login
app.get('/api/mensagem-parceiro', (req, res) => {
  const dados = fs.existsSync(INFO_PARCEIRO_FILE) ? JSON.parse(fs.readFileSync(INFO_PARCEIRO_FILE)) : { mensagem: '' };
  res.json(dados);
});

app.get('/api/mensagem-empresa', (req, res) => {
  const dados = fs.existsSync(INFO_EMPRESA_FILE) ? JSON.parse(fs.readFileSync(INFO_EMPRESA_FILE)) : { mensagem: '' };
  res.json(dados);
});

// Salvar mensagens de login
app.post('/api/mensagem-parceiro', (req, res) => {
  const { mensagem } = req.body;
  if (!mensagem) return res.status(400).json({ erro: 'Mensagem não enviada.' });
  salvarMensagem(INFO_PARCEIRO_FILE, mensagem);
  res.json({ sucesso: true });
});

app.post('/api/mensagem-empresa', (req, res) => {
  const { mensagem } = req.body;
  if (!mensagem) return res.status(400).json({ erro: 'Mensagem não enviada.' });
  salvarMensagem(INFO_EMPRESA_FILE, mensagem);
  res.json({ sucesso: true });
});

// Salvar mensagens da empresa para o admin
app.post('/api/mensagem-empresa-para-admin', (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem || typeof mensagem !== 'string') {
    return res.status(400).json({ sucesso: false, mensagem: 'Mensagem inválida.' });
  }

  const novaMensagem = {
    mensagem,
    data: new Date().toISOString()
  };

  const mensagensAtuais = fs.existsSync(MENSAGEM_EMPRESA_PARA_ADMIN_FILE)
    ? JSON.parse(fs.readFileSync(MENSAGEM_EMPRESA_PARA_ADMIN_FILE))
    : [];

  mensagensAtuais.push(novaMensagem);

  fs.writeFileSync(MENSAGEM_EMPRESA_PARA_ADMIN_FILE, JSON.stringify(mensagensAtuais, null, 2));

  res.json({ sucesso: true });
});

// Listar mensagens da empresa para o admin
app.get('/api/mensagens-empresa-para-admin', (req, res) => {
  const mensagens = fs.existsSync(MENSAGEM_EMPRESA_PARA_ADMIN_FILE)
    ? JSON.parse(fs.readFileSync(MENSAGEM_EMPRESA_PARA_ADMIN_FILE))
    : [];
  res.json(mensagens);
});

// Salvar perfil da empresa
app.post('/api/perfil-empresa', (req, res) => {
  const { usuario, nomeEmpresa, cnpj, email, telefone } = req.body;

  if (!usuario || !nomeEmpresa || !cnpj || !email || !telefone) {
    return res.status(400).json({ sucesso: false, mensagem: 'Todos os campos são obrigatórios.' });
  }

  const perfil = {
    usuario,
    nomeEmpresa,
    cnpj,
    email,
    telefone,
    atualizadoEm: new Date().toISOString()
  };

  const perfisAtuais = fs.existsSync(PERFIL_EMPRESA_FILE)
    ? JSON.parse(fs.readFileSync(PERFIL_EMPRESA_FILE))
    : [];

  const indexExistente = perfisAtuais.findIndex(p => p.usuario === usuario);
  if (indexExistente !== -1) {
    perfisAtuais[indexExistente] = perfil;
  } else {
    perfisAtuais.push(perfil);
  }

  fs.writeFileSync(PERFIL_EMPRESA_FILE, JSON.stringify(perfisAtuais, null, 2));
  res.json({ sucesso: true });
});

// Buscar perfis das empresas
app.get('/api/perfil-empresa', (req, res) => {
  const perfis = fs.existsSync(PERFIL_EMPRESA_FILE)
    ? JSON.parse(fs.readFileSync(PERFIL_EMPRESA_FILE))
    : [];
  res.json(perfis);
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
