# Guia de Alteração da Identidade Visual - Shark Aceleradora Grupos

Este documento fornece um passo a passo completo para alterar a identidade visual do sistema de gerenciamento de grupos da Shark Aceleradora.

## 📁 Estrutura de Arquivos da Identidade Visual

### Arquivos Principais de Estilo
- `src/index.css` - Definições globais de cores, variáveis CSS e temas
- `tailwind.config.ts` - Configurações do Tailwind CSS com cores da marca
- `src/App.css` - Estilos específicos do componente principal
- `components.json` - Configurações do shadcn/ui

### Componentes de Identidade Visual  
- `src/components/SharkLogo.tsx` - Componente do logotipo
- `src/components/GroupsHeader.tsx` - Cabeçalho principal com branding
- Componentes UI em `src/components/ui/` - Botões, cards, etc.

### Assets (Imagens e Logos)
- `public/shark-logo.jpg` - Logo principal da Shark Aceleradora
- `public/favicon.ico` - Favicon do site
- `public/placeholder.svg` - Imagem placeholder

## 🎨 Sistema de Cores Atual

### Cores Primárias da Shark Aceleradora (definidas em `src/index.css:46-51`)
```css
--shark-orange: #2463F5;      /* Laranja principal da marca */
--shark-light-gray: #D9D9D9;  /* Cinza claro */
--shark-dark: #222222;        /* Preto/cinza escuro */
--shark-white: #FFFFFF;       /* Branco */
```

### Cores Extendidas no Tailwind (`tailwind.config.ts:65-79`)
```javascript
'shark-orange': '#2463F5',
'shark-gray': '#6B7280',        /* Cinza médio para melhor legibilidade */
'shark-dark': '#111827',        /* Preto mais legível */
'shark-white': '#FFFFFF',
'shark-dark-bg': '#1F2937',     /* Fundo para modo escuro */
'shark-dark-card': '#374151',   /* Cards no modo escuro */
'shark-light-gray': '#D9D9D9',  /* Compatibilidade */
```

## 📋 Passo a Passo para Alterar a Identidade Visual

### 1. **Alteração de Cores**

#### 1.1 Cores Primárias (src/index.css:46-51)
```css
/* Substitua os valores atuais pelas novas cores da marca */
--shark-orange: #SUA_COR_PRIMARIA;
--shark-light-gray: #SUA_COR_CINZA_CLARO;
--shark-dark: #SUA_COR_ESCURA;
--shark-white: #SUA_COR_BRANCA;
```

#### 1.2 Cores no Tailwind (tailwind.config.ts:65-79)
```javascript
// Atualize as cores para corresponder às novas cores da marca
'shark-orange': '#SUA_COR_PRIMARIA',
'shark-gray': '#SUA_COR_CINZA_MEDIO',
'shark-dark': '#SUA_COR_ESCURA',
'shark-white': '#SUA_COR_BRANCA',
'shark-dark-bg': '#SUA_COR_FUNDO_ESCURO',
'shark-dark-card': '#SUA_COR_CARD_ESCURO',
```

#### 1.3 Gradientes (tailwind.config.ts:82-85)
```javascript
// Atualize o gradiente principal
'shark-gradient': 'linear-gradient(90deg, #SUA_COR_PRIMARIA 0%, #SUA_COR_SECUNDARIA 100%)',
```

### 2. **Alteração do Logotipo**

#### 2.1 Substituir arquivo de imagem
- Substitua o arquivo `public/shark-logo.jpg` pelo novo logo
- Mantenha o mesmo nome do arquivo ou atualize a referência em `src/components/SharkLogo.tsx:9`
- Formato recomendado: PNG com fundo transparente
- Dimensões recomendadas: 200x200px (ou proporção adequada)

#### 2.2 Atualizar componente do logo (se necessário)
```tsx
// Em src/components/SharkLogo.tsx:8-12
<img 
  src="/seu-novo-logo.png"  // Se alterou o nome do arquivo
  alt="Sua Nova Marca"      // Atualize o alt text
  className="w-full h-full object-contain"
/>
```

### 3. **Alteração de Textos da Marca**

#### 3.1 Nome da empresa no cabeçalho (src/components/GroupsHeader.tsx:38-43)
```tsx
<h1 className="text-3xl font-poppins font-semibold text-e3-dark dark:text-white">
  SUA NOVA MARCA  {/* Altere aqui */}
</h1>
<p className="text-e3-gray dark:text-gray-300 font-inter font-medium">
  Seu novo subtítulo  {/* Altere aqui */}
</p>
```

