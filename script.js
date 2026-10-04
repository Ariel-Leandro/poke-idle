const golpesDB = {
  investida: { nome: "Investida", poder: 35, custoPP: 0, tipo: "Normal" },
  arranha: { nome: "Arranha", poder: 35, custoPP: 0, tipo: "Normal" },
  chicote_de_cipo: { nome: "Chicote de Cipó", poder: 50, custoPP: 15, tipo: "Planta" },
  folha_navalha: { nome: "Folha Navalha", poder: 75, custoPP: 35, tipo: "Planta" },
  brasa: { nome: "Brasa", poder: 45, custoPP: 15, tipo: "Fogo" },
  lanca_chamas: { nome: "Lança-Chamas", poder: 90, custoPP: 45, tipo: "Fogo" },
  pistola_de_agua: { nome: "Pistola de Água", poder: 45, custoPP: 15, tipo: "Agua" },
  jacto_de_agua: { nome: "Jacto de Água", poder: 100, custoPP: 55, tipo: "Agua" },
  mordida: { nome: "Mordida", poder: 60, custoPP: 25, tipo: "Normal" }
};

const pokebolasDB = {
  nenhuma: { nome: "Nenhuma", chance: 0 },
  pokeball: { nome: "🔴 Poké Ball", chance: 0.30 },
  greatball: { nome: "🔵 Great Ball", chance: 0.60 },
  ultraball: { nome: "🟡 Ultra Ball", chance: 0.90 }
};

const tabelaTipos = {
  Normal:   { Ped: 0.5, Fan: 0 },
  Fogo:     { Fog: 0.5, Agua: 0.5, Pla: 2.0, Ins: 2.0, Ped: 0.5, Dra: 0.5 },
  Agua:     { Fog: 2.0, Agua: 0.5, Pla: 0.5, Ped: 2.0, Ter: 2.0, Dra: 0.5 },
  Planta:   { Fog: 0.5, Agua: 2.0, Pla: 0.5, Ven: 0.5, Voa: 0.5, Ins: 0.5, Ped: 2.0, Ter: 2.0, Dra: 0.5 },
  Eletrico: { Agua: 2.0, Ele: 0.5, Pla: 0.5, Voa: 2.0, Ter: 0, Dra: 0.5 },
  Voador:   { Pla: 2.0, Ele: 0.5, Luta: 2.0, Ins: 2.0, Ped: 0.5 },
  Veneno:   { Pla: 2.0, Ven: 0.5, Ter: 0.5, Ped: 0.5, Fan: 0.5 },
  Inseto:   { Fog: 0.5, Pla: 2.0, Ven: 0.5, Luta: 0.5, Voa: 0.5, Psi: 2.0, Fan: 0.5 },
  Pedra:    { Fog: 2.0, Gel: 2.0, Voa: 2.0, Ins: 2.0, Luta: 0.5, Ter: 0.5 },
  Psiquico: { Luta: 2.0, Ven: 2.0, Psi: 0.5 }
};

const areas = [
  { id: 1, nome: "Rota 1 & Floresta de Viridian", minId: 1, maxId: 25 },
  { id: 2, nome: "Caverna Mt. Moon & Rota 4", minId: 26, maxId: 50 },
  { id: 3, nome: "Túnel de Pedra & Escuridão", minId: 51, maxId: 80 },
  { id: 4, nome: "Zona de Safári & Rota 16", minId: 81, maxId: 110 },
  { id: 5, nome: "Ilhas de Espuma & Caverna Cerulean", minId: 111, maxId: 143 },
  { id: 6, nome: "Planalto Indigo & Lendários", minId: 144, maxId: 151 }
];

let basePokemons = {};
let meuTime = []; 
let meuBox = [];
let inventario = { ouro: 0, pokeball: 0, greatball: 0, ultraball: 0 };
let pokemonAtivoIndex = 0; 
let pokemonInimigo = null;
let areaSelecionada = null;

let meupkmnAbaSelecionadaIdx = 0;
let scriptAutomacao = {}; 
let estatisticasFarm = { vitorias: 0, ouroTotal: 0, emExecucao: false };
let usuarioLogado = null;
let generoTreinador = 'M';
let pokedexProgress = {};

function obterModal(id) {
  return bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
}

async function iniciarJogo() {
  try {
    const resposta = await fetch('base_de_pokemons.json');
    if (resposta.ok) basePokemons = await resposta.json();
  } catch (e) {
    console.warn("Base local carregada.");
  }

  preencherBaseFaltante();
  const modalTime = document.getElementById('modal-gerenciar-time');
  if (modalTime && !modalTime.dataset.bound) {
    modalTime.dataset.bound = '1';
    modalTime.addEventListener('hidden.bs.modal', () => {
      salvarDadosProgresso();
      if (document.getElementById('tela-areas').classList.contains('ativa')) {
        exibirTelaAreas();
      }
    });
  }
  verificarSessaoAtiva();
}

/* SISTEMA DO TREINADOR */
function selecionarGeneroTreinador(genero) {
  generoTreinador = genero;
  const imgTreinador = document.getElementById('treinador-sprite-display');
  const btnM = document.getElementById('btn-genero-m');
  const btnF = document.getElementById('btn-genero-f');

  if (genero === 'M') {
    imgTreinador.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/1.png";
    btnM.classList.add('active');
    btnF.classList.remove('active');
  } else {
    imgTreinador.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/2.png";
    btnF.classList.add('active');
    btnM.classList.remove('active');
  }

  salvarDadosProgresso();
}

/* AUTENTICAÇÃO E LOJA */
function mudarAbaAuth(aba) {
  document.getElementById('msg-auth').innerText = '';
  const btnEntrar = document.getElementById('aba-entrar');
  const btnCriar = document.getElementById('aba-criar');
  const formEntrar = document.getElementById('form-entrar');
  const formCriar = document.getElementById('form-criar');

  if (aba === 'entrar') {
    btnEntrar.classList.add('active');
    btnCriar.classList.remove('active');
    formEntrar.classList.remove('d-none');
    formCriar.classList.add('d-none');
  } else {
    btnCriar.classList.add('active');
    btnEntrar.classList.remove('active');
    formCriar.classList.remove('d-none');
    formEntrar.classList.add('d-none');
  }
}

