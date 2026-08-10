// Todos os gráficos consomem o mesmo resumo produzido em utils.js.
let graficos = {};
const CORES_SISTEMAS = ["#D35400", "#3498DB", "#2ECC71", "#E67E22", "#F1C40F", "#E74C3C", "#16A085", "#1ABC9C", "#7F8C8D"];
let sistemasFiltradosMatriz = new Set();
let resumoMatrizAtual = null;

function escaparHtml(valor) {
    return String(valor).replace(/[&<>'"]/g, caractere => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[caractere]);
}

function destruirGraficos() {
    Object.values(graficos).forEach(grafico => grafico?.destroy());
    graficos = {};
}

function configurarAltura(canvas, quantidade, porLinha, minimo) {
    const altura = Math.max(minimo, quantidade * porLinha + 110);
    canvas.parentElement.style.height = `${altura}px`;
    canvas.style.height = `${altura}px`;
}

function opcoesBase() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { labels: { color: "#D8E0D8", font: { family: "Poppins", size: 11 } } },
            tooltip: { backgroundColor: "#172117", titleColor: "#fff", bodyColor: "#fff", borderColor: "#49B96D", borderWidth: 1 }
        }
    };
}

function criarGraficoSistemas(resumo) {
    const canvas = document.getElementById("graficoSistemas");
    if (!canvas) return;
    const entradas = Object.entries(resumo.sistemasExecutados).sort((a, b) => b[1] - a[1]);
    configurarAltura(canvas, entradas.length, 38, 250);
    graficos.sistemas = new Chart(canvas, {
        type: "bar",
        data: { labels: entradas.map(([sistema]) => sistema), datasets: [{ label: "Registros", data: entradas.map(([, total]) => total), backgroundColor: "#49B96D", borderRadius: 5 }] },
        options: {
            ...opcoesBase(), indexAxis: "y",
            plugins: { ...opcoesBase().plugins, legend: { display: false } },
            scales: {
                x: { beginAtZero: true, ticks: { precision: 0, color: "#D8E0D8" }, grid: { color: "rgba(255,255,255,.08)" } },
                y: { ticks: { autoSkip: false, color: "#D8E0D8", font: { family: "Poppins", size: 11 } }, grid: { display: false } }
            }
        }
    });
}

function criarGraficoMatriz(resumo) {
    const container = document.getElementById("graficoMatriz");
    if (!container) return;
    resumoMatrizAtual = resumo;
    const vagoes = resumo.resumoVagoes;
    const sistemasVisiveis = SISTEMAS_OBRIGATORIOS.filter(sistema => !sistemasFiltradosMatriz.size || sistemasFiltradosMatriz.has(sistema));
    container.innerHTML = "";
    const tabela = document.createElement("table");
    tabela.className = "matriz-tabela";
    const cabecalho = document.createElement("thead");
    cabecalho.innerHTML = `<tr><th scope="col">Sistema</th>${vagoes.map(item => `<th scope="col">${escaparHtml(item.equipamento)}</th>`).join("")}</tr>`;
    tabela.append(cabecalho);
    const corpo = document.createElement("tbody");
    sistemasVisiveis.forEach(sistema => {
        const indice = SISTEMAS_OBRIGATORIOS.indexOf(sistema);
        const linha = document.createElement("tr");
        linha.innerHTML = `<th scope="row"><span class="cor-sistema" style="background:${CORES_SISTEMAS[indice]}"></span>${sistema}</th>`;
        vagoes.forEach(vagao => {
            const celula = document.createElement("td");
            const apontado = vagao.sistemas.has(sistema);
            celula.className = apontado ? "matriz-apontado" : "matriz-pendente";
            celula.style.setProperty("--cor-sistema", CORES_SISTEMAS[indice]);
            celula.title = `${vagao.equipamento} — ${sistema}: ${apontado ? "apontado" : "pendente"}`;
            celula.setAttribute("aria-label", celula.title);
            linha.append(celula);
        });
        corpo.append(linha);
    });
    tabela.append(corpo);
    container.append(tabela);
    renderizarFiltrosMatriz();
}

function renderizarFiltrosMatriz() {
    const area = document.getElementById("filtrosMatriz");
    const estado = document.getElementById("estadoFiltroMatriz");
    if (!area || !resumoMatrizAtual) return;
    area.innerHTML = "";
    const criarBotao = (texto, ativo, acao) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `filtro-sistema${ativo ? " ativo" : ""}`;
        botao.textContent = texto;
        botao.setAttribute("aria-pressed", String(ativo));
        botao.addEventListener("click", acao);
        area.append(botao);
    };
    criarBotao("Todos", sistemasFiltradosMatriz.size === 0, () => { sistemasFiltradosMatriz.clear(); criarGraficoMatriz(resumoMatrizAtual); });
    SISTEMAS_OBRIGATORIOS.forEach((sistema, indice) => {
        criarBotao(sistema, sistemasFiltradosMatriz.has(sistema), () => {
            if (sistemasFiltradosMatriz.has(sistema)) sistemasFiltradosMatriz.delete(sistema);
            else sistemasFiltradosMatriz.add(sistema);
            criarGraficoMatriz(resumoMatrizAtual);
        });
        area.lastElementChild.style.setProperty("--cor-sistema", CORES_SISTEMAS[indice]);
    });
    if (estado) estado.textContent = sistemasFiltradosMatriz.size
        ? `Sistemas filtrados: ${[...sistemasFiltradosMatriz].join(" + ")}. A lista abaixo continua considerando os 9 sistemas obrigatórios.`
        : "Exibindo todos os 9 sistemas obrigatórios.";
}

