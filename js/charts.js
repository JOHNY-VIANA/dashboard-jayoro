// ======================================================
// CHARTS.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// ======================================================

// Guarda gráficos ativos
let graficos = {};



// ======================================================
// ATUALIZAR TODOS OS GRÁFICOS
// ======================================================

function atualizarGraficos(dados){

    destruirGraficos();

    criarGraficoSistemas(dados);

    criarGraficoCriticos(dados);

    criarGraficoMatriz(dados);

    criarGraficoEvolucao(dados);

}



// ======================================================
// DESTRUIR GRÁFICOS
// ======================================================

function destruirGraficos(){

    Object.values(graficos).forEach(grafico => {

        if(grafico){

            grafico.destroy();

        }

    });

    graficos = {};

}



// ======================================================
// 1 - SISTEMAS MAIS EXECUTADOS
// ======================================================

function criarGraficoSistemas(dados){

    const agrupado = agruparPor(
        dados,
        "sistema"
    );


    const ordenado = ordenarMaior(
        agrupado
    );


    const labels = Object.keys(ordenado)
        .slice(0, 10);


    const valores = Object.values(ordenado)
        .slice(0, 10);


    const elemento = document.getElementById(
        "graficoSistemas"
    );


    if(!elemento){

        console.warn(
            "Elemento graficoSistemas não encontrado."
        );

        return;

    }


    graficos.sistemas = new Chart(

        elemento,

        {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{

                    label: "Execuções",

                    data: valores

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        }

    );

}



// ======================================================
// 2 - EQUIPAMENTOS COM MAIOR DEMANDA
// ======================================================

function criarGraficoCriticos(dados){

    const agrupado = agruparPor(
        dados,
        "equipamento"
    );


    const lista = Object.entries(
        agrupado
    )

    .sort(
        (a, b) => b[1] - a[1]
    )

    .slice(0, 10);


    const elemento = document.getElementById(
        "graficoCriticos"
    );


    if(!elemento){

        console.warn(
            "Elemento graficoCriticos não encontrado."
        );

        return;

    }


    graficos.criticos = new Chart(

        elemento,

        {

            type: "bar",

            data: {

                labels: lista.map(
                    item => item[0]
                ),

                datasets: [{

                    label: "Nº de O.S",

                    data: lista.map(
                        item => item[1]
                    )

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        }

    );

}



// ======================================================
// 3 - MATRIZ EQUIPAMENTO x SISTEMA
// ======================================================

function criarGraficoMatriz(dados){

    const matriz = {};


    dados.forEach(item => {

        const equipamento =
            item.equipamento ||
            "Não informado";


        const sistema =
            item.sistema ||
            "Não informado";


        if(!matriz[equipamento]){

            matriz[equipamento] = {};

        }


        matriz[equipamento][sistema] = 1;

    });



    const equipamentos = Object.keys(
        matriz
    );



    const sistemas = [

        ...new Set(

            dados.map(

                item =>
                    item.sistema ||
                    "Não informado"

            )

        )

    ];



    // ==================================================
    // CORES FIXAS DOS SISTEMAS
    // Cada sistema possui UMA cor exclusiva
    // ==================================================

    const coresSistemas = {

        "RODANTE(PNEUS)": "#F1C40F",   // Amarelo
        "RODANTE (PNEUS)": "#F1C40F",  // Amarelo
        "ESTRUTURA": "#2ECC71",        // Verde Claro
        "CHASSI": "#E67E22",           // Laranja
        "EIXO TRASEIRO": "#34495E",    // Azul Grafite / Escuro
        "FREIO": "#E74C3C",            // Vermelho
        "FREIOS": "#E74C3C",           // Vermelho
        "PNEUMATICO": "#3498DB",       // Azul Claro
        "PNEUMÁTICO": "#3498DB",       // Azul Claro
        "EIXO DIANTEIRO": "#1ABC9C",   // Verde Água / Turquesa
        "ENGATE": "#9B59B6",           // Roxo
        "ELÉTRICO": "#16A085",         // Verde Azulado Escuro (Teal)
        "ELÉTRICA": "#16A085",         // Verde Azulado Escuro (Teal)
        "PQS & MATERIAIS": "#F39C12",  // Amarelo Ouro / Âmbar
        "SUSPENSAO": "#D35400",        // Laranja Escuro / Ferrugem
        "SUSPENSÃO": "#D35400",        // Laranja Escuro / Ferrugem
        "IMPLEMENTO": "#E84393"        // Rosa Choque / Magenta

    };



    // ==================================================
    // CORES DE RESERVA
    // Usadas somente se aparecer um sistema novo
    // ==================================================

    const coresPadrao = [

        "#16A085",

        "#C0392B",

        "#8E44AD",

        "#2C3E50",

        "#D35400",

        "#7F8C8D",

        "#2980B9",

        "#27AE60",

        "#F39C12",

        "#1ABC9C"

    ];



    const elemento = document.getElementById(
        "graficoMatriz"
    );


    if(!elemento){

        console.warn(
            "Elemento graficoMatriz não encontrado."
        );

        return;

    }



    graficos.matriz = new Chart(

        elemento,

        {

            type: "bar",

            data: {

                labels: equipamentos,

                datasets:

                    sistemas.map(

                        (sistema, index) => {

                            const cor =
                                coresSistemas[sistema] ||
                                coresPadrao[
                                    index %
                                    coresPadrao.length
                                ];


                            return {

                                label: sistema,

                                data:

                                    equipamentos.map(

                                        equipamento =>

                                            matriz[
                                                equipamento
                                            ][sistema] || 0

                                    ),

                                backgroundColor: cor,

                                borderColor: cor,

                                borderWidth: 1

                            };

                        }

                    )

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom"

                    }

                },

                scales: {

                    x: {

                        stacked: true

                    },

                    y: {

                        stacked: true,

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        }

    );

}



// ======================================================
// 4 - EVOLUÇÃO DA REFORMA
// ======================================================

function criarGraficoEvolucao(dados) {

    const datas = {};

    // ==================================================
    // AGRUPAR APONTAMENTOS POR DATA
    // ==================================================

    dados.forEach(item => {

        const data = item.data || "Sem data";

        datas[data] = (datas[data] || 0) + 1;

    });


    // ==================================================
    // ORGANIZAR DATAS
    // ==================================================

    const entradas = Object.entries(datas);

    entradas.sort((a, b) => {

        const converterData = valor => {

            if (!valor || valor === "Sem data") {
                return new Date(0);
            }

            // Caso esteja no formato DD/MM/YYYY
            if (valor.includes("/")) {

                const partes = valor.split("/");

                if (partes.length === 3) {

                    return new Date(
                        Number(partes[2]),
                        Number(partes[1]) - 1,
                        Number(partes[0])
                    );

                }

            }

            // Caso esteja no formato YYYY-MM-DD
            if (valor.includes("-")) {

                return new Date(valor);

            }

            return new Date(valor);

        };

        return converterData(a[0]) - converterData(b[0]);

    });


    const labels = entradas.map(
        item => item[0]
    );


    const valores = entradas.map(
        item => item[1]
    );


    // ==================================================
    // CALCULAR MÉDIA
    // ==================================================

    const media = valores.length
        ? valores.reduce(
            (total, valor) => total + valor,
            0
        ) / valores.length
        : 0;


    // Criar uma linha com a média repetida
    const linhaMedia = valores.map(
        () => Number(media.toFixed(1))
    );


    // ==================================================
    // CRIAR GRÁFICO
    // ==================================================

    graficos.evolucao = new Chart(

        document.getElementById(
            "graficoEvolucao"
        ),

        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    // ==================================
                    // EVOLUÇÃO REAL
                    // ==================================

                    {

                        label:
                            "Apontamentos por data",

                        data:
                            valores,

                        borderColor:
                            "#49B96D",

                        backgroundColor:
                            "rgba(73, 185, 109, 0.15)",

                        borderWidth: 3,

                        pointBackgroundColor:
                            "#49B96D",

                        pointBorderColor:
                            "#FFFFFF",

                        pointBorderWidth: 2,

                        pointRadius: 5,

                        pointHoverRadius: 7,

                        fill: true,

                        tension: 0.35

                    },

                    // ==================================
                    // LINHA DA MÉDIA
                    // ==================================

                    {

                        label:
                            `Média: ${media.toFixed(1)}`,

                        data:
                            linhaMedia,

                        borderColor:
                            "#E74C3C",

                        backgroundColor:
                            "transparent",

                        borderWidth: 2,

                        borderDash:
                            [8, 6],

                        pointRadius: 0,

                        pointHoverRadius: 0,

                        fill: false,

                        tension: 0

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                interaction: {

                    mode: "index",

                    intersect: false

                },


                plugins: {

                    // ==================================
                    // LEGENDA
                    // ==================================

                    legend: {

                        display: true,

                        position: "top",

                        align: "center",

                        labels: {

                            color: "#FFFFFF",

                            font: {

                                family: "Poppins",

                                size: 12,

                                weight: "500"

                            },

                            usePointStyle: true,

                            pointStyle: "line",

                            padding: 20

                        }

                    },


                    // ==================================
                    // TOOLTIP
                    // ==================================

                    tooltip: {

                        backgroundColor:
                            "#172117",

                        titleColor:
                            "#FFFFFF",

                        bodyColor:
                            "#FFFFFF",

                        borderColor:
                            "#49B96D",

                        borderWidth: 1,

                        padding: 12,

                        titleFont: {

                            family: "Poppins",

                            size: 13,

                            weight: "600"

                        },

                        bodyFont: {

                            family: "Poppins",

                            size: 12

                        },

                        callbacks: {

                            label: function(context) {

                                return `${context.dataset.label}: ${context.raw}`;

                            }

                        }

                    }

                },


                scales: {

                    // ==================================
                    // EIXO X - DATAS
                    // ==================================

                    x: {

                        ticks: {

                            color: "#D8E0D8",

                            font: {

                                family: "Poppins",

                                size: 10

                            },

                            maxRotation: 45,

                            minRotation: 35

                        },

                        grid: {

                            color:
                                "rgba(255,255,255,0.04)",

                            drawBorder: false

                        }

                    },


                    // ==================================
                    // EIXO Y - QUANTIDADE
                    // ==================================

                    y: {

                        beginAtZero: true,

                        ticks: {

                            color: "#D8E0D8",

                            font: {

                                family: "Poppins",

                                size: 11,

                                weight: "500"

                            },

                            precision: 0,

                            padding: 8

                        },

                        grid: {

                            color:
                                "rgba(255,255,255,0.08)",

                            drawBorder: false

                        },

                        title: {

                            display: true,

                            text:
                                "Quantidade de apontamentos",

                            color:
                                "#A7B0A7",

                            font: {

                                family: "Poppins",

                                size: 11,

                                weight: "500"

                            }

                        }

                    }

                }

            }

        }

    );

}



// ======================================================
// NORMALIZAR DATA
// ======================================================
//
// Aceita:
//
// 28/04/2026
// 2026-04-28
// Date
// Número serial do Excel
//
// ======================================================

function normalizarDataGrafico(valor){

    // -----------------------------------------------
    // Se for objeto Date
    // -----------------------------------------------

    if(valor instanceof Date){

        if(isNaN(valor.getTime())){

            return null;

        }


        return formatarDataBR(valor);

    }



    // -----------------------------------------------
    // Se for número
    // Possível data serial do Excel
    // -----------------------------------------------

    if(typeof valor === "number"){

        const data = new Date(

            Math.round(

                (valor - 25569) *

                86400 *

                1000

            )

        );


        if(isNaN(data.getTime())){

            return null;

        }


        return formatarDataBR(data);

    }



    // -----------------------------------------------
    // Converter para texto
    // -----------------------------------------------

    const texto = String(valor).trim();


    if(!texto){

        return null;

    }



    // -----------------------------------------------
    // Formato DD/MM/YYYY
    // -----------------------------------------------

    const formatoBR =

        texto.match(

            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

        );


    if(formatoBR){

        const dia =
            formatoBR[1].padStart(2, "0");

        const mes =
            formatoBR[2].padStart(2, "0");

        const ano =
            formatoBR[3];


        return `${dia}/${mes}/${ano}`;

    }



    // -----------------------------------------------
    // Formato YYYY-MM-DD
    // -----------------------------------------------

    const formatoISO =

        texto.match(

            /^(\d{4})-(\d{1,2})-(\d{1,2})/

        );


    if(formatoISO){

        const ano =
            formatoISO[1];

        const mes =
            formatoISO[2].padStart(2, "0");

        const dia =
            formatoISO[3].padStart(2, "0");


        return `${dia}/${mes}/${ano}`;

    }



    // -----------------------------------------------
    // Tentar conversão automática
    // -----------------------------------------------

    const data = new Date(texto);


    if(!isNaN(data.getTime())){

        return formatarDataBR(data);

    }



    return null;

}



// ======================================================
// FORMATAR DATA BR
// ======================================================

function formatarDataBR(data){

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");


    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");


    const ano =
        data.getFullYear();


    return `${dia}/${mes}/${ano}`;

}



// ======================================================
// CONVERTER DATA BR PARA TIMESTAMP
// ======================================================

function converterDataParaTimestamp(data){

    const partes =
        data.split("/");


    if(partes.length !== 3){

        return 0;

    }


    const dia =
        parseInt(
            partes[0],
            10
        );


    const mes =
        parseInt(
            partes[1],
            10
        ) - 1;


    const ano =
        parseInt(
            partes[2],
            10
        );


    return new Date(

        ano,

        mes,

        dia

    ).getTime();

}



// ======================================================
// EXPORTAR
// ======================================================

window.atualizarGraficos =
    atualizarGraficos;