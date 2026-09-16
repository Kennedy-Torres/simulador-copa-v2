# 🏆 Bolão Copa do Mundo 2026

Um simulador interativo e responsivo para a Copa do Mundo de 2026, criado para que amigos possam palpitar nos resultados das partidas e competir em um ranking geral por pontos.

🔗 **Acesse o projeto online:** [Simulador Copa 2026](https://simulador-copamundo-2026.netlify.app/)

---

## 🏗️ Arquitetura & Conceito Full-stack

Embora a interface utilize tecnologia nativa sem frameworks (Vanilla JS), a aplicação adota uma arquitetura *full-stack serverless* completa:

* **Front-end:** Interface reativa em HTML5, CSS3 e JavaScript (ES6+) com consumo assíncrono de APIs e manipulação dinâmica do DOM.
* **Back-end Serverless:** Automação de rotinas via *Supabase Edge Functions* para sincronização automática dos resultados via API externa sem necessidade de um servidor dedicado.
* **Banco de Dados & Segurança:** Persistência no PostgreSQL (Supabase) configurado com políticas de *Row Level Security (RLS)* para controle granular de acesso e autenticação segura de usuários.

---

## 📌 Funcionalidades

* **Autenticação de Usuários:** Login e registro seguros via Supabase Auth.
* **Dashboard de Palpites:** Gestão de palpites por participante agrupados por fase e data da partida.
* **Sincronização de Placares:** Consumo automatizado da API [FOOTBALL-DATA.ORG](https://www.football-data.org/) para atualização dos placares oficiais.
* **Ranking em Tempo Real:** Cálculo automático das pontuações e reordenação da classificação.
* **Atualização de Placares Reais:** Integração com a API do FOOTBALL-DATA.ORG e funções Serverless (Supabase Functions) para buscar e atualizar os resultados oficiais automaticamente.
* **Painel Administrativo:** Área restrita para ajustes e gestão manual de partidas.

---

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3 (Flexbox/Grid), JavaScript Vanilla (ES6+, Async/Await)
* **Back-end & Banco de Dados:** Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
* **API Esportiva:** [FOOTBALL-DATA.ORG](https://www.football-data.org/) para dados em tempo real.
* **Hospedagem & CI/CD:** Netlify.

---

## 📂 Estrutura do Projeto

Abaixo está a organização dos principais arquivos do repositório:

* `index.html`: Estrutura principal da aplicação e navegação entre abas.
* `style.css`: Estilização responsiva com foco em *mobile-first*.
* `app.js`: Regras de negócio do front-end, orquestração de chamadas à API e manipulação da UI.
* `tacaCopa.jpg` / `favicon-copa-do-mundo.png`: Assets visuais (Logos e ícones).
* `supabase/` : Contém os scripts server-side (*Edge Functions*) responsáveis por consumir a API de esportes e atualizar o banco de dados.

---

## 🚀 Como Executar Localmente

Caso queira clonar o projeto e rodar na sua máquina:

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/Kennedy-Torres/simulador-copa-v2.git](https://github.com/Kennedy-Torres/simulador-copa-v2.git)

2. **Abra a pasta do projeto:**
    ```bash
    cd simulador-copa-v2

3. **Configure as chaves do Supabase:**
    
    * Crie um projeto no Supabase. https://supabase.com/dashboard/org/ewlckuvaxpetlxnmfvgs 
    * Substitua as credenciais SUPABASE_URL e SUPABASE_ANON_KEY no arquivo app.js pelas chaves do seu projeto.

4. **Execute:**
    
    * Como é um projeto Vanilla, basta abrir o arquivo index.html diretamente no navegador ou utilizar a extensão Live Server do VS Code.

## 📝 Licença

Desenvolvido para fins de estudo e diversão entre amigos. Sinta-se livre para clonar e adaptar!
