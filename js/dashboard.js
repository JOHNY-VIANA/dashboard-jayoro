// ======================================================
// DASHBOARD.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// ======================================================



// Dados atuais

let dadosDashboard = [];

let resumoDashboard = {};





// ======================================================
// RECEBER DADOS DO EXCEL
// ======================================================


function atualizarDashboard(
    dados,
    resumo
){



    dadosDashboard = dados;


    resumoDashboard = resumo;





    console.log(

        "Dashboard atualizado:",

        resumoDashboard

    );






    atualizarKPIs();






    // Atualiza gráficos

    if(

        typeof atualizarGraficos === "function"

    ){



        atualizarGraficos(

            dadosDashboard

        );


    }



}


// ======================================================
// ATUALIZAR CARDS KPI
// ======================================================


function atualizarKPIs(){


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
    // PRAZO
    // =============================


    const dias =


        calcularDiasRestantes(

            "2026-08-12"

        );





    atualizarTexto(

        "kpiPrazo",

        dias


    );





}









// ======================================================
// LISTAS AUXILIARES
// ======================================================



function obterEquipamentos(){


    return agruparPor(

        dadosDashboard,

        "equipamento"

    );


}








function obterSistemas(){


    return agruparPor(

        dadosDashboard,

        "sistema"

    );


}








function obterComponentes(){


    return agruparPor(

        dadosDashboard,

        "componente"

    );


}








function obterTarefas(){


    return agruparPor(

        dadosDashboard,

        "tarefa"

    );


}









// ======================================================
// ATUALIZAR PRAZO
// ======================================================


function atualizarPrazo(){



    const dias =


        calcularDiasRestantes(

            "2026-08-12"

        );





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

    ()=>{


        atualizarPrazo();



        if(

            typeof logDashboard === "function"

        ){


            logDashboard(

                "Dashboard iniciado"

            );


        }



    }

);









// ======================================================
// EXPORTAR
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