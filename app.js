// 1. Inicialize o Banco de Dados (Mudamos de 'supabase' para 'supabaseClient')
const supabaseUrl = 'https://arxswvfmeayoycxhhbql.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyeHN3dmZtZWF5b3ljeGhoYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzUwOTEsImV4cCI6MjA5NjUxMTA5MX0.gUCu78e2HmZ_lX7C9a_r9FnO8jfVCJQvWuSfJFcKn28';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. Função principal para calcular a pontuação seguindo as regras de negócio
function calcularPontos(palpiteA, palpiteB, placarRealA, placarRealB) {
    if (placarRealA === null || placarRealB === null) return 0; 

    const diferencaPalpite = palpiteA - palpiteB;
    const diferencaReal = placarRealA - placarRealB;

    if (palpiteA === placarRealA && palpiteB === placarRealB) return 5;

    const acertouVencedor = (diferencaPalpite > 0 && diferencaReal > 0) || 
                            (diferencaPalpite < 0 && diferencaReal < 0) || 
                            (diferencaPalpite === 0 && diferencaReal === 0);

    if (acertouVencedor) {
        if (diferencaPalpite === diferencaReal) return 3;
        return 2;
    }
    return 0;
}

// ---------------------------------------------------------
// FUNÇÕES DE AUTENTICAÇÃO
// ---------------------------------------------------------

// 3. Funções de Autenticação (Atualizadas com supabaseClient)
// Nova função para alternar entre as telas de Login e Cadastro
function alternarAuth(tela) {
    if (tela === 'cadastro') {
        document.getElementById('form-login').style.display = 'none';
        document.getElementById('form-cadastro').style.display = 'block';
        document.getElementById('auth-subtitle').innerText = 'Crie sua conta para participar!';
    } else {
        document.getElementById('form-cadastro').style.display = 'none';
        document.getElementById('form-login').style.display = 'block';
        document.getElementById('auth-subtitle').innerText = 'Faça login para palpitar!';
    }
}

async function cadastrar() {
    // Puxa os dados dos IDs específicos do formulário de cadastro
    const nome = document.getElementById('nome-cadastro').value;
    const email = document.getElementById('email-cadastro').value;
    const password = document.getElementById('password-cadastro').value;
    
    if (!nome || !email || !password) {
        return alert("Por favor, preencha todos os campos!");
    }
    
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    
    if (error) {
        alert("Erro: " + error.message);
    } else if (data.user) {
        await supabaseClient.from('profiles').insert([
            { id: data.user.id, nome: nome }
        ]);
        alert("Cadastro realizado com sucesso! Faça login agora.");
        // Volta automaticamente para a tela de login após cadastrar
        alternarAuth('login'); 
    }
}

