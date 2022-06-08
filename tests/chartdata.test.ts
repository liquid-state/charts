import { ChartData, GoogleChartData } from '../src/ChartData'
import { SeriesPreferredRepresentation } from '../src/types'
import { colours } from '../src/colours'


function getInitialData() {
    const axesConfig = {
        symptoms: {
            title: "Symptoms",
        },
        blood: {
            title: "Blood (in µL)",
            scaleType: 'log',
            minValue: 0,
            maxValue: 500
        },
    }
    const series = [
        { label: "Submission date", type: "date", format: "d/MM/yy", id: "date" },
        { 
            id: "q1",
            label: "Q1",
            type: "number", 
            unit: "numeric",
            axis: "symptoms",
            preferredRepresentation: SeriesPreferredRepresentation.LINE
        },
        {
            id: "q2",
            label: "Q2",
            type: "number", 
            unit: "µL",
            axis: "blood",
            preferredRepresentation: SeriesPreferredRepresentation.BARS
        },
    ]
    const xAxisSeriesIndex = 0
    const data = [
        ['05/03/22', 1, 200],
        ['05/14/22', 7, 350],
        ['05/25/22', 5, 410],
        // TODO: add example of null
        ]
    return { axesConfig, series, xAxisSeriesIndex, data }
}

function showAndHideSomeSeries(cd: ChartData) {
    cd.showAllSeries()
    cd.hideSeriesAtIndex(1)
}

it("should track displayed series", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new ChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getDisplayedSeries().length).toBe(2)
    expect(cd.getDisplayedSeries()).toStrictEqual([
        // { "label": "Date", "type": "date" },
        { label: "Submission date", format: 'd/MM/yy', type: "date", id: "date"},
        { 
            id: "q2",
            label: "Q2", "type": "number",
            unit: "µL",
            axis: "blood",
            preferredRepresentation: SeriesPreferredRepresentation.BARS
        },
    ])
})

it("should compute distinct units count", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new ChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getAxesInDisplayedSeries().size).toBe(1)
})


it("should compute y axes", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getYAxes()).toStrictEqual([
        // {id: "symptoms", label: "Symptoms"},
        {id: "blood", title: "Blood (in µL)"}
    ])
})


it("should return GoogleChart wrapper params", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getChartWrapperParams()).toStrictEqual({
        view: { columns: [0, 2] }
    })
})


it("should return GoogleChart options series", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getOptionsSeries(cd.getColours())).toStrictEqual({
        "0": {
            id: "q2",
            color: "#5568B8",
            type: "bars", 
            targetAxisIndex: 0
        },
    })
})


it("should return GoogleChart options axes", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getOptionsAxes()).toStrictEqual({
        vAxes: [
        // {
        //     title: "Symptoms"
        //     // minValue: 0,
        //     // maxValue: 200
        // },
        {
            title: "Blood (in µL)",
            scaleType: 'log',
            minValue: 0,
            maxValue: 500
        }],
        hAxis: {
            // title: "Submission date",
            format: 'd/MM/yy',
        },
    })
})


it("should return GoogleChart options colours", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getColours()).toStrictEqual(colours.generalFixed[0])
})


it("should return complete GoogleChart options", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)
    showAndHideSomeSeries(cd)
    expect(cd.getColours()).toStrictEqual(colours.generalFixed[0])
})


it("should return Google LineChart definition", () => {
    const { axesConfig, series, xAxisSeriesIndex, data } = getInitialData()
    const cd = new GoogleChartData(axesConfig, series, xAxisSeriesIndex, data)

    const def1 = cd.getLineChartDefinition()
    expect(def1).toStrictEqual({
        chartType: "LineChart",
        data: [
            [
                { label: "Submission date", type: "date" },
                { label: "Q1", type: "number" },
                { label: "Q2", type: "number" },
            ],
            ['05/03/22', 1, 200],
            ['05/14/22', 7, 350],
            ['05/25/22', 5, 410],
        ],
        options: {
            // title: "..."
            legend: "none",
            curveType: "function",
            series: {
                "0": {
                    id: "q1",
                    type: "line",
                    targetAxisIndex: 0, 
                    color: colours.general[1][0]
                },
                "1": { 
                    id: "q2",
                    type: "bars", 
                    targetAxisIndex: 1,
                    color: colours.general[1][1]
                }
            },
            vAxes: [{
                title: "Symptoms"
            }, {
                title: "Blood (in µL)",
                scaleType: "log",
                minValue: 0,
                maxValue: 500
            }],
            hAxis: {
                // title: "Submission date",
                format: 'd/MM/yy',
            },
            chartArea: { width: "80%" }
        },
    })

    showAndHideSomeSeries(cd)
    const def2 = cd.getLineChartDefinition()
    expect(def2).toStrictEqual({
        chartType: "LineChart",
        data: [
            [
                { label: "Submission date", type: "date" },
                { label: "Q2", type: "number" },
            ],
            ['05/03/22', 200],
            ['05/14/22', 350],
            ['05/25/22', 410],
        ],
        options: {
            // title: "..."
            legend: "none",
            curveType: "function",
            series: {
                "0": { 
                    id: "q2",
                    type: "bars", 
                    targetAxisIndex: 0,
                    color: colours.general[0][0]
                }
            },
            vAxes: [{
                title: "Blood (in µL)",
                scaleType: "log",
                minValue: 0,
                maxValue: 500
            }],
            hAxis: {
                // title: "Submission date",
                format: 'd/MM/yy',
            },
            chartArea: { width: "80%" }
    
        },
    })
})


