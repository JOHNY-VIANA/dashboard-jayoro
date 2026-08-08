// ======================================================
// EXCEL.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// ======================================================


// Dados globais

let dadosExcel = [];

let resumoExcel = {};




// ======================================================
// CARREGAR EXCEL AUTOMÁTICO
// data/reforma.xlsx
// ======================================================

async function carregarExcelAutomatico(){


    try{


        console.log(
            "Carregando reforma.xlsx..."
        );


        const resposta =
            await fetch(
                "./data/reforma.xlsx"
            );  



        if(!resposta.ok){


            throw new Error(
                "Arquivo reforma.xlsx não encontrado"
            );


        }




        const buffer =

            await resposta.arrayBuffer();




        lerExcel(buffer);



    }

    catch(error){


        console.error(
            "Erro ao carregar Excel:",
            error
        );


    }


}







// ======================================================
// IMPORTAR ARQUIVO MANUAL
// ======================================================

function importarExcel(event){



    const arquivo =

        event.target.files[0];



    if(!arquivo){


        console.warn(
            "Nenhum arquivo selecionado."
        );


        return;


    }





    const leitor =

        new FileReader();





    leitor.onload = function(e){


        lerExcel(
            e.target.result
        );


    };




    leitor.readAsArrayBuffer(
        arquivo
    );


}








// ======================================================
// LER EXCEL
// ======================================================


function lerExcel(buffer){



    const dados =

        new Uint8Array(
            buffer
        );





    const workbook =

        XLSX.read(
            dados,
            {
                type:"array"
            }
        );





    const primeiraAba =

        workbook.SheetNames[0];





    const planilha =

        workbook.Sheets[
            primeiraAba
        ];





    dadosExcel =

        XLSX.utils.sheet_to_json(
            planilha,
            {
                defval:""
            }
        );





    console.log(
        "Excel carregado:",
        dadosExcel
    );





    processarDadosExcel();


}









// ======================================================
// TRATAMENTO DOS DADOS
// ======================================================


function processarDadosExcel(){



    if(!dadosExcel.length){


        console.warn(
            "Planilha vazia."
        );


        return;


    }





    dadosExcel =

        dadosExcel.map(item => {



            return {


                ...item,



                // ==========================
                // EQUIPAMENTO
                // ==========================

                equipamento:


                    item.EQUIPAMENTO ||

                    item.Equipamento ||

                    item.equipamento ||

                    "Não informado",





                // ==========================
                // Nº O.S
                // ==========================

                os:


                    item["Nº O.S"] ||

                    item["N° O.S"] ||

                    item.OS ||

                    item.Ordem ||

                    "",





                // ==========================
                // DATA
                // ==========================

                data:


                    item.DATA ||

                    item.Data ||

                    "",





                // ==========================
                // TAREFA
                // ==========================

                tarefa:


                    item.TAREFA ||

                    item.Tarefa ||

                    "",





                // ==========================
                // DESTINO
                // ==========================

                destino:


                    item.DESTINO ||

                    item.Destino ||

                    "",





                // ==========================
                // SISTEMA
                // ==========================

                sistema:


                    item.SISTEMA ||

                    item.Sistema ||

                    "Não informado",





                // ==========================
                // COMPONENTE
                // ==========================

                componente:


                    item.COMPONENTE ||

                    item.Componente ||

                    ""



            };


        });





    gerarResumoExcel();



}









// ======================================================
// GERAR INDICADORES
// ======================================================


function gerarResumoExcel(){



    resumoExcel = {



        // Total de registros

        total:

            dadosExcel.length,






        // Equipamentos únicos

        equipamentos:


            [

                ...new Set(

                    dadosExcel.map(

                        item =>
                        item.equipamento

                    )

                )

            ],







        // Sistemas únicos

        sistemas:


            [

                ...new Set(

                    dadosExcel.map(

                        item =>
                        item.sistema

                    )

                )

            ],






        // Componentes únicos

        componentes:


            [

                ...new Set(

                    dadosExcel.map(

                        item =>
                        item.componente

                    )

                )

            ],






        // Total de OS

        ordensServico:


            dadosExcel.filter(

                item =>

                item.os !== ""

            ).length,







        // Tarefas

        tarefas:


            [

                ...new Set(

                    dadosExcel.map(

                        item =>
                        item.tarefa

                    )

                )

            ]



    };







    console.log(

        "Resumo gerado:",

        resumoExcel

    );








    if(

        typeof atualizarDashboard === "function"

    ){



        atualizarDashboard(

            dadosExcel,

            resumoExcel

        );


    }




}









// ======================================================
// EXPORTAR EXCEL
// ======================================================


function exportarExcel(){



    if(!dadosExcel.length){



        alert(

            "Nenhum dado para exportar."

        );



        return;


    }






    const planilha =


        XLSX.utils.json_to_sheet(

            dadosExcel

        );







    const arquivo =


        XLSX.utils.book_new();







    XLSX.utils.book_append_sheet(

        arquivo,

        planilha,

        "Reforma"

    );







    XLSX.writeFile(

        arquivo,

        "Relatorio_Jayoro.xlsx"

    );



}









// ======================================================
// INICIALIZAÇÃO
// ======================================================


window.addEventListener(

    "DOMContentLoaded",

    ()=>{


        carregarExcelAutomatico();


    }

);









// ======================================================
// EXPORTAR
// ======================================================


window.importarExcel =

    importarExcel;



window.exportarExcel =

    exportarExcel;



window.dadosExcel =

    dadosExcel;



window.resumoExcel =

    resumoExcel;