async function login() {
    // Puxa os dados dos IDs específicos do formulário de login
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Erro no login: " + error.message);
    } else {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // NOVO: Chama a função para escrever o nome no menu após o login
        carregarNomeUsuario(data.user.id);
        
        carregarJogos();
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

// Navegação com atualização de dados e mudança de botão ativo
function mostrarAba(abaId) {
    // 1. Esconde todas as abas de conteúdo
    document.querySelectorAll('.aba').forEach(aba => aba.style.display = 'none');
    
    // 2. Mostra apenas a aba que foi clicada
    document.getElementById(abaId).style.display = 'block';

    // 3. Remove o destaque (classe 'ativo') de todos os botões do menu
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ativo'));
    
    // 4. Adiciona o destaque apenas no botão correspondente à aba aberta
    if (abaId === 'palpites') document.getElementById('btn-palpites').classList.add('ativo');
    if (abaId === 'ranking') document.getElementById('btn-ranking').classList.add('ativo');
    if (abaId === 'resultados-admin') document.getElementById('btn-admin').classList.add('ativo');
    if (abaId === 'amigos-palpites') document.getElementById('btn-amigos').classList.add('ativo');
    if (abaId === 'calendario') document.getElementById('btn-calendario').classList.add('ativo'); // NOVA LINHA

    // 5. Dispara a função correspondente para recarregar os dados do banco
    if (abaId === 'ranking') carregarRanking();
    if (abaId === 'resultados-admin') carregarResultadosAdmin();
    if (abaId === 'palpites') carregarJogos();
    if (abaId === 'calendario') carregarCalendario(); // NOVA LINHA
    //if (abaId === 'amigos-palpites') carregarListaAmigos();
    if (abaId === 'amigos-palpites') {
        // --- AQUI ESTÁ A MÁGICA ---
        document.getElementById('seletor-amigos').value = ""; // Reseta o select para a opção vazia
        document.getElementById('lista-palpites-amigo').innerHTML = ""; // Limpa a lista de jogos
        carregarListaAmigos(); // Recarrega a lista de amigos
    }

}

// Função para desenhar a aba de Resultados com o layout de cartões
async function carregarResultadosAdmin() {
    const listaAdmin = document.getElementById('lista-resultados-admin');
    listaAdmin.innerHTML = '<p>A carregar os jogos para administração...</p>';
    
    // Aplica o grid de grupos para manter o design consistente
    listaAdmin.className = 'grupos-container';

    // Busca todos os jogos da base de dados
    const { data: jogos, error } = await supabaseClient
        .from('matches')
        .select('*')
        .order('grupo', { ascending: true })
        .order('data_jogo', { ascending: true });

    if (error) return listaAdmin.innerHTML = `<p>Erro: ${error.message}</p>`;

    // Agrupa os jogos pela letra do Grupo (A, B, C...)
    const grupos = {};
    jogos.forEach(jogo => {
        if (!grupos[jogo.grupo]) grupos[jogo.grupo] = [];
        grupos[jogo.grupo].push(jogo);
    });

    listaAdmin.innerHTML = '';

    // Monta os cartões para cada grupo
    Object.keys(grupos).forEach(grupoNome => {
        const card = document.createElement('div');
        card.className = 'grupo-card';

        // Topo do cartão (Simplificado, sem a tabela de classificação)
        let htmlCard = `
            <div class="grupo-topo">
                <h4>Grupo ${grupoNome} - Placar Oficial</h4>
            </div>
            <div class="grupo-jogos">
        `;

        grupos[grupoNome].forEach(jogo => {
            const dataObj = new Date(jogo.data_jogo);
            const diaMes = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
            const hora = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Recupera o placar real caso já tenha sido registado antes
            const valA = jogo.placar_real_a !== null ? jogo.placar_real_a : '';
            const valB = jogo.placar_real_b !== null ? jogo.placar_real_b : '';

            // Note que o botão aqui tem uma cor diferente (vermelho escuro) para não confundir com o palpite
            htmlCard += `
                <div class="jogo-row">
                    <div class="jogo-data">${diaMes}<span>${hora}</span></div>
                    <div class="time-nome">${jogo.time_a}</div>
                    <div class="placar-inputs">
                        <input type="number" id="real_a_${jogo.id}" value="${valA}" min="0">
                        <span>X</span>
                        <input type="number" id="real_b_${jogo.id}" value="${valB}" min="0">
                    </div>
                    <div class="time-nome">${jogo.time_b}</div>
                    <button class="btn-salvar-jogo" onclick="salvarPlacarReal(${jogo.id})" style="background-color: #c0392b;">✓</button>
                </div>
            `;
        });

        card.innerHTML = htmlCard + `</div>`;
        listaAdmin.appendChild(card);
    });
}

// Função para atualizar o placar real na base de dados
async function salvarPlacarReal(matchId) {
    const realA = document.getElementById(`real_a_${matchId}`).value;
    const realB = document.getElementById(`real_b_${matchId}`).value;

    if (realA === '' || realB === '') {
        alert("Preencha o placar oficial completo!");
        return;
    }

    // Faz o UPDATE diretamente na tabela 'matches'
    const { error } = await supabaseClient
        .from('matches')
        .update({ 
            placar_real_a: parseInt(realA), 
            placar_real_b: parseInt(realB) 
        })
        .eq('id', matchId);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert("Resultado oficial registado! A tabela de classificação e o Ranking já foram atualizados.");
    }
}