function realizarCadastro(e) {
  e.preventDefault();
  const usuarioInput = document.getElementById('cad-usuario').value.trim();
  const senhaInput = document.getElementById('cad-senha').value.trim();
  const msg = document.getElementById('msg-auth');

  if (!usuarioInput || !senhaInput) {
    msg.innerText = "Preencha todos os campos!";
    return;
  }

  let contas = JSON.parse(localStorage.getItem('pkmn_contas') || '{}');
  if (contas[usuarioInput]) {
    msg.innerText = "Utilizador já existe!";
    return;
  }

  contas[usuarioInput] = {
    senha: senhaInput,
    generoTreinador: 'M',
    time: [],
    box: [],
    inventario: { ouro: 100, pokeball: 5, greatball: 0, ultraball: 0 },
    scriptAutomacao: {},
    estatisticas: { vitorias: 0, ouroTotal: 0 }
  };

  localStorage.setItem('pkmn_contas', JSON.stringify(contas));
  iniciarSessaoUsuario(usuarioInput);
}

function realizarLogin(e) {
  e.preventDefault();
  const usuarioInput = document.getElementById('login-usuario').value.trim();
  const senhaInput = document.getElementById('login-senha').value.trim();
  const msg = document.getElementById('msg-auth');

  let contas = JSON.parse(localStorage.getItem('pkmn_contas') || '{}');

  if (!contas[usuarioInput] || contas[usuarioInput].senha !== senhaInput) {
    msg.innerText = "Utilizador ou palavra-passe incorretos!";
    return;
  }

  iniciarSessaoUsuario(usuarioInput);
}

function iniciarSessaoUsuario(usuario) {
  usuarioLogado = usuario;
  localStorage.setItem('pkmn_sessao', usuario);
  carregarDadosProgresso();

  if (meuTime.length > 0) {
    exibirTelaAreas();
  } else {
    exibirTelaEscolhaTime();
  }
}

function verificarSessaoAtiva() {
  const sessaoSalva = localStorage.getItem('pkmn_sessao');
  if (sessaoSalva) {
    let contas = JSON.parse(localStorage.getItem('pkmn_contas') || '{}');
    if (contas[sessaoSalva]) {
      usuarioLogado = sessaoSalva;
      carregarDadosProgresso();
      if (meuTime.length > 0) {
        exibirTelaAreas();
      } else {
        exibirTelaEscolhaTime();
      }
      return;
    }
  }
  trocarTela('tela-login');
}

function sairDaConta() {
  salvarDadosProgresso();
  usuarioLogado = null;
  localStorage.removeItem('pkmn_sessao');
  meuTime = [];
  meuBox = [];
  scriptAutomacao = {};
  pokedexProgress = {};
  trocarTela('tela-login');
}

function salvarDadosProgresso() {
  if (!usuarioLogado) return;

  let contas = JSON.parse(localStorage.getItem('pkmn_contas') || '{}');
  if (contas[usuarioLogado]) {
    contas[usuarioLogado].generoTreinador = generoTreinador;
    contas[usuarioLogado].time = meuTime;
    contas[usuarioLogado].box = meuBox;
    contas[usuarioLogado].inventario = inventario;
    contas[usuarioLogado].scriptAutomacao = scriptAutomacao;
    contas[usuarioLogado].pokedex = pokedexProgress;
    contas[usuarioLogado].estatisticas = {
      vitorias: estatisticasFarm.vitorias,
      ouroTotal: estatisticasFarm.ouroTotal
    };
    localStorage.setItem('pkmn_contas', JSON.stringify(contas));
  }
}

function carregarDadosProgresso() {
  if (!usuarioLogado) return;

  let contas = JSON.parse(localStorage.getItem('pkmn_contas') || '{}');
  const dados = contas[usuarioLogado];

  if (dados) {
    generoTreinador = dados.generoTreinador || 'M';
    meuTime = dados.time || [];
    meuBox = dados.box || [];
    inventario = dados.inventario || { ouro: 100, pokeball: 5, greatball: 0, ultraball: 0 };
    scriptAutomacao = dados.scriptAutomacao || {};
    pokedexProgress = dados.pokedex || {};
    estatisticasFarm.vitorias = dados.estatisticas?.vitorias || 0;
    estatisticasFarm.ouroTotal = dados.estatisticas?.ouroTotal || 0;
    sincronizarPokedexComInventario();
  }
}

function comprarPokebola(tipo, preco) {
  if (inventario.ouro >= preco) {
    inventario.ouro -= preco;
    inventario[tipo] = (inventario[tipo] || 0) + 1;
    salvarDadosProgresso();
    atualizarHUDLoja();
  } else {
    alert("Ouro insuficiente!");
  }
}

function atualizarHUDLoja() {
  document.getElementById('hud-ouro-valor').innerText = inventario.ouro;
  document.getElementById('qtd-pokeball').innerText = inventario.pokeball;
  document.getElementById('qtd-greatball').innerText = inventario.greatball;
  document.getElementById('qtd-ultraball').innerText = inventario.ultraball;
}

/* SISTEMA DE GERENCIAMENTO DE TIME E BOX */
function abrirModalGerenciarTime() {
  renderizarGerenciadorTime();
  obterModal('modal-gerenciar-time').show();
}

function fecharModalGerenciarTime() {
  obterModal('modal-gerenciar-time').hide();
}

