# 🚀 Flugo - Desafio Frontend (React & Firebase)

Este é o repositório referente ao desafio técnico para a vaga de Desenvolvedor(a) React. A aplicação consiste em um sistema de cadastro de funcionários com um formulário multi-step e listagem dinâmica de colaboradores.

## 🛠️ Tecnologias e Decisões de Arquitetura

Para garantir um código limpo (Clean Code), escalável e de fácil manutenção, optei por utilizar as seguintes tecnologias:

* **Vite + ReactJS + TypeScript:** Base do projeto, garantindo tipagem estática, segurança no desenvolvimento e um build extremamente rápido.
* **Material UI (MUI):** Utilizado para a criação da interface visual seguindo o conceito de Pixel Perfect em relação ao Figma. O Tema foi customizado para refletir a identidade visual da Flugo.
* **React Hook Form + Zod:** Utilizados em conjunto no formulário multi-step. Essa abordagem evita o excesso de re-renderizações (comparado a múltiplos `useStates`) e centraliza a lógica de validação de todos os "steps" em um único Schema robusto.
* **Firebase (Firestore):** Banco de dados NoSQL utilizado para a persistência dos dados. A comunicação com o Firebase foi isolada em uma camada de serviço (Repository Pattern) na pasta `/services`, evitando que a lógica de negócio se misture com os componentes de UI.
* **React Router Dom:** Gerenciamento das rotas da aplicação, utilizando um `<Layout />` base para evitar a repetição da Sidebar em múltiplas telas.

## ⚙️ Como rodar o projeto localmente

Siga o passo a passo abaixo para executar a aplicação na sua máquina:

**1. Clone o repositório**
\`\`\`bash
git clone https://github.com/SEU_USUARIO/flugo-challenge.git
\`\`\`

**2. Acesse a pasta do projeto**
\`\`\`bash
cd flugo-challenge
\`\`\`

**3. Instale as dependências**
\`\`\`bash
npm install
\`\`\`

**4. Execute o projeto em modo de desenvolvimento**
\`\`\`bash
npm run dev
\`\`\`

**5. Acesse no navegador**
Abra o link \`http://localhost:5173\` (ou a porta informada no terminal).

---
Desenvolvido por Gabriel.