// Função auxiliar para calcular a classificação do grupo com base nos resultados reais
function calcularClassificacao(jogosDoGrupo) {
    const equipas = {};

    // 1. Inicializa todas as equipas com 0
    jogosDoGrupo.forEach(jogo => {
        if (!equipas[jogo.time_a]) equipas[jogo.time_a] = { nome: jogo.time_a, j: 0, p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
        if (!equipas[jogo.time_b]) equipas[jogo.time_b] = { nome: jogo.time_b, j: 0, p: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };

        // 2. Soma os pontos se o jogo já tiver um placar real registado
        if (jogo.placar_real_a !== null && jogo.placar_real_b !== null) {
            const ta = equipas[jogo.time_a];
            const tb = equipas[jogo.time_b];
            const ga = jogo.placar_real_a;
            const gb = jogo.placar_real_b;

            ta.j++; tb.j++;
            ta.gp += ga; ta.gc += gb; ta.sg = ta.gp - ta.gc;
            tb.gp += gb; tb.gc += ga; tb.sg = tb.gp - tb.gc;

            if (ga > gb) { ta.p += 3; ta.v++; tb.d++; } 
            else if (ga < gb) { tb.p += 3; tb.v++; ta.d++; } 
            else { ta.p += 1; ta.e++; tb.p += 1; tb.e++; }
        }
    });

    // 3. Converte para array e ordena (Pontos > Saldo Gols > Gols Pró)
    return Object.values(equipas).sort((a, b) => {
        if (b.p !== a.p) return b.p - a.p; 
        if (b.sg !== a.sg) return b.sg - a.sg; 
        return b.gp - a.gp; 
    });
}

// Nova função para desenhar a aba de Palpites com o Design dos Grupos
async function carregarJogos() {
    const listaJogos = document.getElementById('lista-jogos');
    listaJogos.innerHTML = '<p>A carregar os jogos...</p>';
    
    // Adiciona a classe de grelha ao container
    listaJogos.className = 'grupos-container';

    // Vai buscar todos os jogos e palpites do utilizador
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    // Traz os jogos e junta (JOIN) com os palpites do próprio utilizador logado
    const { data: jogos, error } = await supabaseClient
        .from('matches')
        .select(`*, predictions ( score_a, score_b )`)
        .eq('predictions.user_id', user.id)
        .order('grupo', { ascending: true })
        .order('data_jogo', { ascending: true });

    if (error) return listaJogos.innerHTML = `<p>Erro: ${error.message}</p>`;

    // Agrupa os jogos pela letra do Grupo (A, B, C...)
    const grupos = {};
    jogos.forEach(jogo => {
        if (!grupos[jogo.grupo]) grupos[jogo.grupo] = [];
        grupos[jogo.grupo].push(jogo);
    });

    listaJogos.innerHTML = '';

    // Para cada grupo, cria o Card completo
    Object.keys(grupos).forEach(grupoNome => {
        const jogosDoGrupo = grupos[grupoNome];
        const classificacao = calcularClassificacao(jogosDoGrupo);

        const card = document.createElement('div');
        card.className = 'grupo-card';

        // --- PARTE 1: HTML DA CLASSIFICAÇÃO (TOPO AZUL) ---
        let htmlClassificacao = `
            <div class="grupo-topo">
                <h4>Grupo ${grupoNome}</h4>
                <div class="tabela-header">
                    <span class="col-nome"></span>
                    <span class="col-num">J</span><span class="col-num">P</span>
                    <span class="col-num">V</span><span class="col-num">E</span>
                    <span class="col-num">D</span><span class="col-num">SG</span>
                </div>
        `;

        classificacao.forEach(equipa => {
            htmlClassificacao += `
                <div class="tabela-linha">
                    <span class="col-nome">${equipa.nome}</span>
                    <span class="col-num">${equipa.j}</span><span class="col-num">${equipa.p}</span>
                    <span class="col-num">${equipa.v}</span><span class="col-num">${equipa.e}</span>
                    <span class="col-num">${equipa.d}</span><span class="col-num">${equipa.sg}</span>
                </div>
            `;
        });
        htmlClassificacao += `</div><div class="grupo-jogos">`;

        // --- PARTE 2: HTML DOS JOGOS PARA PALPITAR ---
        let htmlJogos = '';
        const idsDoGrupo = []; // NOVO: Guarda os IDs dos jogos deste cartão

        jogosDoGrupo.forEach(jogo => {
            idsDoGrupo.push(jogo.id); // Adiciona o ID à lista
            
            const dataObj = new Date(jogo.data_jogo);
            const diaMes = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
            const hora = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Recupera o palpite que o utilizador já fez (se existir)
            let palpiteA = '';
            let palpiteB = '';
            if (jogo.predictions && jogo.predictions.length > 0) {
                palpiteA = jogo.predictions[0].score_a;
                palpiteB = jogo.predictions[0].score_b;
            }

            htmlJogos += `
                <div class="jogo-row">
                    <div class="jogo-data">${diaMes}<span>${hora}</span></div>
                    <div class="time-nome">${jogo.time_a}</div>
                    <div class="placar-inputs">
                        <input type="number" id="palpite_a_${jogo.id}" value="${palpiteA}" min="0">
                        <span>X</span>
                        <input type="number" id="palpite_b_${jogo.id}" value="${palpiteB}" min="0">
                    </div>
                    <div class="time-nome">${jogo.time_b}</div>
                    <button class="btn-salvar-jogo" onclick="salvarPalpite(${jogo.id})">✔</button>
                </div>
            `;
        });

        // NOVO: Adiciona o botão "Salvar Grupo" no final da lista de jogos
        // O JSON.stringify transforma a lista de IDs num formato que o HTML consegue passar para a função
        htmlJogos += `
            <div class="area-salvar-grupo">
                <button class="btn-salvar-grupo" onclick='salvarGrupo(${JSON.stringify(idsDoGrupo)})'>
                    Salvar Palpites do Grupo ${grupoNome}
                </button>
            </div>
        `;

        // Junta tudo e insere no ecrã
        card.innerHTML = htmlClassificacao + htmlJogos + `</div>`;
        listaJogos.appendChild(card);
    });
}

// Função para salvar todos os palpites de um grupo de uma vez
async function salvarGrupo(idsArray) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const palpitesParaSalvar = [];

    // 1. Percorre todos os IDs para recolher o que o utilizador digitou
    idsArray.forEach(matchId => {
        const valA = document.getElementById(`palpite_a_${matchId}`).value;
        const valB = document.getElementById(`palpite_b_${matchId}`).value;

        // Só prepara para salvar se os dois campos estiverem preenchidos
        if (valA !== '' && valB !== '') {
            palpitesParaSalvar.push({
                user_id: user.id,
                match_id: matchId,
                score_a: parseInt(valA),
                score_b: parseInt(valB)
            });
        }
    });

    if (palpitesParaSalvar.length === 0) {
        return alert("Preencha pelo menos um placar antes de salvar o grupo!");
    }

    try {
        // 2. Apaga os palpites antigos para evitar duplicação
        const matchIds = palpitesParaSalvar.map(p => p.match_id);
        await supabaseClient.from('predictions')
            .delete()
            .eq('user_id', user.id)
            .in('match_id', matchIds);

        // 3. Insere a lista completa de novos palpites numa única chamada
        const { error } = await supabaseClient.from('predictions').insert(palpitesParaSalvar);

        if (error) throw error;
        
        alert("Palpites do grupo salvos com sucesso!");
    } catch (erro) {
        alert("Erro ao salvar o grupo: " + erro.message);
    }
}

