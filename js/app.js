// ======================================================
// APP.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// Controle principal da aplicação
// ======================================================


// ======================================================
// INICIALIZAÇÃO DO SISTEMA
// ======================================================


function iniciarDashboard(){



    console.log(
        "%c🚂 Dashboard Jayoro iniciado",
        "color:#2563eb;font-weight:bold;font-size:14px;"
    );



    verificarModulos();



    configurarEventos();



}



// ======================================================
// VERIFICAR ARQUIVOS CARREGADOS
// ======================================================


function verificarModulos(){



    const modulos = {


        XLSX:

            typeof XLSX !== "undefined",



        Utils:

            typeof atualizarTexto === "function",



        Excel:

            typeof importarExcel === "function",



        Dashboard:

            typeof atualizarDashboard === "function",



        Charts:

            typeof atualizarGraficos === "function"


    };





    console.table(
        modulos
    );



    const falhas =

        Object.entries(modulos)

        .filter(
            ([,valor]) =>
            !valor
        );



    if(falhas.length){


        console.warn(

            "Módulos ausentes:",

            falhas

        );


    }
    else{


        console.log(

            "Todos os módulos carregados com sucesso."

        );


    }



}



// ======================================================
// EVENTOS DA INTERFACE
// ======================================================


function configurarEventos(){



    const inputExcel =

        document.getElementById(
            "arquivoExcel"
        );





    if(inputExcel){


        inputExcel.addEventListener(

            "change",

            importarExcel

        );


        console.log(

            "Evento Excel conectado."

        );


    }


}



// ======================================================
// ATUALIZAR PRAZO AUTOMÁTICO
// ======================================================


function iniciarRelogioPrazo(){



    atualizarPrazo();



    setInterval(

        ()=>{

            atualizarPrazo();

        },

        86400000

    );


}



// ======================================================
// START
// ======================================================


window.addEventListener(

    "DOMContentLoaded",

    ()=>{


        iniciarDashboard();


        iniciarRelogioPrazo();


    }

);



// ======================================================
// EXPORTAR
// ======================================================


window.iniciarDashboard =
    iniciarDashboard;