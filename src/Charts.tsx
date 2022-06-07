import React, { createRef } from 'react'
import { Chart,
  ReactGoogleChartEvent,
  GoogleChartWrapper,
} from "react-google-charts"
import { IChart } from './types'


interface LSChartProps {
  chart: IChart
}

export type Ref = Chart


export const LSChart = ({ chart } : LSChartProps) => {
  const chartRef = createRef<Chart>()
   // @ts-ignore
  let wrapper: GoogleChartWrapper|undefined = undefined

  const chartEvents: ReactGoogleChartEvent[] = [
    {
      eventName: "ready",
      callback: ({ chartWrapper }) => {
        wrapper = chartWrapper
      },
    },
  ];

  return (
    <>
      <Chart
        ref={chartRef}
        chartEvents={chartEvents}
        chartType={chart.chartType}
        data={chart.data}
        options={chart.options}
        width={chart.width}
        height={chart.height}
        chartWrapperParams={chart.chartWrapperParams}
      />
    </>
  )
}

export default LSChart