// Função para enviar o palpite
async function salvarPalpite(matchId) {
    const scoreA = document.getElementById(`palpite_a_${matchId}`).value;
    const scoreB = document.getElementById(`palpite_b_${matchId}`).value;

    if (scoreA === '' || scoreB === '') {
        alert("Preencha o placar inteiro antes de salvar!");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
        .from('predictions')
        .upsert({ 
            user_id: user.id, 
            match_id: matchId, 
            score_a: parseInt(scoreA), 
            score_b: parseInt(scoreB) 
        }, { onConflict: 'user_id, match_id' }); 

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        alert("Palpite salvo com sucesso!");
    }
}

// ---------------------------------------------------------
// FUNÇÃO DO RANKING DOS AMIGOS
// ---------------------------------------------------------

async function carregarRanking() {
    const listaRanking = document.getElementById('lista-ranking');
    listaRanking.innerHTML = '<p>A calcular o ranking...</p>';

    // Busca os palpites e resultados
    const { data: palpites, error } = await supabaseClient
        .from('predictions')
        .select(`user_id, score_a, score_b, matches ( placar_real_a, placar_real_b )`);

    // NOVA PARTE: Busca os nomes de todos os usuários
    const { data: perfis } = await supabaseClient.from('profiles').select('*');
    
    // Cria um "dicionário" fácil para achar o nome pelo ID
    const mapaNomes = {};
    if (perfis) {
        perfis.forEach(perfil => {
            mapaNomes[perfil.id] = perfil.nome;
        });
    }

    if (error) return listaRanking.innerHTML = `<p>Erro: ${error.message}</p>`;

    const pontuacoes = {};
    palpites.forEach(palpite => {
        const userId = palpite.user_id;
        const jogo = palpite.matches;
        if (!pontuacoes[userId]) pontuacoes[userId] = 0;

        if (jogo.placar_real_a !== null && jogo.placar_real_b !== null) {
            pontuacoes[userId] += calcularPontos(palpite.score_a, palpite.score_b, jogo.placar_real_a, jogo.placar_real_b);
        }
    });

    const rankingOrdenado = Object.keys(pontuacoes)
        .map(userId => ({ userId, pontos: pontuacoes[userId] }))
        .sort((a, b) => b.pontos - a.pontos);

    listaRanking.innerHTML = '';
    if (rankingOrdenado.length === 0) return listaRanking.innerHTML = '<p>Nenhum palpite computado ainda.</p>';

    rankingOrdenado.forEach((posicao, index) => {
        const li = document.createElement('li');
        li.style.padding = '15px';
        li.style.borderBottom = '1px solid #ddd';
        li.style.listStyle = 'none';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.backgroundColor = index === 0 ? '#f9fbe7' : '#fff'; 
        
        // Substituímos o ID pelo Nome (ou deixamos "Sem Nome" se for uma conta antiga)
        const nomeDoJogador = mapaNomes[posicao.userId] || 'Sem Nome';
        
        li.innerHTML = `
            <span style="font-size: 1.1rem;">
                <strong style="color: #113f67; font-size: 1.2rem; margin-right: 10px;">${index + 1}º</strong> 
                ${nomeDoJogador}
            </span>
            <span style="background-color: #113f67; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold;">
                ${posicao.pontos} pts
            </span>
        `;
        listaRanking.appendChild(li);
    });
}

