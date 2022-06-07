import { addDays, subDays } from 'date-fns'

import { AcceptableValue, Page } from './types' 


export class Paginator {
    protected pages: Page[]
    protected _currentPageNumber: number = 1

    constructor(
        public data: AcceptableValue[][],
        public pageSize: number = 10,
        public initialPageNumber: number = 1
    ) { 
        this._currentPageNumber = initialPageNumber
    }

    get numPages() {
        if (!this.pages) {
            this.computePages()
        }
        return this.pages.length
    }

    get currentPageNumber() {
        return this._currentPageNumber
    }

    set currentPageNumber(value: number) {
        if (value < 1) {
            throw RangeError('Page number value must be greater than 1.')
        }
        const realValue = (value > this.numPages) ? this.numPages : value
        this._currentPageNumber = realValue
    }

    get hasPreviousPage(): boolean {
        if (this._currentPageNumber === 1) { return false }
        return true
    }

    get hasNextPage(): boolean {
        if (this._currentPageNumber === this.numPages) { return false }
        return true
    }

    get currentPageData() {
        if (this.numPages < this._currentPageNumber ) {
            throw RangeError('_currentPageNumber is greater than number of pages.')
        }
        return this.pages[this.currentPageNumber-1]
    }

    computePages() {
        this.pages = []
        const tmpData = Array.from(this.data)
        while (tmpData.length) {
            const page = tmpData.splice(0, this.pageSize)
            this.pages.push({
                start: page[0][0],
                data: page,
                end: page[page.length-1]![0],
            })
        }
    }

    /**
     * Scrolls through pages until the comparator function 
     * returns true for the desired value
     */
    scrollToComparingValue(
        comparator: Function, 
        // valueColumnIndex: number = 0,
        startAtFirstPage: boolean = true) {
        if (startAtFirstPage) {
            this._currentPageNumber = 1
        }
        const n = this.numPages
        for (let i = this._currentPageNumber; i <= n; i += 1) {
            const page = this.pages[i - 1]
            if (comparator(page)) {
                this._currentPageNumber = i
                return
            }
        }
    }
}

export class DatePaginator extends Paginator {
    constructor(
        public data: AcceptableValue[][],
        public dateColumnIndex: number,
        public pageSize: number = 7, // in days
        public offsetDivider: number = 3, // in days
        public startDate?: Date,
        public endDate?: Date
        ) { 
        super(data, pageSize)
        this.sortData()
        if (!startDate && !endDate) {
            this.startDate = this.data[0][this.dateColumnIndex] as Date
        } else if (!startDate && endDate) {
            this.startDate = addDays(endDate, 1)
        }
    }

    protected sortData() {
        if (!this.data.length) { return }

        this.data.sort((rowA, rowB) => {
            const aValue = rowA[this.dateColumnIndex]
            const bValue = rowB[this.dateColumnIndex]
            if (!aValue || !bValue) {
                throw Error('Row has a null value in date column: cannot paginate.')
            }
            return (aValue >= bValue) ? 1 : -1
        })
    }

    computePages() {
        if (!this.data.length) { return }

        const pageStartDates: Date[] = []
        const firstDate = this.data[0][this.dateColumnIndex] as Date
        const lastDate = this.data.length && this.data[this.data.length-1]![this.dateColumnIndex] as Date
        // use start date to start with, then wind back all the way to 
        // find the start date of the first page
        let currentDate = this.startDate!
        while (currentDate > firstDate) {
            currentDate = subDays(currentDate, Math.round(this.pageSize/this.offsetDivider))
        }
        // from the start date of the first page, now figure out the start date of each page
        while (currentDate <= lastDate) {
            pageStartDates.push(currentDate)
            currentDate = addDays(currentDate, Math.round(this.pageSize/this.offsetDivider))
        }

        // now that we have a list of start dates for the pages
        // go through them and collect pages
        const pagesByStartDate = {}
        pageStartDates.forEach(pageStartDate => {
            pagesByStartDate[pageStartDate.toString()] = []
        })
        // const lastEndDate = addDays(pageStartDates[pageStartDates.length-1] as Date, pageSizeInDays+1)
        let latestPageStartDateIndex = 0
        this.data.forEach(row => {
            const dateValue = row[this.dateColumnIndex] as Date
            for (let i = latestPageStartDateIndex; i < pageStartDates.length; i++) {
                const psdString = pageStartDates[i].toString()
                if (
                    (pageStartDates[i] <= dateValue) && 
                    (dateValue < addDays(pageStartDates[i], this.pageSize+1))) {
                    pagesByStartDate[psdString].push(row)
                    latestPageStartDateIndex = i
                    break;
                }
            }
        })
        // this.pages = Object.values(pagesByStartDate)
        this.pages = []
        pageStartDates.forEach(pageStartDate => {
            const pageData: AcceptableValue[][] = Array.from(pagesByStartDate[pageStartDate.toString()])
            // pageData.unshift([pageStartDate, null, null])
            // pageData.push([addDays(pageStartDate, this.pageSize-1), null, null])
            this.pages.push({
                start: pageStartDate,
                data: pageData,
                end: addDays(pageStartDate, this.pageSize)
            })
        })

    }
}
