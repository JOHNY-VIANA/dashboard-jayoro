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


    const labels = Object.keys(
        ordenado
    ).slice(0, 10);


    const valores = Object.values(
        ordenado
    ).slice(0, 10);


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

                    label: "Nº de Apontamentos",


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

        // RODANTE
        "RODANTE(PNEUS)": "#F1C40F",
        "RODANTE (PNEUS)": "#F1C40F",


        // ESTRUTURA
        "ESTRUTURA": "#2ECC71",


        // CHASSI
        "CHASSI": "#E67E22",


        // EIXO TRASEIRO
        "EIXO TRASEIRO": "#34495E",


        // FREIO
        "FREIO": "#E74C3C",
        "FREIOS": "#E74C3C",


        // PNEUMÁTICO
        "PNEUMATICO": "#3498DB",
        "PNEUMÁTICO": "#3498DB",


        // EIXO DIANTEIRO
        "EIXO DIANTEIRO": "#1ABC9C",


        // ENGATE
        "ENGATE": "#9B59B6",


        // ELÉTRICA
        "ELÉTRICO": "#16A085",
        "ELÉTRICA": "#16A085",


        // PÇS & MATERIAIS
        "PÇS & MATERIAIS": "#F39C12",


        // SUSPENSÃO
        "SUSPENSAO": "#D35400",
        "SUSPENSÃO": "#D35400",


        // IMPLEMENTO
        "IMPLEMENTO": "#E84393"

    };



    // ==================================================
    // CORES DE RESERVA
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
// 4 - APONTAMENTOS POR EQUIPAMENTO
// ======================================================
//
// EIXO X:
// Equipamentos
//
// EIXO Y:
// Quantidade de apontamentos
//
// LINHA VERDE:
// Quantidade real de apontamentos
//
// LINHA VERMELHA:
// Média de apontamentos da frota
//
// ======================================================

function criarGraficoEvolucao(dados){

    // ==================================================
    // AGRUPAR APONTAMENTOS POR EQUIPAMENTO
    // ==================================================

    const apontamentosPorEquipamento = {};


    dados.forEach(item => {

        const equipamento =
            String(
                item.equipamento ||
                "Não informado"
            ).trim();


        if(!apontamentosPorEquipamento[equipamento]){

            apontamentosPorEquipamento[equipamento] = 0;

        }


        apontamentosPorEquipamento[equipamento]++;

    });



    // ==================================================
    // ORDENAR EQUIPAMENTOS
    //
    // Maior quantidade de apontamentos primeiro.
    // ==================================================

    const entradas = Object.entries(
        apontamentosPorEquipamento
    );


    entradas.sort(

        (a, b) => {

            return b[1] - a[1];

        }

    );



    // ==================================================
    // LABELS DO EIXO X
    // ==================================================

    const labels = entradas.map(
        item => item[0]
    );



    // ==================================================
    // VALORES
    // ==================================================

    const valores = entradas.map(
        item => item[1]
    );



    // ==================================================
    // CALCULAR MÉDIA
    // ==================================================

    const media = valores.length

        ? valores.reduce(

            (total, valor) =>

                total + valor,

            0

        ) / valores.length

        : 0;



    // ==================================================
    // LINHA DA MÉDIA
    //
    // Repete o valor da média para atravessar
    // todo o gráfico.
    // ==================================================

    const linhaMedia = valores.map(

        () => Number(
            media.toFixed(1)
        )

    );



    // ==================================================
    // LOCALIZAR CANVAS
    // ==================================================

    const elemento = document.getElementById(
        "graficoEvolucao"
    );


    if(!elemento){

        console.warn(
            "Elemento graficoEvolucao não encontrado."
        );

        return;

    }



    // ==================================================
    // CRIAR GRÁFICO
    // ==================================================

    graficos.evolucao = new Chart(

        elemento,

        {

            type: "line",


            data: {

                labels: labels,


                datasets: [

                    // ==================================
                    // APONTAMENTOS REAIS
                    // ==================================

                    {

                        label:
                            "Apontamentos por Equipamento",


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


                        pointHoverRadius: 8,


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


                        borderWidth: 3,


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

                            label: function(context){

                                if(
                                    context.datasetIndex === 0
                                ){

                                    return (
                                        "Apontamentos: " +
                                        context.raw
                                    );

                                }


                                return (
                                    "Média: " +
                                    media.toFixed(1)
                                );

                            }

                        }

                    }

                },


                scales: {

                    // ==================================
                    // EIXO X - EQUIPAMENTOS
                    // ==================================

                    x: {

                        ticks: {

                            color:
                                "#D8E0D8",


                            font: {

                                family:
                                    "Poppins",

                                size:
                                    10,

                                weight:
                                    "500"

                            },


                            maxRotation: 45,


                            minRotation: 35

                        },


                        grid: {

                            color:
                                "rgba(255,255,255,0.04)",


                            drawBorder:
                                false

                        }

                    },


                    // ==================================
                    // EIXO Y - APONTAMENTOS
                    // ==================================

                    y: {

                        beginAtZero: true,


                        ticks: {

                            color:
                                "#D8E0D8",


                            font: {

                                family:
                                    "Poppins",

                                size:
                                    11,

                                weight:
                                    "500"

                            },


                            precision: 0,


                            padding: 8

                        },


                        grid: {

                            color:
                                "rgba(255,255,255,0.08)",


                            drawBorder:
                                false

                        },


                        title: {

                            display: true,


                            text:
                                "Quantidade de apontamentos",


                            color:
                                "#A7B0A7",


                            font: {

                                family:
                                    "Poppins",

                                size:
                                    11,

                                weight:
                                    "500"

                            }

                        }

                    }

                }

            }

        }

    );

}



// ======================================================
// EXPORTAR
// ======================================================

window.atualizarGraficos =
    atualizarGraficos;