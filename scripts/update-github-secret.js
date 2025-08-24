#!/usr/bin/env node
// Script para atualizar o secret GITHUB_TOKEN no repositório via GitHub CLI

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lê o .env na raiz
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Arquivo .env não encontrado na raiz do projeto.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/^REPO_GH_TOKEN=(.*)$/m);
if (!match || !match[1]) {
  console.error('REPO_GH_TOKEN não encontrado no .env.');
  process.exit(1);
}
const token = match[1].trim();
if (!token) {
  console.error('REPO_GH_TOKEN está vazio no .env.');
  process.exit(1);
}

// Atualiza o secret no repositório usando GitHub CLI
// Lê owner e repo do .env
const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;
if (!owner || !repo) {
  console.error('GITHUB_REPO_OWNER ou GITHUB_REPO_NAME não definidos no .env.');
  process.exit(1);
}

// Exibe para debug
// console.log('Owner:', owner, 'Repo:', repo);
const SECRET_NAME = 'REPO_GH_TOKEN';
console.log(`Atualizando secret ${SECRET_NAME} no repositório ${owner}/${repo}...`);
try {
  execSync(`gh secret set ${SECRET_NAME} -b"${token}" -R ${owner}/${repo}`);
  console.log('Secret atualizado com sucesso!');
} catch (e) {
  console.error('Erro ao atualizar o secret:', e.message);
  process.exit(1);
}
