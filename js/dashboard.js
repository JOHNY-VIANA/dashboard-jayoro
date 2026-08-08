// ======================================================
// DASHBOARD.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// ======================================================


// ======================================================
// DADOS ATUAIS
// ======================================================

let dadosDashboard = [];

let resumoDashboard = {};


// ======================================================
// RECEBER DADOS DO EXCEL
// ======================================================

function atualizarDashboard(
    dados,
    resumo
) {

    dadosDashboard = dados;

    resumoDashboard = resumo;


    console.log(
        "Dashboard atualizado:",
        resumoDashboard
    );


    atualizarKPIs();


    // ==================================================
    // ATUALIZA GRÁFICOS
    // ==================================================

    if (
        typeof atualizarGraficos === "function"
    ) {

        atualizarGraficos(
            dadosDashboard
        );

    }

}


// ======================================================
// ATUALIZAR CARDS KPI
// ======================================================

function atualizarKPIs() {


    // =============================
    // EQUIPAMENTOS
    // =============================

    atualizarTexto(
        "kpiVagoes",
        resumoDashboard
            .equipamentos
            ?.length || 0
    );


    // =============================
    // SISTEMAS
    // =============================

    atualizarTexto(
        "kpiSistemas",
        resumoDashboard
            .sistemas
            ?.length || 0
    );


    // =============================
    // ORDENS DE SERVIÇO
    // =============================

    atualizarTexto(
        "kpiOS",
        resumoDashboard
            .ordensServico || 0
    );


    // =============================
    // PERÍODO DOS DADOS
    // =============================

    atualizarPrazo();

}


// ======================================================
// LISTAS AUXILIARES
// ======================================================

function obterEquipamentos() {

    return agruparPor(
        dadosDashboard,
        "equipamento"
    );

}


function obterSistemas() {

    return agruparPor(
        dadosDashboard,
        "sistema"
    );

}


function obterComponentes() {

    return agruparPor(
        dadosDashboard,
        "componente"
    );

}


function obterTarefas() {

    return agruparPor(
        dadosDashboard,
        "tarefa"
    );

}


// ======================================================
// ATUALIZAR PERÍODO DOS DADOS
// ======================================================

function atualizarPrazo() {


    // =============================
    // DATA INICIAL DOS DADOS
    // =============================

    const dataInicio = new Date(
        "2025-11-01T00:00:00"
    );


    // =============================
    // DATA FINAL DOS DADOS
    // =============================

    const dataFim = new Date(
        "2026-08-08T00:00:00"
    );


    // =============================
    // DIFERENÇA ENTRE AS DATAS
    // =============================

    const diferencaMs =
        dataFim - dataInicio;


    const dias =
        Math.floor(
            diferencaMs /
            (1000 * 60 * 60 * 24)
        ) + 1;


    // =============================
    // ATUALIZAR KPI
    // =============================

    atualizarTexto(
        "kpiPrazo",
        dias
    );

}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {


        // =============================
        // ATUALIZA PERÍODO DOS DADOS
        // =============================

        atualizarPrazo();


        // =============================
        // LOG DO DASHBOARD
        // =============================

        if (
            typeof logDashboard === "function"
        ) {

            logDashboard(
                "Dashboard iniciado"
            );

        }

    }
);


// ======================================================
// EXPORTAR FUNÇÕES
// ======================================================

window.atualizarDashboard =
    atualizarDashboard;


window.obterEquipamentos =
    obterEquipamentos;


window.obterSistemas =
    obterSistemas;


window.obterComponentes =
    obterComponentes;


window.obterTarefas =
    obterTarefas;