#### 3.2 Favicon
- Substitua `public/favicon.ico` pelo novo favicon
- Gere diferentes tamanhos: 16x16, 32x32, 48x48

### 4. **Fontes (Opcional)**

#### 4.1 Alterar fontes (src/index.css:1)
```css
/* Substitua pelas fontes da sua marca */
@import url('https://fonts.googleapis.com/css2?family=SuaFontePrincipal:wght@400;500;600;700&family=SuaFonteSecundaria:wght@300;400;500;600&display=swap');
```

#### 4.2 Atualizar configuração no Tailwind (tailwind.config.ts:86-89)
```javascript
fontFamily: {
  'principal': ['SuaFontePrincipal', 'sans-serif'],
  'secundaria': ['SuaFonteSecundaria', 'sans-serif'],
},
```

#### 4.3 Aplicar fontes (src/index.css:103-105)
```css
h1, h2, h3, h4, h5, h6 {
  @apply font-principal;  /* Use sua fonte principal */
}
```

### 5. **Modo Escuro (Dark Theme)**

#### 5.1 Cores para modo escuro (src/index.css:60-93)
Atualize as variáveis CSS dentro da classe `.dark` para refletir suas cores no modo escuro:

```css
.dark {
  --background: /* Sua cor de fundo escuro */;
  --foreground: /* Sua cor de texto escuro */;
  /* ... outras variáveis */
}
```

### 6. **Componentes UI Personalizados**

#### 6.1 Botões principais
Os botões já usam as classes `bg-e3-orange` e `hover:bg-e3-orange/90`, então as alterações de cor se aplicarão automaticamente.

#### 6.2 Cards e componentes
Procure por classes que usam as cores da Shark Aceleradora em:
- `src/components/GroupsTable.tsx`
- `src/components/GroupsStatusSummary.tsx`
- Outros componentes na pasta `src/components/`

## 🔧 Comandos para Aplicar as Mudanças

### 1. Após fazer as alterações, execute:
```bash
npm run build  # ou yarn build
```

### 2. Para desenvolvimento:
```bash
npm run dev     # ou yarn dev
```

### 3. Para verificar se há erros de tipo:
```bash
npm run type-check  # se disponível
```

## 📝 Checklist de Verificação

- [ ] Cores primárias alteradas em `src/index.css`
- [ ] Cores atualizadas em `tailwind.config.ts`
- [ ] Logo substituído em `public/shark-logo.jpg`
- [ ] Texto da marca atualizado em `GroupsHeader.tsx`
- [ ] Favicon substituído em `public/favicon.ico`
- [ ] Fontes alteradas (se necessário)
- [ ] Modo escuro testado e funcionando
- [ ] Build executado sem erros
- [ ] Interface testada visualmente
- [ ] Responsividade verificada

## 🎯 Localizações Específicas de Elementos Visuais

### Cabeçalho Principal
- **Arquivo**: `src/components/GroupsHeader.tsx:32-95`
- **Elementos**: Logo, título, botões, tema escuro

### Status de Grupos
- **Arquivo**: `src/components/GroupsHeader.tsx:48-62`
- **Elementos**: Indicadores de status (verde, amarelo, vermelho)

### Botão de Atualização
- **Arquivo**: `src/components/GroupsHeader.tsx:77-84`
- **Classe**: `bg-e3-orange hover:bg-e3-orange/90`

### Tabelas de Dados
- **Arquivos**: `src/components/GroupsTable.tsx`, `src/components/GroupsStatusSummary.tsx`
- **Elementos**: Headers, células, bordas

## 🚨 Cuidados Importantes

1. **Contraste**: Garanta que as novas cores atendam aos padrões de acessibilidade (WCAG)
2. **Consistência**: Mantenha a consistência entre modo claro e escuro
3. **Responsividade**: Teste em diferentes tamanhos de tela
4. **Performance**: Otimize imagens (PNG, WebP) para carregamento rápido
5. **Backup**: Faça backup dos arquivos originais antes das alterações

## 📱 Teste em Diferentes Dispositivos

- Desktop (1920x1080+)
- Tablet (768px-1024px)
- Mobile (320px-767px)
- Modo claro e escuro
- Diferentes navegadores (Chrome, Firefox, Safari)

---

**Nota**: Este guia cobre todos os aspectos da identidade visual do sistema. Para dúvidas específicas, consulte os arquivos mencionados ou a documentação do Tailwind CSS e shadcn/ui.