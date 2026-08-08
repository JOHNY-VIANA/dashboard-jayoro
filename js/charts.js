// ======================================================
// CHARTS.JS
// DASHBOARD REFORMA ENTRE-SAFRA - FROTA CCT JAYORO
// ======================================================


// ======================================================
// GUARDA GRÁFICOS ATIVOS
// ======================================================

let graficos = {};


// ======================================================
// ATUALIZAR TODOS OS GRÁFICOS
// ======================================================

function atualizarGraficos(dados) {

    destruirGraficos();

    criarGraficoSistemas(dados);

    criarGraficoMatriz(dados);

    criarGraficoEvolucao(dados);

}


// ======================================================
// DESTRUIR GRÁFICOS
// ======================================================

function destruirGraficos() {

    Object.values(graficos).forEach(grafico => {

        if (grafico) {

            grafico.destroy();

        }

    });

    graficos = {};

}


// ======================================================
// 1 - SISTEMAS MAIS EXECUTADOS
// ======================================================

function criarGraficoSistemas(dados) {

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


    if (!elemento) {

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
// 2 - MATRIZ EQUIPAMENTO × SISTEMA
// ======================================================
//
// Cada equipamento recebe:
// - 1 ponto para cada sistema executado
//
// A matriz mostra:
// EIXO X → Equipamentos
// EIXO Y → Quantidade de sistemas
//
// ======================================================

function criarGraficoMatriz(dados) {

    const matriz = {};


    dados.forEach(item => {

        const equipamento =
            String(
                item.equipamento ||
                "Não informado"
            ).trim();


        const sistema =
            String(
                item.sistema ||
                "Não informado"
            ).trim();


        if (!matriz[equipamento]) {

            matriz[equipamento] = {};

        }


        matriz[equipamento][sistema] = 1;

    });


    // ==================================================
    // EQUIPAMENTOS
    // ==================================================

    const equipamentos = Object.keys(
        matriz
    );


    // ==================================================
    // SISTEMAS
    // ==================================================

    const sistemas = [

        ...new Set(

            dados.map(

                item =>
                    String(
                        item.sistema ||
                        "Não informado"
                    ).trim()

            )

        )

    ];


    // ==================================================
    // CORES FIXAS DOS SISTEMAS
    // ==================================================

    const coresSistemas = {

        "RODANTE(PNEUS)": "#F1C40F",

        "RODANTE (PNEUS)": "#F1C40F",


        "ESTRUTURA": "#2ECC71",


        "CHASSI": "#E67E22",


        "EIXO TRASEIRO": "#34495E",


        "FREIO": "#E74C3C",

        "FREIOS": "#E74C3C",


        "PNEUMATICO": "#3498DB",

        "PNEUMÁTICO": "#3498DB",


        "EIXO DIANTEIRO": "#1ABC9C",


        "ENGATE": "#9B59B6",


        "ELÉTRICO": "#16A085",

        "ELÉTRICA": "#16A085",


        "PÇS & MATERIAIS": "#F39C12",


        "SUSPENSAO": "#D35400",

        "SUSPENSÃO": "#D35400",


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


    // ==================================================
    // LOCALIZAR CANVAS
    // ==================================================

    const elemento = document.getElementById(
        "graficoMatriz"
    );


    if (!elemento) {

        console.warn(
            "Elemento graficoMatriz não encontrado."
        );

        return;

    }


    // ==================================================
    // CRIAR GRÁFICO
    // ==================================================

    graficos.matriz = new Chart(

        elemento,

        {

            type: "bar",


            data: {

                labels:
                    equipamentos,


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

                                label:
                                    sistema,


                                data:

                                    equipamentos.map(

                                        equipamento =>

                                            matriz[
                                                equipamento
                                            ][sistema] || 0

                                    ),


                                backgroundColor:
                                    cor,


                                borderColor:
                                    cor,


                                borderWidth:
                                    1

                            };

                        }

                    )

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                plugins: {

                    legend: {

                        position:
                            "bottom"

                    }

                },


                scales: {

                    x: {

                        stacked:
                            true

                    },


                    y: {

                        stacked:
                            true,


                        beginAtZero:
                            true,


                        ticks: {

                            precision:
                                0

                        }

                    }

                }

            }

        }

    );

}


// ======================================================
// 3 - APONTAMENTOS POR EQUIPAMENTO
// ======================================================
//
// EIXO X:
// Equipamentos
//
// EIXO Y:
// Quantidade de apontamentos
//
// LINHA:
// Quantidade real de apontamentos
//
// LINHA TRACEJADA:
// Média da frota
//
// ======================================================

function criarGraficoEvolucao(dados) {

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


        if (
            !apontamentosPorEquipamento[equipamento]
        ) {

            apontamentosPorEquipamento[equipamento] = 0;

        }


        apontamentosPorEquipamento[equipamento]++;

    });


    // ==================================================
    // TRANSFORMAR EM ARRAY
    // ==================================================

    const entradas = Object.entries(
        apontamentosPorEquipamento
    );


    // ==================================================
    // ORDENAR
    // MAIOR → MENOR
    // ==================================================

    entradas.sort(

        (a, b) => {

            return b[1] - a[1];

        }

    );


    // ==================================================
    // LABELS
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


    if (!elemento) {

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

                labels:
                    labels,


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


                        borderWidth:
                            3,


                        pointBackgroundColor:
                            "#49B96D",


                        pointBorderColor:
                            "#FFFFFF",


                        pointBorderWidth:
                            2,


                        pointRadius:
                            5,


                        pointHoverRadius:
                            8,


                        fill:
                            true,


                        tension:
                            0.35

                    },


                    // ==================================
                    // MÉDIA DA FROTA
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


                        borderWidth:
                            3,


                        borderDash:
                            [8, 6],


                        pointRadius:
                            0,


                        pointHoverRadius:
                            0,


                        fill:
                            false,


                        tension:
                            0

                    }

                ]

            },


            options: {

                responsive:
                    true,


                maintainAspectRatio:
                    false,


                interaction: {

                    mode:
                        "index",


                    intersect:
                        false

                },


                plugins: {

                    // ==================================
                    // LEGENDA
                    // ==================================

                    legend: {

                        display:
                            true,


                        position:
                            "top",


                        align:
                            "center",


                        labels: {

                            color:
                                "#FFFFFF",


                            font: {

                                family:
                                    "Poppins",

                                size:
                                    12,

                                weight:
                                    "500"

                            },


                            usePointStyle:
                                true,


                            pointStyle:
                                "line",


                            padding:
                                20

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


                        borderWidth:
                            1,


                        padding:
                            12,


                        titleFont: {

                            family:
                                "Poppins",

                            size:
                                13,

                            weight:
                                "600"

                        },


                        bodyFont: {

                            family:
                                "Poppins",

                            size:
                                12

                        },


                        callbacks: {

                            label:
                                function(context) {

                                    if (
                                        context.datasetIndex === 0
                                    ) {

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
                    // EIXO X
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


                            maxRotation:
                                45,


                            minRotation:
                                35

                        },


                        grid: {

                            color:
                                "rgba(255,255,255,0.04)",


                            drawBorder:
                                false

                        }

                    },


                    // ==================================
                    // EIXO Y
                    // ==================================

                    y: {

                        beginAtZero:
                            true,


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


                            precision:
                                0,


                            padding:
                                8

                        },


                        grid: {

                            color:
                                "rgba(255,255,255,0.08)",


                            drawBorder:
                                false

                        },


                        title: {

                            display:
                                true,


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