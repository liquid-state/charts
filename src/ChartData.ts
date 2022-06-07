import {
    AcceptableValue,
    ChartDataSeries,
    SeriesDescription,
    ChartDataAxesConfig,
    IChartData,
    YAxis,
    InvalidYAxesCountError,
    Page
} from './types'
import { colours } from './colours'
import { Paginator, DatePaginator } from './pagination'


const defaultAxis = { id: 'default', label: 'Y' }


export class ChartData implements IChartData {
    private hiddenIndices: Set<number> = new Set()
    public paginator: Paginator

    constructor(
        public axesConfig: ChartDataAxesConfig,
        public series: ChartDataSeries,
        public xAxisSeriesIndex: number,
        public data: AcceptableValue[][],
        public isPaginated: boolean = false) {
        if (isPaginated) {
            this.paginator = new DatePaginator(this.data, xAxisSeriesIndex)
        }
    }

    get paginatedData(): AcceptableValue[][] {
        return this.isPaginated ? this.paginator.currentPageData.data : this.data
    }

    showAllSeries() {
        this.hiddenIndices.clear()
    }

    hideAllSeries() {
        const keys = Array(this.series.length).keys()
        const indices = Array.from(keys).filter(index => index !== this.xAxisSeriesIndex)
        this.hiddenIndices = new Set(indices)
    }

    showSeriesAtIndex(index: number) {
        this.hiddenIndices.delete(index)
    }

    hideSeriesAtIndex(index: number) {
        this.hiddenIndices.add(index)
    }

    getDisplayedSeries(): Array<SeriesDescription> {
        if (!this.series.length) {
            return []
        }
        const result: Array<SeriesDescription> = [];
        this.series.forEach((value, index) => {
            if (!this.hiddenIndices.has(index)) {
                result.push(value);
            }
        })
        return result
    }

    getDisplayedSeriesIndices(): Array<number> {
        if (!this.series.length) {
            return []
        }
        const result: Array<number> = [];
        this.series.forEach((_value, index) => {
            if (!this.hiddenIndices.has(index)) {
                result.push(index);
            }
        })
        return result
    }

    getAxesInDisplayedSeries() {
        const series = this.getDisplayedSeries()
        // remove date series
        series.splice(this.xAxisSeriesIndex, 1)
        const allAxes = series.map(s => s.axis)
        const axes = new Set(allAxes)
        return axes
    }

    hasMaximumNumAxes() {
        return false
    }

    getYAxes(): Array<YAxis> {
        const axesIds: Set<string> = new Set()
        const seriesIndices = this.getDisplayedSeriesIndices()
        seriesIndices.forEach((index) => {
            if (index === this.xAxisSeriesIndex) {
                return
            }
            if (this.series.length > index) {
                axesIds.add(this.series[index].axis || defaultAxis.id)
            } else {
                axesIds.add(defaultAxis.id)
            }
        })
        const yAxes: Array<YAxis> = []
        axesIds.forEach((axisId) => {
            let title = defaultAxis.label
            if (this.axesConfig[axisId]) {
                title = this.axesConfig[axisId].title
            }
            yAxes.push({ id: axisId, title })
        })
        return yAxes
    }

    getColours(): Array<string> {
        const series = this.getDisplayedSeries()
        // series contains the one for the X axis, so we do -1 on the length
        // then since colours is a 0-indexed array, we need to do -1 again
        return colours.general[series.length - 2]
    }
}


export const googleChartMaxYAxisCount = 2


export class GoogleChartData extends ChartData {
    get paginatedData(): AcceptableValue[][] {
        return this.data
        // if (!this.isPaginated) {
        //     // always return full data
        //     return this.data
        // }
        // const page = this.paginator.currentPageData;
        // return page.data;
    }

    getChartWrapperParams(): object {
        return { view: { columns: this.getDisplayedSeriesIndices() } }
    }

    hasMaximumNumAxes() {
        // only two types of axes maxium are supported for Google Charts
        return (this.getAxesInDisplayedSeries().size >= 2)
    }

    getYAxes(): Array<YAxis> {
        const yAxes = super.getYAxes()
        if (yAxes.length > 2) {
            throw new InvalidYAxesCountError(`Number of Y axes cannot be greater than ${googleChartMaxYAxisCount}`)
        }
        return yAxes
    }

    getOptionsSeries(colours: string[]): any {
        const series = this.getDisplayedSeries()
        const yAxes = this.getYAxes()
        const axesIndices = {}
        yAxes.forEach((axis, index) => {
            axesIndices[axis.id] = index
        })
        
        const result = {}
        let adjust = 0;
        series.forEach((s, index) => {
            if (s.label === this.series[this.xAxisSeriesIndex].label) {
                adjust = 1
                return
            }
            const realIndex = (index - adjust)
            result[realIndex.toString()] = {
                id: s.id,
                type: s.preferredRepresentation,
                targetAxisIndex: axesIndices[s.axis || defaultAxis.id],
                color: colours[realIndex],
            }
        })
        return result
    }

    getOptionsAxes(): any {
        const yAxes = this.getYAxes()

        const vAxes = yAxes.map(yAxis => {
            return {
                ...this.axesConfig[yAxis.id]
            } 
        })

        const hAxis = {
            // title: this.series[this.xAxisSeriesIndex].label,
            format: this.series[this.xAxisSeriesIndex].format,
        }
        if (this.isPaginated) {
            const page = this.paginator.currentPageData as Page
            // @ts-ignore
            hAxis.viewWindow = {
                min: page.start,
                max: page.end,
            }
        }

        return { vAxes, hAxis }
    }

    getOptions() {
        const colours = this.getColours()
        return {
            // title: "???",  TODO
            legend: "none",
            curveType: "function",
            series: this.getOptionsSeries(colours),
            ...this.getOptionsAxes(),
            // colors: colours,
            "chartArea": { width: "80%" }  // FIXME: should not be hardcoded
        }
    }

    protected getGoogleChartData() {
        let result : Array<Array<{label: string, type: string}|string|AcceptableValue>> = []
        const seriesRow: Array<{label: string, type: string}> = []
        const displayedIndices = this.getDisplayedSeriesIndices()
        this.series.forEach((series, index) => {
            if (displayedIndices.includes(index)) {
                seriesRow.push({
                    label: series.label,
                    type: series.type,
                })
            }
        })
        result.push(seriesRow)
        this.paginatedData.forEach(row => {
            const newRow: AcceptableValue[] = []
            row.forEach((value, seriesIndex) => {
                if (displayedIndices.includes(seriesIndex)) {
                    newRow.push(value)
                }
            })
            result.push(newRow)
        })
        return result
    }

    getLineChartDefinition() {
        return {
            chartType: "LineChart",
            data: this.getGoogleChartData(),
            options: this.getOptions(),
            // width: "100%",
            // height: "400px"
        }
    }
}
