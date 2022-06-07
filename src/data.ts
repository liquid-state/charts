import { AcceptableData } from './types'


export default class ChartableData {
    data: AcceptableData
    indexColumn: string

    constructor(data: AcceptableData, indexColumn: string) {
        this.data = data
        this.indexColumn = indexColumn
    }
}