function renderizarGerenciadorTime() {
  const containerTime = document.getElementById('lista-time-gerenciador');
  const containerBox = document.getElementById('lista-box-gerenciador');

  containerTime.innerHTML = '';
  containerBox.innerHTML = '';

  // Equipe
  meuTime.forEach((pkmn, idx) => {
    const card = document.createElement('div');
    card.className = 'd-flex align-items-center gap-2 p-2 rounded border border-secondary bg-dark';
    card.innerHTML = `
      <img src="${pkmn.sprite}" width="40" height="40" alt="${pkmn.nome}">
      <div class="flex-grow-1">
        <strong>${pkmn.nome} ${idx === 0 ? '⭐ (Líder)' : ''}</strong>
        <small class="d-block text-muted">Nv. ${pkmn.nivel} | HP: ${pkmn.hpAtual}/${pkmn.hpMax}</small>
      </div>
      <div class="d-flex flex-column gap-1">
        ${idx > 0 ? `<button class="btn btn-outline-warning btn-sm" onclick="moverParaLider(${idx})">Subir Líder</button>` : ''}
        ${meuTime.length > 1 ? `<button class="btn btn-outline-danger btn-sm" onclick="moverTimeParaBox(${idx})">Guardar no Box</button>` : ''}
      </div>
    `;
    containerTime.appendChild(card);
  });

  // Box
  if (meuBox.length === 0) {
    containerBox.innerHTML = '<p class="text-muted p-2 mb-0">Nenhum Pokémon no box.</p>';
  } else {
    meuBox.forEach((pkmn, idx) => {
      const card = document.createElement('div');
      card.className = 'd-flex align-items-center gap-2 p-2 rounded border border-secondary bg-dark';
      card.innerHTML = `
        <img src="${pkmn.sprite}" width="40" height="40" alt="${pkmn.nome}">
        <div class="flex-grow-1">
          <strong>${pkmn.nome}</strong>
          <small class="d-block text-muted">Nv. ${pkmn.nivel} | HP: ${pkmn.hpAtual}/${pkmn.hpMax}</small>
        </div>
        <button class="btn btn-outline-info btn-sm" onclick="moverBoxParaTime(${idx})" ${meuTime.length >= 3 ? 'disabled' : ''}>Puxar pro Time</button>
      `;
      containerBox.appendChild(card);
    });
  }
}

function moverParaLider(index) {
  const pokemon = meuTime.splice(index, 1)[0];
  meuTime.unshift(pokemon);
  renderizarGerenciadorTime();
}

function moverTimeParaBox(index) {
  if (meuTime.length <= 1) return;
  const pokemon = meuTime.splice(index, 1)[0];
  meuBox.push(pokemon);
  renderizarGerenciadorTime();
}

function moverBoxParaTime(index) {
  if (meuTime.length >= 3) return;
  const pokemon = meuBox.splice(index, 1)[0];
  meuTime.push(pokemon);
  renderizarGerenciadorTime();
}

/* LÓGICA DE BATALHA E FARM */
function preencherBaseFaltante() {
  const iniciaisClassicos = {
    1: { id: 1, nome: "Bulbasaur", tipos: ["Planta", "Veneno"], atributosBase: { pontosVida: 45, ataque: 49, defesa: 49, velocidade: 45 }, golpesDisponiveis: ["investida", "chicote_de_cipo", "folha_navalha", "mordida"] },
    4: { id: 4, nome: "Charmander", tipos: ["Fogo"], atributosBase: { pontosVida: 39, ataque: 52, defesa: 43, velocidade: 65 }, golpesDisponiveis: ["arranha", "brasa", "lanca_chamas", "mordida"] },
    7: { id: 7, nome: "Squirtle", tipos: ["Agua"], atributosBase: { pontosVida: 44, ataque: 48, defesa: 65, velocidade: 43 }, golpesDisponiveis: ["investida", "pistola_de_agua", "jacto_de_agua", "mordida"] },
    16: { id: 16, nome: "Pidgey", tipos: ["Normal", "Voador"], atributosBase: { pontosVida: 40, ataque: 45, defesa: 40, velocidade: 56 }, golpesDisponiveis: ["investida", "arranha"] },
    25: { id: 25, nome: "Pikachu", tipos: ["Eletrico"], atributosBase: { pontosVida: 35, ataque: 55, defesa: 40, velocidade: 90 }, golpesDisponiveis: ["investida", "mordida"] }
  };

  const tiposPossiveis = ["Normal", "Planta", "Veneno", "Fogo", "Voador", "Agua", "Inseto", "Eletrico", "Psiquico", "Pedra"];

  for (let i = 1; i <= 151; i++) {
    if (!basePokemons[i]) {
      if (iniciaisClassicos[i]) {
        basePokemons[i] = iniciaisClassicos[i];
      } else {
        basePokemons[i] = {
          id: i,
          nome: `Pokémon #${i}`,
          tipos: [tiposPossiveis[i % tiposPossiveis.length]],
          atributosBase: { pontosVida: 45 + Math.floor(i/3), ataque: 45 + Math.floor(i/3), defesa: 45, velocidade: 45 },
          golpesDisponiveis: ["investida", "mordida"]
        };
      }
    }
  }
}

function calcularMultiplicadorTipo(tipoAtaque, tiposDefensor) {
  let mult = 1.0;
  if (!tabelaTipos[tipoAtaque]) return mult;

  tiposDefensor.forEach(tipoDef => {
    const chaveDef = tipoDef.substring(0, 3);
    for (let k in tabelaTipos[tipoAtaque]) {
      if (k.toLowerCase() === chaveDef.toLowerCase()) {
        mult *= tabelaTipos[tipoAtaque][k];
      }
    }
  });
  return mult;
}

function trocarTela(idTela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  document.getElementById(idTela).classList.add('ativa');
}

function exibirTelaEscolhaTime() {
  trocarTela('tela-time');
  document.getElementById('nome-usuario-hud').innerText = usuarioLogado;

  const container = document.getElementById('container-iniciais');
  container.innerHTML = '';
  meuTime = [];

  const selecoesDisponiveis = [1, 4, 7, 16, 25];

  selecoesDisponiveis.forEach(id => {
    const p = basePokemons[id];
    const card = document.createElement('div');
    card.className = 'card-inicial';
    card.dataset.id = id;
    const sprite = p.caminhoSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    card.innerHTML = `
      <img src="${sprite}" alt="${p.nome}">
      <h4>${p.nome}</h4>
      <small>${p.tipos.join('/')}</small>
    `;

    card.onclick = () => alternarSelecaoTime(card, p);
    container.appendChild(card);
  });

  atualizarPreviewTime();
}

