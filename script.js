// ================== VARIÁVEIS GLOBAIS ==================
let tabuleiro = ['', '', '', '', '', '', '', '', ''];
let jogadorAtual = 'X';
let jogoAtivo = true;
let placar = { X: 0, O: 0 };
let modoJogo = 'pvp';
let dificuldadeIA = 'normal';
let tempoSegundos = 0;
let timerInterval;
let animacaoAtiva = 'particles';
let canvas, ctx;
let particulas = [];

const combinacoesVencedoras = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const simbolos = { X: '❌', O: '⭕' };

// ================== INICIALIZAÇÃO ==================
document.addEventListener('DOMContentLoaded', () => {
    inicializarCelulas();
    iniciarTimer();
    inicializarCanvas();
    animarFundo();
});

// ================== CANVAS E FUNDO ANIMADO ==================
function inicializarCanvas() {
    canvas = document.getElementById('bgCanvas');
    ctx = canvas.getContext('2d');
    ajustarCanvas();
    window.addEventListener('resize', ajustarCanvas);
}

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function animarFundo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (animacaoAtiva === 'particles') desenharParticulas();
    else if (animacaoAtiva === 'matrix') desenharMatrix();
    else if (animacaoAtiva === 'stars') desenharEstrelas();
    else if (animacaoAtiva === 'waves') desenharOndas();
    
    requestAnimationFrame(animarFundo);
}

function desenharParticulas() {
    if (particulas.length < 80) {
        particulas.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            tamanho: Math.random() * 3 + 1,
            velX: (Math.random() - 0.5) * 0.5,
            velY: (Math.random() - 0.5) * 0.5,
            opacidade: Math.random() * 0.5 + 0.2
        });
    }
    
    particulas.forEach((p, i) => {
        p.x += p.velX;
        p.y += p.velY;
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            particulas.splice(i, 1);
            return;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 204, ${p.opacidade})`;
        ctx.fill();
    });
}

function desenharMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';
    for (let i = 0; i < canvas.width / 20; i++) {
        let texto = String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(texto, i * 20, Math.random() * canvas.height);
    }
}

function desenharEstrelas() {
    for (let i = 0; i < 50; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let tamanho = Math.random() * 2;
        let opacidade = Math.abs(Math.sin(Date.now() / 500 + i));
        ctx.beginPath();
        ctx.arc(x, y, tamanho, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacidade})`;
        ctx.fill();
    }
}

