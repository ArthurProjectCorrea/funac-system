#!/usr/bin/env tsx

/**
 * Changeset Report Generator
 * 
 * Analisa o histórico de commits desde o último merge para main
 * e gera um relatório de versionamento seguindo Conventional Commits
 * 
 * Uso: npx tsx scripts/changeset-report.ts
 * ou: pnpm changeset-report
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Types
interface CommitInfo {
  hash: string;
  type: string;
  scope?: string;
  description: string;
  breakingChange: boolean;
}

interface GroupReport {
  releaseType: 'major' | 'minor' | 'patch' | 'none';
  commits: Array<{
    hash: string;
    type: string;
    description: string;
  }>;
}

interface ChangesetReport {
  summary: string;
  [group: string]: string | GroupReport;
}

// Conventional Commits que afetam versionamento
const VERSION_AFFECTING_TYPES = new Set(['feat', 'fix', 'perf', 'refactor']);
const NON_VERSION_TYPES = new Set(['docs', 'style', 'test', 'chore', 'ci', 'build']);

// Grupos/pacotes do monorepo
const KNOWN_SCOPES = new Set(['api', 'web', 'docs', 'ui', 'eslint-config', 'tailwind-config', 'typescript-config']);

function execGit(command: string): string {
  try {
    return execSync(`git ${command}`, { 
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    console.error(`❌ Erro ao executar git ${command}:`, error);
    process.exit(1);
  }
}

function getLastMergeBase(): string {
  console.log('🔍 Buscando último merge base com main...');
  
  // Buscar main remoto
  try {
    execGit('fetch origin main');
  } catch {
    console.warn('⚠️ Não foi possível fazer fetch de origin/main, usando main local');
  }
  
  // Encontrar merge base
  let mergeBase = '';
  try {
    mergeBase = execGit('merge-base HEAD origin/main');
  } catch {
    try {
      mergeBase = execGit('merge-base HEAD main');
    } catch {
      console.error('❌ Não foi possível encontrar merge base com main');
      process.exit(1);
    }
  }
  
  console.log(`📍 Merge base encontrado: ${mergeBase}`);
  return mergeBase;
}

function getCommitsSinceMergeBase(mergeBase: string): CommitInfo[] {
  console.log('📜 Coletando commits desde o merge base...');
  
  const commitsRaw = execGit(`log ${mergeBase}..HEAD --pretty=format:"%H|%s"`);
  
  if (!commitsRaw.trim()) {
    console.log('ℹ️ Nenhum commit encontrado desde o último merge');
    return [];
  }
  
  const commitLines = commitsRaw.split('\n').filter(Boolean);
  const commits: CommitInfo[] = [];
  
  for (const line of commitLines) {
    const [hash, message] = line.split('|', 2);
    const commit = parseConventionalCommit(hash, message);
    if (commit) {
      commits.push(commit);
    }
  }
  
  console.log(`📊 ${commits.length} commits analisados`);
  return commits;
}

function parseConventionalCommit(hash: string, message: string): CommitInfo | null {
  // Regex para Conventional Commits: type(scope): description
  const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?: (.+)$/;
  const match = message.match(conventionalRegex);
  
  if (!match) {
    // Se não segue o padrão, classificar como chore
    return {
      hash: hash.substring(0, 7),
      type: 'chore',
      description: message,
      breakingChange: false
    };
  }
  
  const [, type, scope, description] = match;
  
  // Verificar breaking change
  const breakingChange = message.includes('BREAKING CHANGE') || 
                        message.includes('!:') ||
                        type.endsWith('!');
  
  return {
    hash: hash.substring(0, 7),
    type: type.replace('!', ''), // Remove ! do tipo se houver
    scope: scope || undefined,
    description,
    breakingChange
  };
}

function groupCommitsByScope(commits: CommitInfo[]): Map<string, CommitInfo[]> {
  const groups = new Map<string, CommitInfo[]>();
  
  for (const commit of commits) {
    let group = 'root';
    
    if (commit.scope && KNOWN_SCOPES.has(commit.scope)) {
      group = commit.scope;
    } else if (commit.scope) {
      // Tentar mapear scopes customizados para grupos conhecidos
      if (commit.scope.includes('api')) group = 'api';
      else if (commit.scope.includes('web')) group = 'web';
      else if (commit.scope.includes('docs')) group = 'docs';
      else if (commit.scope.includes('ui')) group = 'ui';
    }
    
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(commit);
  }
  
  return groups;
}

function calculateReleaseType(commits: CommitInfo[]): 'major' | 'minor' | 'patch' | 'none' {
  let hasBreaking = false;
  let hasFeat = false;
  let hasPatch = false;
  
  for (const commit of commits) {
    if (commit.breakingChange) {
      hasBreaking = true;
      break; // Breaking change é prioridade máxima
    }
    
    if (commit.type === 'feat') {
      hasFeat = true;
    } else if (['fix', 'perf'].includes(commit.type)) {
      hasPatch = true;
    } else if (commit.type === 'refactor' && !commit.breakingChange) {
      hasPatch = true;
    }
  }
  
  if (hasBreaking) return 'major';
  if (hasFeat) return 'minor';
  if (hasPatch) return 'patch';
  return 'none';
}

function generateSummary(groups: Map<string, CommitInfo[]>): string {
  const summaryParts: string[] = [];
  
  for (const [group, commits] of groups) {
    const versioningCommits = commits.filter(c => 
      VERSION_AFFECTING_TYPES.has(c.type) || c.breakingChange
    );
    
    if (versioningCommits.length === 0) continue;
    
    const releaseType = calculateReleaseType(versioningCommits);
    if (releaseType === 'none') continue;
    
    const featCount = versioningCommits.filter(c => c.type === 'feat').length;
    const fixCount = versioningCommits.filter(c => c.type === 'fix').length;
    const breakingCount = versioningCommits.filter(c => c.breakingChange).length;
    
    let groupSummary = '';
    
    if (breakingCount > 0) {
      groupSummary = `mudanças breaking em ${group}`;
    } else if (featCount > 0 && fixCount > 0) {
      groupSummary = `novas funcionalidades e correções em ${group}`;
    } else if (featCount > 0) {
      groupSummary = `novas funcionalidades em ${group}`;
    } else if (fixCount > 0) {
      groupSummary = `correções em ${group}`;
    } else {
      groupSummary = `melhorias em ${group}`;
    }
    
    summaryParts.push(groupSummary);
  }
  
  if (summaryParts.length === 0) {
    return 'Atualizações de documentação, testes e configurações';
  }
  
  if (summaryParts.length === 1) {
    return `Implementa ${summaryParts[0]}.`;
  }
  
  const lastPart = summaryParts.pop();
  return `Implementa ${summaryParts.join(', ')} e ${lastPart}.`;
}

function buildChangesetReport(commits: CommitInfo[]): ChangesetReport {
  const groups = groupCommitsByScope(commits);
  const report: ChangesetReport = {
    summary: generateSummary(groups)
  };
  
  for (const [group, groupCommits] of groups) {
    const releaseType = calculateReleaseType(groupCommits);
    
    const groupReport: GroupReport = {
      releaseType,
      commits: groupCommits.map(c => ({
        hash: c.hash,
        type: c.type,
        description: c.description
      }))
    };
    
    // Só incluir grupos que afetam versionamento ou root para referência
    if (releaseType !== 'none' || group === 'root') {
      report[group] = groupReport;
    }
  }
  
  return report;
}

function ensureTempDir(): string {
  const tempDir = join(process.cwd(), 'temp');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

function saveReport(report: ChangesetReport): string {
  const tempDir = ensureTempDir();
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  const filename = `changeset-${year}-${month}-${day}_${hour}-${minute}-${second}.json`;
  const filepath = join(tempDir, filename);
  
  writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');
  return filepath;
}

function printSummary(report: ChangesetReport, filepath: string) {
  console.log('\n✅ Relatório de Changeset Gerado');
  console.log('='.repeat(50));
  console.log(`📁 Arquivo: ${filepath}`);
  console.log(`📝 Resumo: ${report.summary}`);
  console.log('\n📊 Grupos com versionamento:');
  
  const groups = Object.entries(report).filter(([key]) => key !== 'summary');
  
  if (groups.length === 0) {
    console.log('   Nenhum grupo requer versionamento');
    return;
  }
  
  for (const [group, data] of groups) {
    if (typeof data === 'object' && 'releaseType' in data) {
      const releaseIcon = data.releaseType === 'major' ? '🚨' : 
                         data.releaseType === 'minor' ? '✨' : 
                         data.releaseType === 'patch' ? '🔧' : '📝';
      
      console.log(`   ${releaseIcon} ${group}: ${data.releaseType} (${data.commits.length} commits)`);
    }
  }
}

// Main execution
function main() {
  console.log('🔄 Iniciando geração de relatório de changeset...\n');
  
  try {
    // 1. Encontrar merge base
    const mergeBase = getLastMergeBase();
    
    // 2. Coletar commits
    const commits = getCommitsSinceMergeBase(mergeBase);
    
    if (commits.length === 0) {
      console.log('ℹ️ Nenhum commit para processar. Não há mudanças desde o último merge para main.');
      return;
    }
    
    // 3. Gerar relatório
    const report = buildChangesetReport(commits);
    
    // 4. Salvar arquivo
    const filepath = saveReport(report);
    
    // 5. Exibir resumo
    printSummary(report, filepath);
    
  } catch (error) {
    console.error('\n❌ Erro durante a geração do relatório:', error);
    process.exit(1);
  }
}

// Execute se chamado diretamente
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { main, buildChangesetReport, parseConventionalCommit };