function alternarSelecaoTime(card, pokemonDados) {
  const index = meuTime.findIndex(p => p.id === pokemonDados.id);

  if (index >= 0) {
    meuTime.splice(index, 1);
    card.classList.remove('selecionado');
  } else {
    if (meuTime.length < 3) {
      meuTime.push(instanciarPokemon(pokemonDados, 10));
      card.classList.add('selecionado');
    }
  }

  atualizarPreviewTime();
}

function atualizarPreviewTime() {
  const container = document.getElementById('time-selecionado-preview');
  container.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot-preview';

    if (meuTime[i]) {
      slot.innerHTML = `<img src="${meuTime[i].sprite}" title="${meuTime[i].nome}">`;
    } else {
      slot.innerHTML = `<small class="text-muted">Vazio</small>`;
    }

    container.appendChild(slot);
  }

  document.getElementById('btn-confirmar-time').disabled = meuTime.length === 0;
}

function confirmarTime() {
  meuTime.forEach(p => registrarCaptura(p.id));
  salvarDadosProgresso();
  exibirTelaAreas();
}

function exibirTelaAreas() {
  trocarTela('tela-areas');
  document.getElementById('nome-usuario-hud-2').innerText = usuarioLogado;
  estatisticasFarm.emExecucao = false;
  atualizarHUDLoja();
  selecionarGeneroTreinador(generoTreinador);

  const containerTime = document.getElementById('info-meu-time');
  containerTime.innerHTML = '';

  meuTime.forEach(p => {
    const card = document.createElement('div');
    card.className = 'd-flex align-items-center gap-2 p-2 rounded border border-secondary bg-body-tertiary';
    card.innerHTML = `
      <img src="${p.sprite}" width="48" height="48" alt="${p.nome}">
      <div class="text-start">
        <strong>${p.nome}</strong> (Nv. ${p.nivel})<br>
        <small class="text-muted">HP: ${p.hpAtual}/${p.hpMax} | XP: ${p.xp}/${p.xpProximoNivel}</small>
      </div>
    `;
    containerTime.appendChild(card);
  });

  const grid = document.getElementById('grid-areas');
  grid.innerHTML = '';

  areas.forEach(area => {
    const col = document.createElement('div');
    col.className = 'col';
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-success w-100 py-3 text-start';
    btn.innerHTML = `<strong>${area.nome}</strong><br><small class="text-muted">#${area.minId} ao #${area.maxId}</small>`;
    btn.onclick = () => abrirConfiguracaoScript(area);
    col.appendChild(btn);
    grid.appendChild(col);
  });
}

function abrirConfiguracaoScript(area) {
  areaSelecionada = area;
  trocarTela('tela-estrategia');

  document.getElementById('estrategia-titulo-area').innerText = `Script de Caça: ${area.nome}`;
  meupkmnAbaSelecionadaIdx = 0;

  renderizarAbasEstrategia();
  renderizarFormularioEstrategia();
}

function renderizarAbasEstrategia() {
  const containerAbas = document.getElementById('abas-meu-time');
  containerAbas.innerHTML = '';

  meuTime.forEach((pkmn, index) => {
    const item = document.createElement('li');
    item.className = 'nav-item';
    const aba = document.createElement('button');
    aba.type = 'button';
    aba.className = `nav-link d-flex align-items-center gap-2 ${index === meupkmnAbaSelecionadaIdx ? 'active' : ''}`;
    aba.innerHTML = `<img src="${pkmn.sprite}" width="24" height="24" alt=""> <span>${pkmn.nome}</span>`;
    aba.onclick = () => {
      salvarFormularioEstrategiaAtual();
      meupkmnAbaSelecionadaIdx = index;
      renderizarAbasEstrategia();
      renderizarFormularioEstrategia();
    };
    item.appendChild(aba);
    containerAbas.appendChild(item);
  });
}

function renderizarFormularioEstrategia() {
  const meuPokemonAtual = meuTime[meupkmnAbaSelecionadaIdx];
  const container = document.getElementById('container-regras-pokemons');
  container.innerHTML = '';

  let opcoesGolpes = meuPokemonAtual.golpes.map(gKey => {
    const g = golpesDB[gKey] || { nome: gKey, custoPP: 0 };
    return `<option value="${gKey}">${g.nome} (Custo: ${g.custoPP} PP)</option>`;
  }).join('');

  for (let idInimigo = areaSelecionada.minId; idInimigo <= areaSelecionada.maxId; idInimigo++) {
    const pInimigo = basePokemons[idInimigo];
    if (!pInimigo) continue;

    const chaveRegra = `${meuPokemonAtual.id}_${idInimigo}`;
    const regraExistente = scriptAutomacao[chaveRegra] || {
      golpes: [meuPokemonAtual.golpes[0], meuPokemonAtual.golpes[0], meuPokemonAtual.golpes[0], meuPokemonAtual.golpes[0]],
      pokebola: "nenhuma"
    };

    const card = document.createElement('div');
    card.className = 'card card-regra-pkmn bg-body-tertiary border-secondary mb-2';
    card.dataset.inimigoId = idInimigo;

    const sprite = pInimigo.caminhoSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idInimigo}.png`;

    card.innerHTML = `
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-2 mb-3">
          <img src="${sprite}" alt="${pInimigo.nome}" width="40" height="40">
          <div>
            <strong>${pInimigo.nome}</strong> (#${idInimigo})
            <small class="d-block text-muted">${pInimigo.tipos.join('/')}</small>
          </div>
        </div>
        <div class="row g-2">
          <div class="col-md-6"><label class="form-label small mb-1">1ª Prioridade</label><select id="p1-pkmn-${idInimigo}" class="form-select form-select-sm">${opcoesGolpes}</select></div>
          <div class="col-md-6"><label class="form-label small mb-1">2ª Prioridade</label><select id="p2-pkmn-${idInimigo}" class="form-select form-select-sm">${opcoesGolpes}</select></div>
          <div class="col-md-6"><label class="form-label small mb-1">3ª Prioridade</label><select id="p3-pkmn-${idInimigo}" class="form-select form-select-sm">${opcoesGolpes}</select></div>
          <div class="col-md-6"><label class="form-label small mb-1">4ª Prioridade</label><select id="p4-pkmn-${idInimigo}" class="form-select form-select-sm">${opcoesGolpes}</select></div>
        </div>
        <div class="mt-3">
          <label class="form-label small" for="ball-pkmn-${idInimigo}">🎯 Tentar capturar se derrotado</label>
          <select id="ball-pkmn-${idInimigo}" class="form-select form-select-sm">
            <option value="nenhuma">Nenhuma (Não Capturar)</option>
            <option value="pokeball">🔴 Poké Ball (30%)</option>
            <option value="greatball">🔵 Great Ball (60%)</option>
            <option value="ultraball">🟡 Ultra Ball (90%)</option>
          </select>
        </div>
      </div>
    `;

    container.appendChild(card);

    const golpesSalvos = Array.isArray(regraExistente) ? regraExistente : regraExistente.golpes;
    card.querySelector(`#p1-pkmn-${idInimigo}`).value = golpesSalvos[0] || meuPokemonAtual.golpes[0];
    card.querySelector(`#p2-pkmn-${idInimigo}`).value = golpesSalvos[1] || meuPokemonAtual.golpes[0];
    card.querySelector(`#p3-pkmn-${idInimigo}`).value = golpesSalvos[2] || meuPokemonAtual.golpes[0];
    card.querySelector(`#p4-pkmn-${idInimigo}`).value = golpesSalvos[3] || meuPokemonAtual.golpes[0];
    card.querySelector(`#ball-pkmn-${idInimigo}`).value = regraExistente.pokebola || "nenhuma";
  }
}

