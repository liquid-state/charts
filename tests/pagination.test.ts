import { Paginator, DatePaginator } from '../src/pagination'
import { AcceptableValue, Page } from '../src/types'


function getTestData(): AcceptableValue[][] {
    const data = [
        [new Date('05/03/22'), 1, 200],
        [new Date('05/14/22'), 7, 350],
        [new Date('05/25/22'), 5, 410],
        [new Date('05/27/22'), 4, 124],
        [new Date('05/28/22'), 4, 758],
        [new Date('05/29/22'), 8, 348],
        [new Date('05/30/22'), 3, 324],
        [new Date('05/31/22'), 5, 454],
        [new Date('06/01/22'), 9, 867],
        [new Date('06/02/22'), 5, 234],
        [new Date('06/03/22'), 3, 456],
        [new Date('06/04/22'), 0, 654],
        [new Date('06/05/22'), 4, 897],
        [new Date('06/06/22'), 6, 234],
    ]
    return data
}


it("should paginate by 10 by default", () => {
    const data = getTestData()
    const paginator = new Paginator(data)
    expect(paginator.numPages).toBe(2)
    expect(paginator.currentPageData.data[0][0]).toStrictEqual(data[0][0])
    paginator.currentPageNumber = 2
    expect(paginator.currentPageData.data[0][0]).toStrictEqual(data[10][0])
})

it("should not accept page numbers less than 1", () => {
    const data = getTestData()
    const paginator = new Paginator(data)
    expect(paginator.numPages).toBe(2)
    expect(() => { paginator.currentPageNumber = 0 }).toThrowError(RangeError)
})

it("should silently bound maximum page number", () => {
    const data = getTestData()
    const paginator = new Paginator(data)
    expect(paginator.numPages).toBe(2)
    paginator.currentPageNumber = 666
    expect(paginator.currentPageNumber).toBe(2)
})

it("should scroll to the page with a given date", () => {
    const data = getTestData()
    const paginator = new Paginator(data)
    expect(paginator.numPages).toBe(2)
    paginator.scrollToComparingValue((page: Page) => {
        return page.start!.toString() === new Date('06/03/22').toString()
    })
    expect(paginator.currentPageNumber).toBe(2)
})

it("should scroll from the first page when asked to", () => {
    const data = getTestData()
    const paginator = new Paginator(data)
    expect(paginator.numPages).toBe(2)
    paginator.currentPageNumber = 2
    paginator.scrollToComparingValue((val: Date) => {
        return val.toString() === new Date('05/14/22').toString()
    })
    expect(paginator.currentPageNumber).toBe(1)
})

it("should compute pages of dates accurately", () => {
    const data = getTestData()
    debugger
    const paginator = new DatePaginator(data, 0, 7, 3)
    expect(paginator.numPages).toBe(18)
})