import { GoogleChartWrapperChartType } from 'react-google-charts/dist/types'


// main types

export type AcceptableValue = 
    | number
    | string
    | Date
    | null;


export type Page = {
    start: AcceptableValue,
    end: AcceptableValue,
    data: AcceptableValue[][]
}
    

export enum SeriesPreferredRepresentation {
    LINE = "line",
    BARS = "bars"
}


export interface ChartDataAxesConfig {
    [key: string] : { 
        title: string,
        format?: string,
        scaleType?: string,
        minValue?: number,
        maxValue?: number,
    }
}


export interface SeriesDescription {
    id: string
    label: string
    type: string
    preferredRepresentation?: SeriesPreferredRepresentation
    unit?: string
    axis?: string
    format?: string
}

export type ChartDataSeries = Array<SeriesDescription>


// types for Google Charts:

export type AcceptableData = Array<Array<AcceptableValue>>

export interface IChart {
    chartType: GoogleChartWrapperChartType | undefined,
    data: AcceptableData,
    options: object,
    width: string,
    height: string,
    chartWrapperParams?: object
}


export interface YAxis {
    id: string
    title: string
}


export interface IChartData {
    axesConfig: ChartDataAxesConfig
    series: ChartDataSeries
    xAxisSeriesIndex: number
    data: Array<Array<AcceptableValue>>
}


export class InvalidYAxesCountError extends Error { }

