# 🏆 Bolão Copa do Mundo 2026

Um simulador interativo e responsivo para a Copa do Mundo de 2026, criado para que amigos possam palpitar nos resultados das partidas e competir em um ranking geral por pontos.

🔗 **Acesse o projeto online:** [Simulador Copa 2026](https://simulador-copamundo-2026.netlify.app/)

---

## 📌 Funcionalidades

* **Autenticação de Usuários:** Login e registro seguros via Supabase.
* **Dashboard de Palpites:** Interface intuitiva para salvar palpites individuais ou por grupo, agrupados por fase e data.
* **Calendário de Jogos:** Visualização cronológica de todas as partidas do torneio, exibindo placares reais de jogos já finalizados.
* **Ranking em Tempo Real:** Tabela de classificação dos participantes baseada nos acertos dos placares.
* **Atualização de Placares Reais:** Integração com a API do FOOTBALL-DATA.ORG e funções Serverless (Supabase Functions) para buscar e atualizar os resultados oficiais automaticamente.
* **Painel Administrativo:** Área restrita para ajustes e inserção manual de resultados, caso necessário.

---

## 🛠️ Tecnologias Utilizadas

**Front-end:**
* HTML5 (Semântico)
* CSS3 (Flexbox, Grid, Responsividade)
* JavaScript (Vanilla, ES6+, Async/Await)

**Back-end & Infraestrutura:**
* **[Supabase](https://supabase.com/):** Banco de Dados PostgreSQL, Autenticação, Row Level Security (RLS) e Edge Functions.
* **API Externa:** [FOOTBALL-DATA.ORG](https://www.football-data.org/) para dados em tempo real.
* **Hospedagem:** Netlify (Deploy Contínuo).

---

## 📂 Estrutura do Projeto

Abaixo está a organização dos principais arquivos do repositório:

* `index.html`: Estrutura principal da aplicação e abas do dashboard.
* `style.css`: Estilização completa, com visual mobile-first.
* `app.js`: Lógica de negócio do front-end, comunicação com o Supabase e manipulação do DOM.
* `tacaCopa.jpg` / `favicon-copa-do-mundo.png`: Assets visuais (Logos e ícones).
* `supabase/` : Contém os scripts server-side (Edge Functions) responsáveis por consumir a API de esportes e atualizar a tabela `matches` no banco de dados.

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