function criarResumoPendencias(resumo) {
    const area = document.getElementById("resumoPendencias");
    if (!area) return;
    const vagoes = [...resumo.resumoVagoes].sort((a, b) => b.faltantes.length - a.faltantes.length || a.equipamento.localeCompare(b.equipamento, "pt-BR", { numeric: true }));
    area.innerHTML = `<h3>Pendências para 100%</h3><p class="subtitulo-resumo">Lista completa baseada nos 9 sistemas obrigatórios, independente do filtro visual.</p>`;
    const lista = document.createElement("div");
    lista.className = "lista-pendencias";
    vagoes.forEach(vagao => {
        const item = document.createElement("article");
        item.className = `pendencia-vagao ${vagao.faltantes.length ? "com-pendencia" : "concluido"}`;
        const titulo = document.createElement("h4");
        titulo.textContent = `${vagao.equipamento} — ${vagao.faltantes.length ? `${vagao.faltantes.length} sistema(s) pendente(s)` : "Reforma 100%"}`;
        item.append(titulo);
        if (!vagao.faltantes.length) {
            const texto = document.createElement("p");
            texto.textContent = "✓ Todos os sistemas obrigatórios possuem apontamento.";
            item.append(texto);
        } else {
            if (vagao.apontados === 0) {
                const alerta = document.createElement("p");
                alerta.textContent = "⚠ Nenhum sistema possui apontamento.";
                item.append(alerta);
            }
            const pendencias = document.createElement("ul");
            vagao.faltantes.forEach(sistema => { const linha = document.createElement("li"); linha.textContent = sistema; pendencias.append(linha); });
            item.append(pendencias);
        }
        lista.append(item);
    });
    area.append(lista);
}

function criarGraficoPercentualSistemas(resumo) {
    const canvas = document.getElementById("graficoPercentualSistemas");
    if (!canvas) return;
    const vagoes = resumo.resumoVagoes;
    configurarAltura(canvas, vagoes.length, 42, 500);
    graficos.percentualSistemas = new Chart(canvas, {
        type: "bar",
        data: {
            labels: vagoes.map(item => item.equipamento),
            datasets: [
                { label: "Sistemas apontados (%)", data: vagoes.map(item => Number(item.percentual.toFixed(1))), backgroundColor: "#49B96D" },
                { label: "Sistemas pendentes (%)", data: vagoes.map(item => Number((100 - item.percentual).toFixed(1))), backgroundColor: "#C44536" }
            ]
        },
        options: {
            ...opcoesBase(), indexAxis: "y",
            interaction: { mode: "nearest", intersect: true },
            plugins: {
                ...opcoesBase().plugins,
                tooltip: {
                    ...opcoesBase().plugins.tooltip,
                    callbacks: {
                        title: contextos => `Vagão: ${contextos[0].label}`,
                        label: contexto => `${contexto.dataset.label}: ${contexto.raw}%`,
                        afterBody: contextos => {
                            const item = vagoes[contextos[0].dataIndex];
                            return [`Sistemas: ${item.apontados}/${SISTEMAS_OBRIGATORIOS.length}`, `Status: ${item.status}`, item.faltantes.length ? `Pendentes: ${item.faltantes.join(", ")}` : "Todos os sistemas apontados"];
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true, min: 0, max: 100, ticks: { stepSize: 10, color: "#D8E0D8", callback: valor => `${valor}%` }, title: { display: true, text: "Percentual de sistemas obrigatórios", color: "#D8E0D8" }, grid: { color: "rgba(255,255,255,.08)" } },
                y: { stacked: true, ticks: { autoSkip: false, color: "#D8E0D8", padding: 8, font: { family: "Poppins", size: 11, weight: "500" } }, grid: { display: false } }
            }
        }
    });
}

function atualizarGraficos(resumo) {
    destruirGraficos();
    criarGraficoSistemas(resumo);
    criarGraficoMatriz(resumo);
    criarResumoPendencias(resumo);
    criarGraficoPercentualSistemas(resumo);
}

Object.assign(window, { atualizarGraficos, destruirGraficos, CORES_SISTEMAS });