function salvarFormularioEstrategiaAtual() {
  const meuPokemonAtual = meuTime[meupkmnAbaSelecionadaIdx];
  if (!meuPokemonAtual) return;

  const cards = document.querySelectorAll('.card-regra-pkmn');
  cards.forEach(card => {
    const idInimigo = card.dataset.inimigoId;
    const p1 = card.querySelector(`#p1-pkmn-${idInimigo}`).value;
    const p2 = card.querySelector(`#p2-pkmn-${idInimigo}`).value;
    const p3 = card.querySelector(`#p3-pkmn-${idInimigo}`).value;
    const p4 = card.querySelector(`#p4-pkmn-${idInimigo}`).value;
    const pokebola = card.querySelector(`#ball-pkmn-${idInimigo}`).value;

    const chaveRegra = `${meuPokemonAtual.id}_${idInimigo}`;
    scriptAutomacao[chaveRegra] = {
      golpes: [p1, p2, p3, p4],
      pokebola: pokebola
    };
  });
  
  salvarDadosProgresso();
}

function iniciarFarmAutomatico() {
  salvarFormularioEstrategiaAtual();
  estatisticasFarm.emExecucao = true;

  meuTime.forEach(p => {
    p.hpAtual = p.hpMax;
    p.ppAtual = p.ppMax;
  });

  pokemonAtivoIndex = 0; 

  trocarTela('tela-batalha');
  atualizarStatsFarmHUD();

  document.getElementById('log-batalha').innerHTML = `<p><em>Iniciando loop de batalha infinita...</em></p>`;
  gerarNovoInimigoEIniciarBatalha();
}

function gerarNovoInimigoEIniciarBatalha() {
  if (!estatisticasFarm.emExecucao) return;

  if (meuTime[pokemonAtivoIndex].hpAtual <= 0) {
    if (!trocarParaProximoPokemon()) return;
  }

  const idSorteado = Math.floor(Math.random() * (areaSelecionada.maxId - areaSelecionada.minId + 1)) + areaSelecionada.minId;
  const meuPokemon = meuTime[pokemonAtivoIndex];
  
  const nivelInimigo = Math.max(1, meuPokemon.nivel + Math.floor(Math.random() * 5) - 2);
  pokemonInimigo = instanciarPokemon(basePokemons[idSorteado], nivelInimigo);
  registrarAvistamento(pokemonInimigo.id);

  atualizarHUD();

  const log = document.getElementById('log-batalha');
  log.innerHTML += `<hr><p>Um <strong>${pokemonInimigo.nome}</strong> (Nv.${pokemonInimigo.nivel}) apareceu!</p>`;
  log.scrollTop = log.scrollHeight;

  executarTurnoAutomacao();
}

function executarTurnoAutomacao() {
  if (!estatisticasFarm.emExecucao) return;

  const meuPokemon = meuTime[pokemonAtivoIndex];
  meuPokemon.ppAtual = Math.min(meuPokemon.ppMax, meuPokemon.ppAtual + 10);

  const chaveRegra = `${meuPokemon.id}_${pokemonInimigo.id}`;
  const config = scriptAutomacao[chaveRegra] || { golpes: [meuPokemon.golpes[0]], pokebola: "nenhuma" };
  const prioridades = Array.isArray(config) ? config : config.golpes;

  let golpeObj = null;

  for (let gKey of prioridades) {
    if (meuPokemon.golpes.includes(gKey)) {
      const tempGolpe = golpesDB[gKey] || { nome: gKey, poder: 35, custoPP: 0, tipo: "Normal" };
      if (meuPokemon.ppAtual >= tempGolpe.custoPP) {
        golpeObj = tempGolpe;
        break;
      }
    }
  }

  if (!golpeObj) {
    const golpeBasicoKey = meuPokemon.golpes[0];
    golpeObj = golpesDB[golpeBasicoKey] || { nome: "Investida", poder: 35, custoPP: 0, tipo: "Normal" };
  }

  meuPokemon.ppAtual -= golpeObj.custoPP;

  setTimeout(() => {
    if (meuPokemon.velocidade >= pokemonInimigo.velocidade) {
      atacar(meuPokemon, pokemonInimigo, golpeObj);
      atualizarHUD();

      if (pokemonInimigo.hpAtual <= 0) {
        processarVitoriaInfinita();
        return;
      }

      atacarInimigo();
      atualizarHUD();

      if (meuPokemon.hpAtual <= 0) {
        processarMorteJogador();
        return;
      }
    } else {
      atacarInimigo();
      atualizarHUD();

      if (meuPokemon.hpAtual <= 0) {
        processarMorteJogador();
        return;
      }

      atacar(meuPokemon, pokemonInimigo, golpeObj);
      atualizarHUD();

      if (pokemonInimigo.hpAtual <= 0) {
        processarVitoriaInfinita();
        return;
      }
    }

    executarTurnoAutomacao();
  }, 600);
}