function desenharOndas() {
    let tempo = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 10) {
            let y = canvas.height / 2 + Math.sin(x / 80 + tempo + i) * 40 + i * 30;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 255, 204, ${0.05 + i * 0.02})`;
        ctx.fill();
    }
}

function mudarAnimacao(tipo) {
    animacaoAtiva = tipo;
    particulas = [];
}

// ================== MENU E ACORDEÃO ==================
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('aberto');
}

function toggleAccordion(id) {
    const content = document.getElementById(id);
    if (content) {
        content.classList.toggle('aberto');
        const arrow = document.getElementById('arrow-' + id);
        if (arrow) arrow.textContent = content.classList.contains('aberto') ? '▲' : '▼';
    }
}

// ================== TIMER ==================
function iniciarTimer() {
    pararTimer();
    tempoSegundos = 0;
    atualizarTimerDisplay();
    timerInterval = setInterval(() => {
        tempoSegundos++;
        atualizarTimerDisplay();
    }, 1000);
}

function pararTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function atualizarTimerDisplay() {
    let min = Math.floor(tempoSegundos / 60).toString().padStart(2, '0');
    let seg = (tempoSegundos % 60).toString().padStart(2, '0');
    const el = document.getElementById('timer');
    if (el) el.textContent = `⏱️ ${min}:${seg}`;
}

// ================== INICIALIZAR CÉLULAS ==================
function inicializarCelulas() {
    document.querySelectorAll('.celula').forEach(celula => {
        celula.addEventListener('click', () => {
            const indice = parseInt(celula.dataset.indice);
            jogar(indice);
        });
    });
}

// ================== LÓGICA PRINCIPAL DO JOGO ==================
function jogar(indice) {
    if (tabuleiro[indice] !== '' || !jogoAtivo) return;

    tabuleiro[indice] = jogadorAtual;
    atualizarVisualizacao();
    verificarFimDeJogo();
    
    if (!jogoAtivo) return;
    
    if (modoJogo === 'pvp') {
        trocarJogador();
    } else if (modoJogo === 'pve' && jogadorAtual === 'X') {
        jogadorAtual = 'O';
        atualizarVisualizacao();
        setTimeout(jogadaIA, 600);
    }
}

function atualizarVisualizacao() {
    document.querySelectorAll('.celula').forEach((c, i) => {
        c.textContent = tabuleiro[i] ? simbolos[tabuleiro[i]] : '';
    });
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = `Vez do jogador ${simbolos[jogadorAtual]}`;
}

function trocarJogador() {
    jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
    atualizarVisualizacao();
}

function verificarFimDeJogo() {
    let venceu = false;
    let indicesVencedores = [];

    for (let combinacao of combinacoesVencedoras) {
        const [a, b, c] = combinacao;
        if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c]) {
            venceu = true;
            indicesVencedores = combinacao;
            break;
        }
    }

    if (venceu) {
        jogoAtivo = false;
        placar[jogadorAtual]++;
        atualizarPlacar();
        destacarVitoria(indicesVencedores);
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = `🎉 ${simbolos[jogadorAtual]} VENCEU!`;
        pararTimer();
        if (typeof confetti === 'function') confetti();
        return;
    }

    if (!tabuleiro.includes('')) {
        jogoAtivo = false;
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = '🤝 EMPATE!';
        pararTimer();
    }
}

function destacarVitoria(indices) {
    indices.forEach(i => {
        const cel = document.querySelector(`.celula[data-indice="${i}"]`);
        if (cel) cel.classList.add('vencedora');
    });
}

function atualizarPlacar() {
    const px = document.getElementById('placarX');
    const po = document.getElementById('placarO');
    if (px) px.textContent = placar.X;
    if (po) po.textContent = placar.O;
}

// ================== INTELIGÊNCIA ARTIFICIAL ==================
function jogadaIA() {
    if (!jogoAtivo) return;

    let indice = -1;

    // NÍVEL DIFÍCIL / NORMAL
    if (dificuldadeIA !== 'facil') {
        // Tenta vencer
        for (let c of combinacoesVencedoras) {
            let [a, b, d] = c;
            let linha = [tabuleiro[a], tabuleiro[b], tabuleiro[d]];
            if (linha.filter(x => x === 'O').length === 2 && linha.includes('')) {
                indice = c.find(i => tabuleiro[i] === '');
                break;
            }
        }
        // Bloqueia o jogador
        if (indice === -1) {
            for (let c of combinacoesVencedoras) {
                let [a, b, d] = c;
                let linha = [tabuleiro[a], tabuleiro[b], tabuleiro[d]];
                if (linha.filter(x => x === 'X').length === 2 && linha.includes('')) {
                    indice = c.find(i => tabuleiro[i] === '');
                    break;
                }
            }
        }
    }

    // Centro
    if (indice === -1 && tabuleiro[4] === '') indice = 4;

    // Cantos
    if (indice === -1) {
        let cantos = [0, 2, 6, 8].filter(i => tabuleiro[i] === '');
        if (cantos.length) indice = cantos[Math.floor(Math.random() * cantos.length)];
    }

    // Qualquer espaço vazio
    if (indice === -1) {
        let vazios = tabuleiro.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        if (vazios.length) indice = vazios[Math.floor(Math.random() * vazios.length)];
    }

    if (indice !== -1) {
        tabuleiro[indice] = 'O';
        atualizarVisualizacao();
        verificarFimDeJogo();
        if (jogoAtivo) jogadorAtual = 'X';
    }
}

// ================== CONTROLES DO JOGO ==================
function reiniciarJogo() {
    tabuleiro = ['', '', '', '', '', '', '', '', ''];
    jogoAtivo = true;
    jogadorAtual = 'X';
    document.querySelectorAll('.celula').forEach(c => {
        c.textContent = '';
        c.classList.remove('vencedora');
    });
    atualizarVisualizacao();
    iniciarTimer();
}

function reiniciarPlacar() {
    placar = { X: 0, O: 0 };
    atualizarPlacar();
    reiniciarJogo();
}

function mudarModoJogo() {
    const select = document.getElementById('modoJogo');
    const dificuldadeDiv = document.getElementById('containerDificuldade');
    modoJogo = select.value;
    if (modoJogo === 'pve') {
        dificuldadeDiv.style.display = 'block';
    } else {
        dificuldadeDiv.style.display = 'none';
    }
    reiniciarJogo();
}

function mudarDificuldade() {
    const select = document.getElementById('dificuldadeIA');
    dificuldadeIA = select.value;
}

function mudarTema(tema) {
    const root = document.documentElement;
    const temas = {
        cyber: { primaria: '#00ffcc', secundaria: '#ff4081', fundo: '#0a0a0f', celula: '#1a1a2e' },
        light: { primaria: '#0077ff', secundaria: '#ff4081', fundo: '#f0f0f5', celula: '#ffffff' },
        dark: { primaria: '#8855ff', secundaria: '#ff5555', fundo: '#121212', celula: '#1e1e1e' }
    };
    const t = temas[tema] || temas.cyber;
    root.style.setProperty('--cor-primaria', t.primaria);
    root.style.setProperty('--cor-secundaria', t.secundaria);
    root.style.setProperty('--cor-fundo', t.fundo);
    root.style.setProperty('--cor-celula', t.celula);
}

function processarAutenticacao() {
    alert('Sistema de login pronto! ✅');
}
