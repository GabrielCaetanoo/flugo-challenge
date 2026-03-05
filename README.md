# <img src="./public/logo.png" width="28" style="vertical-align:middle"/> Flugo — Desafio Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

Sistema completo de gestão de capital humano (ERP) desenvolvido como solução para o Desafio Técnico Frontend da Flugo. A aplicação cobre o controle de colaboradores, departamentos e métricas financeiras estratégicas.

---

## ✅ Requisitos do Desafio

| Requisito | Status |
| :--- | :---: |
| Firebase Authentication com JWT | ✅ |
| Tela de login | ✅ |
| Rotas protegidas + redirect para 404 customizado | ✅ |
| Edição e exclusão individual de colaboradores | ✅ |
| Exclusão em massa com seleção por checkbox | ✅ |
| Filtros por nome, e-mail e departamento | ✅ |
| Formulário multi-step com campos profissionais | ✅ |
| Nível hierárquico, gestor responsável e salário base | ✅ |
| Listagem, cadastro, edição e exclusão de departamentos | ✅ |
| Transferência de colaboradores ao excluir departamento | ✅ |
| Interface sem protótipo — design por conta própria | ✅ |

---

## 🌟 Diferenciais Implementados

- 📊 **Dashboard Estratégico** — Total de colaboradores, folha de pagamento e média salarial calculados em tempo real, respondendo aos filtros ativos da tabela.
- 🛡️ **Integridade de Dados** — Exclusão de departamentos bloqueada quando há membros ativos; o sistema exige a transferência da equipe antes de permitir a remoção.
- 🔒 **Toggle de Privacidade** — Valores financeiros sensíveis podem ser ocultados com um clique diretamente no dashboard.
- 👤 **Perfil Dinâmico** — Menu do administrador com avatar gerado via DiceBear integrado ao Firebase Auth, com logout centralizado.
- 📝 **Validação em Tempo Real** — Formulários com Zod + React Hook Form, incluindo verificação de e-mail duplicado diretamente no Firebase antes de avançar o step.
- 🎨 **Design System Consistente** — Tokens de cor, estilos de input e padrões de componente unificados em todo o projeto.

---

## 🛠️ Stack e Decisões Técnicas

| Tecnologia | Decisão |
| :--- | :--- |
| **Vite + React 18** | Base de alto desempenho com JSX Transform moderno (sem `import React` obrigatório) |
| **TypeScript** | Tipagem estrita em todos os services, hooks e componentes |
| **Material UI v5** | Sistema de design com customização via `sx` prop e tema global centralizado |
| **Firebase Firestore** | Persistência NoSQL com operações em batch para exclusões em massa |
| **Firebase Auth** | Autenticação JWT com contexto global via `AuthProvider` |
| **Zod + React Hook Form** | Validação de schema e gerenciamento de formulários multi-step |
| **React Router v6** | Rotas protegidas com `ProtectedRoute` e redirect automático para 404 |

### 🛡️ Segurança e LGPD

Por se tratar de um sistema corporativo (ERP), a função de autorregistro foi omitida intencionalmente. O provisionamento de contas de administrador é restrito para garantir a proteção de dados financeiros sensíveis, em conformidade com os princípios da LGPD.

---

## ⚙️ Como rodar o projeto localmente

**1. Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/flugo-challenge.git
cd flugo-challenge
```

**2. Instale as dependências**
```bash
npm install
```

**3. Execute o projeto**
```bash
npm run dev
```

> O projeto usa as credenciais do Firebase diretamente no código por se tratar de um desafio técnico avaliativo. Em produção, as credenciais seriam movidas para variáveis de ambiente (`.env`).

---

## 🗂️ Estrutura do Projeto

```
src/
├── components/
│   └── layout/          # Layout principal, Sidebar, ProtectedRoute
├── contexts/            # AuthContext e AuthProvider
├── hooks/               # useAuth
├── pages/               # ColaboradoresList, NovoColaborador, EditarColaborador
│   │                      DepartamentosList, NovoDepartamento, EditarDepartamento
│   │                      Login, NotFound
├── services/            # Firebase, employeeService, departmentService
└── theme/               # Tema global MUI
```

---

## 👨‍💻 Autor

**Gabriel Caetano da Costa**

📍 Maringá — PR &nbsp;|&nbsp; 🎓 Engenharia de Software — Unicesumar &nbsp;|&nbsp; 💼 Assistente Financeiro em Construtora

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/https://www.linkedin.com/in/gabriel-caetano-7a454b149/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/GabrielCaetanoo)