function processarVitoriaInfinita() {
  const meuPokemon = meuTime[pokemonAtivoIndex];
  const log = document.getElementById('log-batalha');

  registrarAvistamento(pokemonInimigo.id);
  registrarAbate(pokemonInimigo.id);

  // Cálculo de XP e Ouro
  const diffNivel = pokemonInimigo.nivel - meuPokemon.nivel;
  const multiplicadorDiff = Math.max(0.5, 1 + (diffNivel * 0.1));
  const bonusPokedex = temBonusXpPokedex(pokemonInimigo.id) ? 1.25 : 1;
  const xpGanha = Math.floor((pokemonInimigo.nivel * 20) * multiplicadorDiff * bonusPokedex);
  const ouroGanho = Math.floor((pokemonInimigo.nivel * 5 + Math.random() * 10) * multiplicadorDiff);

  estatisticasFarm.vitorias++;
  inventario.ouro += ouroGanho;
  estatisticasFarm.ouroTotal += ouroGanho;
  
  meuPokemon.xp += xpGanha;
  const extraXp = bonusPokedex > 1 ? ' <span class="text-warning">(Pokédex +25%)</span>' : '';
  log.innerHTML += `<p class="text-success mb-1">${pokemonInimigo.nome} foi derrotado! <strong>+${xpGanha} XP</strong>${extraXp} e 💰 <strong>+${ouroGanho} ouro</strong>!</p>`;

  // Sistema de Pokebola Automática
  const chaveRegra = `${meuPokemon.id}_${pokemonInimigo.id}`;
  const config = scriptAutomacao[chaveRegra];
  const pokebolaTipo = config?.pokebola || "nenhuma";

  if (pokebolaTipo !== "nenhuma") {
    if (inventario[pokebolaTipo] > 0) {
      inventario[pokebolaTipo]--;
      const pokebolaData = pokebolasDB[pokebolaTipo];
      const sorteio = Math.random();

      if (sorteio <= pokebolaData.chance) {
        log.innerHTML += `<p class="text-warning mb-1">🎉 <strong>Lançou ${pokebolaData.nome} e CAPTUROU ${pokemonInimigo.nome}!</strong></p>`;
        registrarCaptura(pokemonInimigo.id);
        const novoPkmn = instanciarPokemon(basePokemons[pokemonInimigo.id], pokemonInimigo.nivel);
        if (meuTime.length < 3) {
          meuTime.push(novoPkmn);
          log.innerHTML += `<p class="text-info mb-1">> ${pokemonInimigo.nome} foi adicionado à sua equipe!</p>`;
        } else {
          meuBox.push(novoPkmn);
          log.innerHTML += `<p class="mb-1" style="color: #9c27b0;">> Equipe cheia. ${pokemonInimigo.nome} foi enviado para o Box!</p>`;
        }
      } else {
        log.innerHTML += `<p style="color: #ff9800;">❌ Lançou ${pokebolaData.nome}, mas ${pokemonInimigo.nome} escapou!</p>`;
      }
    } else {
      log.innerHTML += `<p style="color: #f44336;">⚠️ Sem ${pokebolasDB[pokebolaTipo].nome}s no inventário para capturar!</p>`;
    }
  }

  // Level Up
  if (meuPokemon.xp >= meuPokemon.xpProximoNivel) {
    meuPokemon.nivel++;
    meuPokemon.xp -= meuPokemon.xpProximoNivel;
    meuPokemon.xpProximoNivel = Math.floor(meuPokemon.xpProximoNivel * 1.25);
    
    meuPokemon.hpMax += 8;
    meuPokemon.ppMax += 5;
    meuPokemon.ataque += 3;
    meuPokemon.defesa += 3;

    log.innerHTML += `<p style="color: #ffcb05;"><strong>${meuPokemon.nome} subiu para o Nível ${meuPokemon.nivel}!</strong></p>`;
  }

  log.scrollTop = log.scrollHeight;
  atualizarStatsFarmHUD();
  salvarDadosProgresso();

  setTimeout(() => gerarNovoInimigoEIniciarBatalha(), 1200);
}

function processarMorteJogador() {
  const pokemonDerrotado = meuTime[pokemonAtivoIndex];
  const log = document.getElementById('log-batalha');

  const xpPerdida = Math.floor(pokemonDerrotado.xp * 0.20);
  pokemonDerrotado.xp = Math.max(0, pokemonDerrotado.xp - xpPerdida);

  log.innerHTML += `<p style="color: #e63946;"><strong>${pokemonDerrotado.nome} foi derrotado! (-${xpPerdida} XP)</strong></p>`;
  log.scrollTop = log.scrollHeight;

  const trocou = trocarParaProximoPokemon();

  if (trocou) {
    setTimeout(() => {
      executarTurnoAutomacao();
    }, 1000);
  } else {
    log.innerHTML += `<p style="color: #ff3333;"><strong>Todos os Pokémons foram derrotados! Curando equipe e reiniciando o loop...</strong></p>`;
    log.scrollTop = log.scrollHeight;

    meuTime.forEach(p => {
      p.hpAtual = p.hpMax;
      p.ppAtual = p.ppMax;
    });

    pokemonAtivoIndex = 0;
    salvarDadosProgresso();

    setTimeout(() => {
      gerarNovoInimigoEIniciarBatalha();
    }, 1500);
  }
}

function trocarParaProximoPokemon() {
  const proximoIndex = meuTime.findIndex((p, idx) => idx > pokemonAtivoIndex && p.hpAtual > 0);

  if (proximoIndex !== -1) {
    pokemonAtivoIndex = proximoIndex;
    const novoPokemon = meuTime[pokemonAtivoIndex];

    const log = document.getElementById('log-batalha');
    log.innerHTML += `<p style="color: #2196f3;"><strong>Troca Automática! ${novoPokemon.nome} entrou na arena!</strong></p>`;
    log.scrollTop = log.scrollHeight;

    atualizarHUD();
    return true;
  }

  return false;
}