// Busca o nome do usuário na tabela profiles para exibir no topo
async function carregarNomeUsuario(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('nome')
        .eq('id', userId)
        .single();
    
    if (data && data.nome) {
        document.getElementById('nome-usuario-logado').innerText = data.nome;
    } else {
        document.getElementById('nome-usuario-logado').innerText = "Jogador";
    }
}

// ---------------------------------------------------------
// VERIFICAÇÃO DE SESSÃO (Manter o utilizador logado)
// ---------------------------------------------------------

async function verificarSessao() {
    // Pergunta ao Supabase se existe uma sessão ativa guardada no navegador
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        // Se já estiver logado, esconde o login e vai direto para o painel
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        // NOVO: Chama a função para escrever o nome no menu
        carregarNomeUsuario(session.user.id);

        carregarJogos(); // Carrega os jogos na aba inicial
    } else {
        // Se não estiver, garante que a tela de login aparece
        document.getElementById('auth-screen').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
}

// ---------------------------------------------------------
// ---------------------------------------------------------


// 1. Carrega os nomes dos amigos no select
async function carregarListaAmigos() {
    const seletor = document.getElementById('seletor-amigos');
    const { data: perfis } = await supabaseClient.from('profiles').select('*');
    
    seletor.innerHTML = '<option value="">Pesquisar amigo pelo nome...</option>';
    perfis.forEach(perfil => {
        const option = document.createElement('option');
        option.value = perfil.id;
        option.textContent = perfil.nome;
        seletor.appendChild(option);
    });
}

