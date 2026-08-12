// ======================================================
// DASHBOARD.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// ======================================================

// ======================================================
// DADOS CENTRAIS DO DASHBOARD
// ======================================================

let dadosDashboard = [];

let resumoDashboard = gerarResumoDados([]);


// ======================================================
// ATUALIZAR DASHBOARD
// ======================================================

function atualizarDashboard(dados, resumo, metadados = {}) {

    dadosDashboard = Array.isArray(dados)
        ? dados
        : [];

    resumoDashboard =
        resumo ||
        gerarResumoDados(dadosDashboard);


    // Atualiza KPIs
    atualizarKPIs();


    // Atualiza indicador da origem dos dados
    atualizarIndicadorDados(metadados);


    // Atualiza gráficos
    atualizarGraficos(resumoDashboard);


    // Atualiza análises
    atualizarAnalises();


    // Validação de integridade
    const integridade =
        validarIntegridadeDados(
            dadosDashboard,
            resumoDashboard
        );


    if (!integridade.valido) {

        console.error(
            "Inconsistência de dados detectada:",
            integridade.erros
        );

    }

}


// ======================================================
// ATUALIZAR KPIs
// ======================================================

function atualizarKPIs() {

    // Total de vagões
    atualizarTexto(
        "kpiVagoes",
        resumoDashboard.equipamentos.length
    );


    // Sistemas apontados / sistemas obrigatórios
    atualizarTexto(
        "kpiSistemas",
        `${resumoDashboard.sistemas.length}/${SISTEMAS_OBRIGATORIOS.length}`
    );


    // Vagões críticos
    atualizarTexto(
        "kpiCriticos",
        resumoDashboard.criticos
    );


    // Vagões sem apontamento
    atualizarTexto(
        "kpiSemApontamento",
        resumoDashboard.semApontamento
    );


    // Prazo / dias do período
    atualizarPrazo();

}


// ======================================================
// CALCULAR QUANTIDADE DE DIAS DO PERÍODO
// ======================================================

function calcularDiasPeriodo() {

    /*
     * Data inicial da análise.
     *
     * IMPORTANTE:
     * Não altere esta data para a data atual.
     *
     * O período da base começa em:
     * 01/11/2025
     */

    const inicio =
        new Date("2025-11-01T00:00:00");


    /*
     * Data atual do computador/navegador.
     *
     * Essa data é obtida automaticamente.
     */

    const hoje =
        new Date();


    // Remove horário para evitar problemas
    // de fuso horário ou horário de verão.

    inicio.setHours(0, 0, 0, 0);

    hoje.setHours(0, 0, 0, 0);


    // Calcula diferença em milissegundos

    const diferenca =
        hoje.getTime() -
        inicio.getTime();


    // Converte milissegundos para dias

    const dias =
        Math.floor(
            diferenca /
            (1000 * 60 * 60 * 24)
        );


    return dias;

}


// ======================================================
// OBTER DATA ATUAL
// ======================================================

function obterDataAtual() {

    const agora =
        new Date();


    return agora.toLocaleDateString(
        "pt-BR"
    );

}


// ======================================================
// ATUALIZAR PRAZO
// ======================================================

function atualizarPrazo() {

    /*
     * Calcula automaticamente a quantidade
     * de dias desde 01/11/2025 até a data atual.
     */

    const dias =
        calcularDiasPeriodo();


    atualizarTexto(
        "kpiPrazo",
        dias
    );


    /*
     * IMPORTANTE:
     *
     * periodoDados continua mostrando o período
     * real da base de dados.
     *
     * Exemplo:
     *
     * 01/11/2025 — 10/08/2026
     *
     * Não substituímos essa informação pela
     * data atual.
     */

    const elemento =
        document.getElementById(
            "periodoDados"
        );


    if (elemento) {

        elemento.textContent =
            typeof PERIODO_PROJETO !== "undefined"
                ? PERIODO_PROJETO
                : "Período não informado";

    }

}


// ======================================================
// ATUALIZAR ANÁLISES
// ======================================================

function atualizarAnalises() {

    const analises =
        gerarAnalises(
            resumoDashboard
        );


    atualizarTexto(
        "analiseSistemas",
        analises.sistemas
    );


    atualizarTexto(
        "analiseMatriz",
        analises.matriz
    );


    atualizarTexto(
        "analisePercentual",
        analises.percentual
    );

}


// ======================================================
// ATUALIZAR INDICADOR DOS DADOS
// ======================================================

function atualizarIndicadorDados(
    metadados = {}
) {

    const elemento =
        document.getElementById(
            "fonteDados"
        );


    if (!elemento) {
        return;
    }


    // Nenhum dado carregado

    if (!dadosDashboard.length) {

        elemento.textContent =
            "Nenhum conjunto de dados válido carregado.";

        return;

    }


    /*
     * Se existir uma data de carregamento
     * nos metadados, utiliza essa informação.
     *
     * Caso contrário, informa "sessão atual".
     */

    const momento =
        metadados.carregadoEm
            ? new Date(
                metadados.carregadoEm
              ).toLocaleString("pt-BR")
            : "sessão atual";


    const origem =
        metadados.origem ||
        "conjunto persistido";


    elemento.textContent =
        `Dados: ${origem} · ` +
        `carregados em ${momento} · ` +
        `${resumoDashboard.total} registros · ` +
        `${resumoDashboard.equipamentos.length} vagões`;

}


// ======================================================
// OBTER EQUIPAMENTOS
// ======================================================

function obterEquipamentos() {

    return resumoDashboard.resumoVagoes;

}


// ======================================================
// OBTER SISTEMAS
// ======================================================

function obterSistemas() {

    return resumoDashboard.sistemasExecutados;

}


// ======================================================
// EXPOR FUNÇÕES GLOBALMENTE
// ======================================================

Object.assign(
    window,
    {

        atualizarDashboard,

        atualizarPrazo,

        calcularDiasPeriodo,

        obterDataAtual,

        atualizarAnalises,

        obterEquipamentos,

        obterSistemas,

        obterResumoDashboard:
            () => resumoDashboard

    }
);