function pararFarm() {
  estatisticasFarm.emExecucao = false;
  salvarDadosProgresso();
  exibirTelaAreas();
}

function atacarInimigo() {
  const meuPokemon = meuTime[pokemonAtivoIndex];
  const golpeChave = pokemonInimigo.golpes[Math.floor(Math.random() * pokemonInimigo.golpes.length)];
  const golpe = golpesDB[golpeChave] || { nome: "Investida", poder: 35, custoPP: 0, tipo: "Normal" };
  atacar(pokemonInimigo, meuPokemon, golpe);
}

function atacar(atacante, defensor, golpe) {
  const variacaoRNG = 0.85 + (Math.random() * 0.30);
  const proporcaoAtqDef = atacante.ataque / Math.max(1, defensor.defesa);
  const multiplicadorTipo = calcularMultiplicadorTipo(golpe.tipo || "Normal", defensor.tipos);
  
  const danoBase = ((proporcaoAtqDef * golpe.poder * 0.25) + 2);
  const danoFinal = Math.max(1, Math.floor(danoBase * variacaoRNG * multiplicadorTipo));

  defensor.hpAtual = Math.max(0, defensor.hpAtual - danoFinal);

  let msgEfetividade = "";
  if (multiplicadorTipo > 1) msgEfetividade = " <span style='color: #4caf50;'>(Super Efetivo!)</span>";
  if (multiplicadorTipo < 1 && multiplicadorTipo > 0) msgEfetividade = " <span style='color: #ff9800;'>(Pouco Efetivo...)</span>";
  if (multiplicadorTipo === 0) msgEfetividade = " <span style='color: #9e9e9e;'>(Não afeta o Pokémon!)</span>";

  const log = document.getElementById('log-batalha');
  log.innerHTML += `<p>${atacante.nome} usou <strong>${golpe.nome}</strong> causando ${danoFinal} de dano.${msgEfetividade}</p>`;
  log.scrollTop = log.scrollHeight;
}

function instanciarPokemon(dados, nivel = 10) {
  const multiplicadorNivel = 1 + (nivel - 1) * 0.1;
  const hpCalculado = Math.floor((dados.atributosBase.pontosVida * 2) * multiplicadorNivel);

  return {
    id: dados.id,
    nome: dados.nome,
    nivel: nivel,
    xp: 0,
    xpProximoNivel: Math.floor(100 * Math.pow(1.25, nivel - 10)),
    tipos: dados.tipos || ["Normal"],
    hpMax: hpCalculado,
    hpAtual: hpCalculado,
    ppMax: 100,
    ppAtual: 100,
    ataque: Math.floor(dados.atributosBase.ataque * multiplicadorNivel),
    defesa: Math.floor(dados.atributosBase.defesa * multiplicadorNivel),
    velocidade: Math.floor(dados.atributosBase.velocidade * multiplicadorNivel),
    golpes: dados.golpesDisponiveis || ["investida"],
    sprite: dados.caminhoSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dados.id}.png`
  };
}

function atualizarHUD() {
  const meuPokemon = meuTime[pokemonAtivoIndex];

  document.getElementById('jogador-nome').innerText = `${meuPokemon.nome} (Nv.${meuPokemon.nivel})`;
  document.getElementById('jogador-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${meuPokemon.id}.png`;
  
  document.getElementById('jogador-hp-texto').innerText = `HP: ${meuPokemon.hpAtual} / ${meuPokemon.hpMax}`;
  document.getElementById('jogador-hp-bar').style.width = `${Math.max(0, (meuPokemon.hpAtual / meuPokemon.hpMax) * 100)}%`;
  
  document.getElementById('jogador-pp-texto').innerText = `PP: ${meuPokemon.ppAtual} / ${meuPokemon.ppMax}`;
  document.getElementById('jogador-pp-bar').style.width = `${Math.max(0, (meuPokemon.ppAtual / meuPokemon.ppMax) * 100)}%`;

  document.getElementById('inimigo-nome').innerText = `${pokemonInimigo.nome} (Nv.${pokemonInimigo.nivel})`;
  document.getElementById('inimigo-sprite').src = pokemonInimigo.sprite;
  
  document.getElementById('inimigo-hp-texto').innerText = `HP: ${pokemonInimigo.hpAtual} / ${pokemonInimigo.hpMax}`;
  document.getElementById('inimigo-hp-bar').style.width = `${Math.max(0, (pokemonInimigo.hpAtual / pokemonInimigo.hpMax) * 100)}%`;

  const containerEquipe = document.getElementById('hud-equipe-arena');
  containerEquipe.innerHTML = '';

  meuTime.forEach((p, idx) => {
    const img = document.createElement('img');
    img.src = p.sprite;
    img.className = 'icon-pkmn-arena';
    if (idx === pokemonAtivoIndex) img.classList.add('ativo');
    if (p.hpAtual <= 0) img.classList.add('derrotado');
    containerEquipe.appendChild(img);
  });
}

function atualizarStatsFarmHUD() {
  document.getElementById('stat-vitorias').innerText = estatisticasFarm.vitorias;
  document.getElementById('stat-ouro').innerText = inventario.ouro;
}

const CORES_TIPO = {
  Normal: '#9ca3af', Fogo: '#ef4444', Agua: '#3b82f6', Planta: '#22c55e',
  Eletrico: '#eab308', Voador: '#93c5fd', Veneno: '#a855f7', Inseto: '#84cc16',
  Pedra: '#a8a29e', Psiquico: '#ec4899'
};

function entradaPokedex(id) {
  const chave = String(id);
  if (!pokedexProgress[chave]) {
    pokedexProgress[chave] = { visto: false, capturado: false, abates: 0 };
  }
  return pokedexProgress[chave];
}

function sincronizarPokedexComInventario() {
  [...meuTime, ...meuBox].forEach(p => registrarCaptura(p.id));
}

function registrarAvistamento(id) {
  const entrada = entradaPokedex(id);
  entrada.visto = true;
}

