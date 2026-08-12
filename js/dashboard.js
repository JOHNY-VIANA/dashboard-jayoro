// Atualiza a interface a partir do resumo centralizado.
let dadosDashboard = [];
let resumoDashboard = gerarResumoDados([]);

function atualizarDashboard(dados, resumo, metadados = {}) {
    dadosDashboard = Array.isArray(dados) ? dados : [];
    resumoDashboard = resumo || gerarResumoDados(dadosDashboard);
    atualizarKPIs();
    atualizarIndicadorDados(metadados);
    atualizarGraficos(resumoDashboard);
    atualizarAnalises();
    const integridade = validarIntegridadeDados(dadosDashboard, resumoDashboard);
    if (!integridade.valido) console.error("Inconsistência de dados detectada:", integridade.erros);
}

function atualizarKPIs() {
    atualizarTexto("kpiVagoes", resumoDashboard.equipamentos.length);
    atualizarTexto("kpiSistemas", `${resumoDashboard.sistemas.length}/${SISTEMAS_OBRIGATORIOS.length}`);
    atualizarTexto("kpiCriticos", resumoDashboard.criticos);
    atualizarTexto("kpiSemApontamento", resumoDashboard.semApontamento);
    atualizarPrazo();
}

function obterDataAtual() {
    const agora = new Date();

    return agora.toLocaleDateString("pt-BR");
}

function atualizarAnalises() {
    const analises = gerarAnalises(resumoDashboard);
    atualizarTexto("analiseSistemas", analises.sistemas);
    atualizarTexto("analiseMatriz", analises.matriz);
    atualizarTexto("analisePercentual", analises.percentual);
}

function atualizarIndicadorDados(metadados) {
    const elemento = document.getElementById("fonteDados");
    if (!elemento) return;
    if (!dadosDashboard.length) {
        elemento.textContent = "Nenhum conjunto de dados válido carregado.";
        return;
    }
    const momento = metadados.carregadoEm ? new Date(metadados.carregadoEm).toLocaleString("pt-BR") : "sessão atual";
    elemento.textContent = `Dados: ${metadados.origem || "conjunto persistido"} · carregados em ${momento} · ${resumoDashboard.total} registros · ${resumoDashboard.equipamentos.length} vagões`;
}

function obterEquipamentos() { return resumoDashboard.resumoVagoes; }
function obterSistemas() { return resumoDashboard.sistemasExecutados; }

Object.assign(window, { atualizarDashboard, atualizarPrazo, atualizarAnalises, obterEquipamentos, obterSistemas, obterResumoDashboard: () => resumoDashboard });
