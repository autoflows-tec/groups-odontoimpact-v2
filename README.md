# Odontoimpact - Painel de Grupos de Clientes

Sistema de monitoramento e gerenciamento de grupos de WhatsApp para clientes da Odontoimpact.

## 📋 Visão Geral

Este projeto é uma aplicação React + TypeScript que permite monitorar o status de grupos de WhatsApp de clientes, com funcionalidades de configuração e edição inline para gerenciamento de squads, heads e gestores.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Estado**: React Hooks + Context
- **Build**: Vite
- **Lint**: ESLint + TypeScript ESLint

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `Lista_de_Grupos`
```sql
- id: bigint (PK)
- grupo: text (nome identificador)
- nome_grupo: text (nome amigável)
- squad: text (squad responsável)
- head: text (líder responsável)
- gestor: text (gestor responsável)
- status: text (status atual)
- resumo: text (resumo da situação)
- timestamp: text
- ultima_atualizacao: text
```

#### `Lista_de_Mensagens`
```sql
- id: bigint (PK)
- grupoJid: text (FK para grupos)
- remoteJid: text
- nome: text (nome do remetente)
- message: text (conteúdo da mensagem)
- timestamp: text
```

#### Tabelas de Configuração
- **`Squads`**: Gerenciamento de squads
- **`Heads`**: Gerenciamento de heads/líderes
- **`Gestores`**: Gerenciamento de gestores

Todas com estrutura:
```sql
- id: bigint (PK)
- nome: text (nome único)
- ativo: boolean (soft delete)
- created_at: timestamp
- updated_at: timestamp
```

## 🎯 Funcionalidades Implementadas

### 1. **Painel Principal de Grupos**
- ✅ Visualização de todos os grupos em tabela responsiva
- ✅ Sistema de paginação (10 itens por página)
- ✅ Busca por nome de grupo
- ✅ Resumo de status (Estável, Alerta, Crítico)
- ✅ Atualização em tempo real via Supabase Realtime
- ✅ Indicadores visuais de status por cores

### 2. **Sistema de Configurações**
- ✅ Menu dropdown no header para acessar configurações
- ✅ Gerenciamento completo de Squads, Heads e Gestores
- ✅ Operações CRUD com confirmação de exclusão
- ✅ Validação de nomes únicos e comprimento
- ✅ Toast notifications para feedback
- ✅ Loading states em todas as operações

### 3. **Edição Inline na Tabela**
- ✅ Colunas Squad, Head e Gestor editáveis por clique
- ✅ Select dropdowns com opções dos cadastros
- ✅ Updates otimistas na UI
- ✅ Reversão automática em caso de erro
- ✅ Suporte completo a teclado (Enter/Escape)
- ✅ Loading indicators por célula

### 4. **UX/UI Profissional**
- ✅ Dark mode completo
- ✅ Design responsivo para mobile/desktop
- ✅ Animações e transições suaves
- ✅ Feedback visual consistente
- ✅ Error handling robusto
- ✅ Tema corporativo Odontoimpact

## 📁 Estrutura de Arquivos Principais

```
src/
├── components/
│   ├── ui/                          # Componentes base shadcn/ui
│   ├── ConfigurationDialog.tsx      # Modal de gerenciamento
│   ├── ConfigurationMenu.tsx        # Menu dropdown configurações
│   ├── ConfirmationDialog.tsx       # Modal de confirmação
│   ├── EditableSelectCell.tsx       # Célula editável inline
│   ├── GroupsHeader.tsx             # Cabeçalho principal
│   ├── GroupsPanel.tsx              # Container principal
│   ├── GroupsTable.tsx              # Tabela de grupos
│   └── ...
├── hooks/
│   ├── useGroups.ts                 # Hook principal dos grupos
│   ├── useSquads.ts                 # Hook de squads
│   ├── useHeads.ts                  # Hook de heads
│   ├── useGestores.ts               # Hook de gestores
│   └── ...
├── integrations/
│   └── supabase/
│       ├── client.ts                # Cliente Supabase
│       └── types.ts                 # Tipos TypeScript gerados
└── utils/
    └── groupUtils.ts                # Utilitários dos grupos
```

## 🔧 Como Executar

### Pré-requisitos
- Node.js 18+ e npm
- Conta Supabase configurada

### Instalação
```bash
# Clone o repositório
git clone https://github.com/autoflows-tec/groups-odontoimpact-v2.git

# Entre no diretório
cd groups-odontoimpact-v2

# Copie o arquivo de ambiente
cp .env.example .env

# Configure as variáveis de ambiente no arquivo .env com suas credenciais do Supabase

# Instale dependências
npm install

# Execute em desenvolvimento
npm run dev
```

### Comandos Disponíveis
```bash
npm run dev        # Desenvolvimento com hot reload
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Verificar código com ESLint
```

## 🎨 Padrões de Design

### Cores Principais
- **Odontoimpact Primary**: `#142c6d` - Cor primária da marca
- **Odontoimpact Secondary**: `#6b8bfb` - Cor secundária
- **Odontoimpact Light**: `#e8e8e8` - Cor de fundo

### Componentes Reutilizáveis
- **EditableSelectCell**: Célula editável com select
- **ConfirmationDialog**: Modal de confirmação padrão
- **ConfigurationDialog**: Modal de gerenciamento CRUD

## 🔐 Configuração do Supabase

### Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Migrações Aplicadas
1. **Criação das tabelas principais** (Lista_de_Grupos, Lista_de_Mensagens)
2. **Adição das colunas squad, head, gestor** na Lista_de_Grupos
3. **Criação das tabelas de configuração** (Squads, Heads, Gestores)
4. **Índices e constraints** para performance e integridade

## 📊 Status do Projeto

### ✅ Funcionalidades Completas
- Sistema de visualização de grupos
- Configurações de squads, heads e gestores
- Edição inline na tabela
- Sistema de notificações toast
- Dark mode
- Responsividade

### 🔄 Funcionalidades Futuras Planejadas
- Filtros avançados por status
- Exportação de relatórios
- Histórico de alterações
- Dashboard analytics
- Integração com APIs WhatsApp

## 🚀 Deploy

### Vercel / Netlify
```bash
# Build da aplicação
npm run build

# Configure as variáveis de ambiente na plataforma:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY

# Deploy na plataforma de escolha (Vercel, Netlify, etc.)
```

### Deploy Manual
```bash
# Build da aplicação
npm run build

# O diretório dist/ conterá os arquivos estáticos para deploy
```

## 👥 Equipe

Desenvolvido para **Odontoimpact** com foco em monitoramento eficiente de grupos de clientes WhatsApp.

---

**Última atualização**: Outubro 2025
**Versão**: 1.0.0

## 📝 Licença

Este projeto é proprietário e desenvolvido para uso exclusivo da Odontoimpact.