// 2. Busca e exibe os palpites do amigo escolhido
async function carregarPalpitesAmigo() {
    const amigoId = document.getElementById('seletor-amigos').value;
    const lista = document.getElementById('lista-palpites-amigo');
    
    if (!amigoId) {
        lista.innerHTML = '';
        return;
    }
    
    lista.innerHTML = '<p>A carregar palpites...</p>';

    // Busca os palpites do amigo
    const { data: palpites } = await supabaseClient
        .from('predictions')
        .select(`score_a, score_b, matches ( grupo, time_a, time_b )`)
        .eq('user_id', amigoId)
        .order('matches(grupo)', { ascending: true });

    // Agrupa os palpites por Grupo (A, B, C...)
    const grupos = {};
    palpites.forEach(p => {
        const g = p.matches.grupo;
        if (!grupos[g]) grupos[g] = [];
        grupos[g].push(p);
    });

    lista.innerHTML = '';

    // Desenha cada grupo como um card, igual aos seus palpites
    Object.keys(grupos).forEach(grupoNome => {
        const card = document.createElement('div');
        card.className = 'grupo-card';
        
        let htmlJogos = `<div class="grupo-header">Grupo ${grupoNome}</div>`;
        
        grupos[grupoNome].forEach(p => {
            htmlJogos += `
                <div class="jogo-row">
                    <div class="time-nome">${p.matches.time_a}</div>
                    <div class="placar-display" style="font-weight: bold; margin: 0 15px;">
                        ${p.score_a} x ${p.score_b}
                    </div>
                    <div class="time-nome">${p.matches.time_b}</div>
                </div>
            `;
        });
        
        card.innerHTML = htmlJogos + `</div>`;
        lista.appendChild(card);
    });
}

// ---------------------------------------------------------
// FUNÇÃO DO CALENDÁRIO
// ---------------------------------------------------------

async function carregarCalendario() {
    const lista = document.getElementById('lista-calendario');
    lista.innerHTML = '<p>A carregar o calendário de jogos...</p>';

    // Vai buscar os jogos e ordena apenas pela data e hora (independentemente do grupo)
    const { data: jogos, error } = await supabaseClient
        .from('matches')
        .select('*')
        .order('data_jogo', { ascending: true });

    if (error) return lista.innerHTML = `<p>Erro: ${error.message}</p>`;

    // Agrupa os jogos pelo nome do dia (ex: "quinta-feira, 11 de junho")
    const diasAgrupados = {};
    jogos.forEach(jogo => {
        const dataObj = new Date(jogo.data_jogo);
        
        // Formata a data para ficar bonita: ex. "quinta-feira, 11 de jun"
        const diaNome = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).replace('.', '');
        
        if (!diasAgrupados[diaNome]) diasAgrupados[diaNome] = [];
        diasAgrupados[diaNome].push(jogo);
    });

    lista.innerHTML = '';

    // Desenha uma tabela/cartão para cada dia que tem jogos
    Object.keys(diasAgrupados).forEach(dia => {
        const diaSection = document.createElement('div');
        diaSection.className = 'calendario-dia';
        
        // Cabeçalho azul com o título do dia
        let htmlJogos = `<div class="calendario-header">${dia}</div><div>`;
        
        // Linhas com os jogos daquele dia
        diasAgrupados[dia].forEach(jogo => {
            const hora = new Date(jogo.data_jogo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Informação Extra: Se o jogo já tiver resultado, mostra o resultado a verde. Senão, mostra "X"
            const placarExibicao = (jogo.placar_real_a !== null && jogo.placar_real_b !== null) 
                ? `<span class="placar-real-cal">${jogo.placar_real_a} x ${jogo.placar_real_b}</span>` 
                : `<span class="vs-text">X</span>`;

            htmlJogos += `
                <div class="jogo-row cal-row">
                    <div class="cal-hora">${hora}</div>
                    <div class="cal-grupo">Grupo ${jogo.grupo}</div>
                    <div class="time-nome cal-time-a">${jogo.time_a}</div>
                    <div class="cal-placar">${placarExibicao}</div>
                    <div class="time-nome cal-time-b">${jogo.time_b}</div>
                </div>
            `;
        });
        
        htmlJogos += `</div>`;
        diaSection.innerHTML = htmlJogos;
        lista.appendChild(diaSection);
    });
}


// Executa a função automaticamente assim que a página terminar de carregar
window.onload = verificarSessao;