function registrarAbate(id) {
  const entrada = entradaPokedex(id);
  entrada.visto = true;
  entrada.abates = (entrada.abates || 0) + 1;
}

function registrarCaptura(id) {
  const entrada = entradaPokedex(id);
  entrada.visto = true;
  entrada.capturado = true;
}

function temBonusXpPokedex(id) {
  return (entradaPokedex(id).abates || 0) >= 100;
}

function raridadePokedex(id) {
  if (id >= 144) return 'Lendário';
  if (id >= 111) return 'Raro';
  if (id >= 81) return 'Incomum';
  return 'Comum';
}

function badgeTipoHtml(tipo) {
  const cor = CORES_TIPO[tipo] || '#6b7280';
  return `<span class="badge" style="background-color:${cor};">${tipo}</span>`;
}

function abrirModalPokedex() {
  renderizarPokedex();
  obterModal('modal-pokedex').show();
}

function filtrarPokedex() {
  renderizarPokedex();
}

function renderizarPokedex() {
  const busca = (document.getElementById('pokedex-busca').value || '').trim().toLowerCase();
  const filtroTipo = document.getElementById('pokedex-filtro-tipo').value;
  const grid = document.getElementById('pokedex-grid');
  grid.innerHTML = '';

  let capturados = 0;
  let desbloqueados = 0;

  for (let id = 1; id <= 151; id++) {
    const dados = basePokemons[id];
    if (!dados) continue;

    const entrada = entradaPokedex(id);
    const capturado = !!entrada.capturado;
    const desbloqueado = !!(entrada.visto || entrada.capturado);
    if (capturado) capturados++;
    if (desbloqueado) desbloqueados++;

    if (filtroTipo !== 'todos' && !(dados.tipos || []).includes(filtroTipo)) continue;

    const nome = dados.nome || `Pokémon #${id}`;
    if (busca && !nome.toLowerCase().includes(busca) && !String(id).includes(busca)) continue;

    const sprite = dados.caminhoSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const slot = document.createElement('div');
    slot.className = `pokedex-card-slot ${desbloqueado ? '' : 'bloqueado'}`;
    slot.innerHTML = `
      ${capturado ? '<span class="badge-status badge bg-success">✓</span>' : ''}
      <img src="${sprite}" alt="${nome}">
      <span class="numero-pkmn">#${String(id).padStart(3, '0')}</span>
      <span class="nome-pkmn">${desbloqueado ? nome : '???'}</span>
    `;
    if (desbloqueado) {
      slot.onclick = () => abrirDetalhePokedex(id);
    }
    grid.appendChild(slot);
  }

  document.getElementById('pokedex-count-capturados').innerText = `${capturados}/151`;
  document.getElementById('pokedex-count-nao-capturados').innerText = String(151 - capturados);
  document.getElementById('pokedex-count-bloqueados').innerText = String(151 - desbloqueados);
  document.getElementById('pokedex-count-desbloqueados').innerText = String(desbloqueados);
}

function abrirDetalhePokedex(id) {
  const dados = basePokemons[id];
  if (!dados) return;

  const entrada = entradaPokedex(id);
  const sprite = dados.caminhoSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const abates = entrada.abates || 0;
  const progresso = Math.min(100, abates);

  document.getElementById('detalhe-pkmn-titulo').innerText = `#${String(id).padStart(3, '0')} ${dados.nome}`;
  document.getElementById('detalhe-pkmn-nome').innerText = dados.nome;
  document.getElementById('detalhe-pkmn-sprite').src = sprite;
  document.getElementById('detalhe-pkmn-tipos').innerHTML = (dados.tipos || []).map(badgeTipoHtml).join('');
  document.getElementById('detalhe-pkmn-raridade').innerText = raridadePokedex(id);

  const status = document.getElementById('detalhe-pkmn-status-captura');
  if (entrada.capturado) {
    status.className = 'small fw-bold text-success';
    status.innerText = '✓ Capturado';
  } else {
    status.className = 'small fw-bold text-warning';
    status.innerText = 'Não capturado';
  }

  document.getElementById('detalhe-pkmn-abates-texto').innerText = `${abates}/100 abates`;
  document.getElementById('detalhe-pkmn-abates-bar').style.width = `${progresso}%`;

  const bonus = document.getElementById('detalhe-pkmn-bonus');
  if (abates >= 100) {
    bonus.className = 'text-success text-center d-block fw-bold';
    bonus.style.fontSize = '11px';
    bonus.innerText = 'Bônus +25% XP Resgatado ✓';
  } else {
    bonus.className = 'text-muted text-center d-block fw-bold';
    bonus.style.fontSize = '11px';
    bonus.innerText = `Bônus +25% XP: ${abates}/100 abates`;
  }

  const attrs = dados.atributosBase || {};
  const stats = [
    ['HP', attrs.pontosVida],
    ['Ataque', attrs.ataque],
    ['Defesa', attrs.defesa],
    ['Velocidade', attrs.velocidade]
  ];
  const total = stats.reduce((acc, [, v]) => acc + (v || 0), 0);
  document.getElementById('detalhe-pkmn-stats').innerHTML = stats.map(([nome, valor]) => `
    <div class="d-flex justify-content-between small">
      <span class="text-muted">${nome}</span>
      <strong>${valor || 0}</strong>
    </div>
  `).join('');
  document.getElementById('detalhe-pkmn-stat-total').innerText = String(total);

  const tiposAtaque = Object.keys(tabelaTipos);
  document.getElementById('detalhe-pkmn-defesas').innerHTML = tiposAtaque.map(tipoAtq => {
    const mult = calcularMultiplicadorTipo(tipoAtq, dados.tipos || ['Normal']);
    const cor = CORES_TIPO[tipoAtq] || '#6b7280';
    return `
      <div class="defesa-tipo-box">
        <span class="tipo-tag" style="background:${cor};">${tipoAtq.slice(0, 3)}</span>
        <span class="multiplicador">${mult}x</span>
      </div>
    `;
  }).join('');

  obterModal('modal-pokedex-detalhes').show();
}

iniciarJogo();
