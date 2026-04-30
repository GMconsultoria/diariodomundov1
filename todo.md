# Diário do Mundo - TODO

## Banco de Dados
- [x] Criar schema de posts (notícias)
- [x] Criar schema de users (usuários com role admin/user)
- [x] Executar migrations no banco de dados

## API (Backend)
- [x] Criar procedures tRPC para CRUD de notícias
- [x] Criar procedure para busca de notícias
- [x] Criar procedure para listar notícias por categoria
- [x] Criar procedure para autenticação e autorização
- [x] Criar procedure para upload de imagens
- [x] Criar procedure para estatísticas (dashboard admin)

## Frontend - Estrutura
- [x] Definir paleta de cores e tipografia (estilo CNN Brasil)
- [x] Criar componentes base (Header, Footer, Navigation)
- [x] Criar layout responsivo

## Frontend - Páginas Públicas
- [x] Página inicial com notícias em destaque
- [x] Página de artigo individual (/noticias/[slug])
- [x] Página de busca com resultados dinâmicos
- [x] Página de categoria com notícias filtradas
- [x] Página 404 e tratamento de erros

## Frontend - Painel Admin
- [x] Página de login admin (via Manus OAuth)
- [x] Dashboard admin com estatísticas
- [x] Página de listagem de notícias (admin)
- [x] Página de criar nova notícia
- [x] Página de editar notícia
- [x] Página de deletar notícia
- [x] Proteção de rotas (somente admin acessa)

## Funcionalidades
- [x] Upload de imagem de capa (armazenamento em nuvem)
- [x] Editor de texto rico para conteúdo
- [x] Geração automática de slug
- [x] Busca funcional por título e conteúdo
- [x] Filtro por categoria
- [x] Compartilhamento em redes sociais
- [x] Notícias relacionadas na página de artigo

## Testes
- [x] Testes unitários para procedures críticas
- [x] Testes de autenticação e autorização

## Deploy e Ajustes Finais
- [x] SEO (meta tags dinâmicas, Open Graph)
- [x] Responsividade (mobile, tablet, desktop)
- [x] Performance e otimizações
- [x] Checkpoint final


## Redesign - Alterações Solicitadas
- [x] Atualizar categorias para 5 (Política, Economia, Investimentos, Ciência e Tecnologia, Curiosidade)
- [x] Redesenhar homepage com layout hero + cards laterais
- [x] Criar notícias de exemplo para teste
- [x] Validar novo layout em desktop, tablet e mobile


## Ajustes de Layout - Segunda Iteração
- [x] Redesenhar homepage com espaços laterais para monetização
- [x] Manter hero grande à esquerda com imagem de fundo
- [x] Manter cards de 3 categorias à direita (Economia, Investimentos, Ciência e Tecnologia)
- [x] Adicionar mais notícias de teste
- [x] Validar novo layout


## Ajustes de Header - Terceira Iteração
- [x] Atualizar design do header conforme imagem
- [x] Logo "DIÁRIO DO MUNDO" com "MUNDO" em vermelho
- [x] Menu de categorias em branco
- [x] Barra de busca com ícone azul
- [x] Fundo preto no header
- [x] Testar novo header


## Bug Fix - Abas de Categorias
- [x] Investigar problema com abas Investimentos, Ciência e Tecnologia, Curiosidade
- [x] Corrigir roteamento ou links das categorias
- [x] Testar todas as 5 categorias

## Ajustes de Cores
- [x] Alterar todas as cores rosa para vermelho (#DC143C)
- [x] Atualizar accent color em index.css
- [x] Atualizar dark theme colors
- [x] Testar cores no site


## Melhorias na Homepage e Artigos
- [x] Adicionar seção de anúncio após notícias principais
- [x] Adicionar notícias recentes por tópico na homepage
- [x] Redesenhar página de artigo com título grande (SEO)
- [x] Adicionar subtítulo, autor e data na página de artigo
- [x] Adicionar imagem destacada na página de artigo
- [x] Centralizar conteúdo com espaços para anúncios nas laterais
- [x] Adicionar espaços para anúncios no meio do conteúdo
- [x] Adicionar seção de notícias relacionadas
- [x] Adicionar botão de compartilhamento em cada notícia


## Otimizações e Correções
- [x] Tornar categorias clicáveis em todas as notícias (homepage, artigo, busca, categorias)
- [x] Otimizar componentes para melhor performance
- [x] Melhorar responsividade em mobile
- [x] Refatorar código para arquitetura mais leve
- [x] Testar geral e identificar bugs
- [x] Corrigir bugs encontrados (links aninhados, erro TypeScript)


## Auditoria e Correções Completas - Fase 2

### 1. Padronização de Categorias
- [x] Auditar todas as referências de categorias no código
- [x] Remover categorias antigas (Mundo, Tecnologia, Esportes, Entretenimento)
- [x] Garantir apenas 5 categorias válidas em todo o sistema
- [x] Atualizar validações em backend e frontend
- [x] Atualizar footer com links válidos
- [x] Atualizar testes com categorias corretas

### 2. Formulários de Criação e Edição
- [x] Remover valores iniciais inválidos para categoria
- [x] Definir categoria inicial válida ou exigir seleção
- [x] Validar no frontend antes de enviar
- [x] Validar no backend ao receber
- [x] Testar criação com categorias inválidas (deve falhar)
- [x] Testar edição com preenchimento automático
- [x] Implementar tratamento de loading e erro

### 3. Navegação e Links
- [x] Corrigir links do footer
- [x] Remover links placeholder com #
- [x] Criar páginas mínimas: Sobre Nós, Privacidade, Termos, Contato
- [x] Testar navegação em todas as páginas
- [x] Garantir links válidos em todo o site

### 4. Links Aninhados
- [x] Remover Links dentro de Links em Home.tsx
- [x] Remover Links dentro de Links em Search.tsx
- [x] Remover Links dentro de Links em Category.tsx
- [x] Remover Links dentro de Links em NewsCard.tsx
- [x] Testar clique em matéria e categoria separadamente

### 5. Segurança - XSS
- [x] Auditar uso de dangerouslySetInnerHTML
- [x] Implementar sanitização com DOMPurify
- [x] Validar conteúdo no backend
- [x] Testar com conteúdo malicioso
- [x] Manter compatibilidade com formatação jornalística

### 6. Upload de Imagem
- [x] Detectar MIME type real do arquivo
- [x] Aceitar PNG, JPEG, WebP e formatos suportados
- [x] Validar extensão e tipo MIME
- [x] Salvar com content-type correto
- [x] Testar com diferentes formatos
- [x] Tratar erros de upload

### 7. Testes
- [x] Remover categorias antigas dos testes
- [x] Adicionar cobertura para criação com categorias inválidas
- [x] Adicionar cobertura para edição
- [x] Adicionar cobertura para filtro por categoria
- [x] Adicionar cobertura para upload
- [x] Testar XSS prevention
- [x] Garantir todos os testes passam

### 8. Navegação SPA
- [x] Substituir window.location.href por router navigation
- [x] Testar navegação sem reload
- [x] Verificar performance
- [x] Testar back button

### 9. Revisão Geral
- [x] Consistência de tipos
- [x] Consistência de nomes
- [x] Consistência frontend/backend
- [x] Remover strings hardcoded antigas
- [x] Remover rotas órfãs
- [x] Remover componentes quebrados
