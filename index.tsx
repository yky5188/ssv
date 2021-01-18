// @ts-nocheck
import React from 'react';
import { transparentize, rgb } from 'polished';
import dayjs from 'dayjs';
import XYChart, {
  Bar,
  Grid,
  YAxis,
  YAxisTooltip,
  TimeAxis,
  Stack,
} from 'esb-ui-web/lib/components/XYChart';
import { scaleLinear } from 'd3';
import { FREQUENCIES } from 'esb-ui-web/lib/constants';
import { MarkLine } from '../../components/XYChart/MarkLine';

import {
  white,
  SolidColor,
  GradientColorCode,
} from 'esb-ui-web/lib/components/GradientManager/preset';
import { XYValue } from 'esb-ui-web/lib/components/XYChart/utils';

import { XYTooltip, XYTooltipSection } from '../../components/XYChart/ToolTip';

interface dataItem extends XYValue {
  e: number;
}

interface stackItem {
  label: string;
  color: SolidColor | GradientColorCode;
  data: dataItem[];
  stripePattern: boolean;
}

interface Props {
  dataset: stackItem[];
  width: number;
  height: number;
  max_cycles: number;
  startTime: number;
  endTime: number;
  bessName: string;
  day: dayjs.Dayjs;
}

const CyclesBar: React.FC<Props> = ({
  width,
  height,
  max_cycles,
  startTime,
  endTime,
  dataset,
  bessName,
  day,
}) => {
  const markLine = '#FFFFFF' as SolidColor;
  const hoverColor = transparentize(0.83, white);
  const cycleScale = scaleLinear().domain([0, max_cycles]);
  const [showToday, setShowToday] = React.useState<boolean>(false);
  const [currentData, setCurrentData] = React.useState<XYValue[]>([]);

  const getToolTipContent = (t: number) => {
    const head = dayjs(t).format('DD MMMM YYYY');
    const subHead = bessName;
    const sectionData: any[] = [];
    var charging = null;
    var disCharging = null;
    const chargingSeries = dataset[0];
    const disChargingSeries = dataset[1];
    var dayIndex = 0;
    chargingSeries.data.forEach((item, index) => {
      if (item.x === t) {
        charging = item;
        disCharging = disChargingSeries.data[index];
        dayIndex = index;
      }
    });
    console.log({ charging, disCharging });

    const chargingValue = `${charging.y.toFixed(1)} | ${
    (
      (charging.y * 100) /
      (disCharging.y + charging.y)
    ).toFixed(0)}%`;
    const disChargingValue = `${disCharging.y.toFixed(
      1
    )} | ${
    (
      (disCharging.y * 100) /
      (disCharging.y + charging.y)
    ).toFixed(0)}%`;
    sectionData.push({
      label: 'Charging Cycles',
      legend: 'square',
      legendColor: '#53FF4D',
      value: <div>{chargingValue}</div>,
    });

    sectionData.push({
      label: 'Charging Energy',
      legend: null,
      value: `${charging.e.toFixed(2)} MWH`,
    });

    sectionData.push({
      label: 'Discharging Cycles',
      legend: 'square',
      legendColor: '#56CCF2',
      value: <div>{disChargingValue}</div>,
    });

    sectionData.push({
      label: 'Discharging Energy',
      legend: null,
      value: `${disCharging.e.toFixed(2)} MWH`,
    });

    return {
      head,
      subHead,
      sectionData,
    };
  };

  React.useEffect(() => {
    var x_time_from = day.startOf('month').valueOf();
    var x_month_from = dayjs().startOf('month').valueOf();
    if (x_time_from === x_month_from) {
      setShowToday(true);
      setCurrentData([
        { x: day.startOf('day').valueOf(), y: 0 },
        { x: day.startOf('day').valueOf(), y: max_cycles },
      ]);
    } else {
      setShowToday(false);
    }
  }, [day]);

  return (
    <XYChart
      width={width}
      height={height}
      chartXScale={scaleLinear().domain([startTime, endTime])}
    >
      <Grid chartScale={cycleScale} tickCount={4} />
      <YAxis
        label=""
        chartScale={cycleScale}
        yAxisTicks={4}
        unit="No. of Cycles"
      ></YAxis>
      <TimeAxis frequency={FREQUENCIES.MONTHLY} format="DD"></TimeAxis>
      <Stack dataSets={dataset} chartYScale={cycleScale} stackMargin={1}>
        {props => {
          return <Bar {...props} key={props.label} barWidth={8} />;
        }}
      </Stack>
      {showToday && (
        <MarkLine
          data={currentData}
          chartYScale={cycleScale}
          color={markLine}
          strokeWidth={2}
          markSize={12}
        ></MarkLine>
      )}
      <YAxisTooltip
        position="right"
        hoverAreaColor={hoverColor}
        hoverAreaWidth={8}
      >
        {t => {
          const { head, subHead, sectionData } = getToolTipContent(t);
          return (
            <XYTooltip width={260} head={head} subHead={subHead}>
              <XYTooltipSection sectionData={sectionData}></XYTooltipSection>
            </XYTooltip>
          );
        }}
      </YAxisTooltip>
    </XYChart>
  );
};

export default CyclesBar;
