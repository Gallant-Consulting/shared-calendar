"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("h-[350px] w-full", className)} {...props} />
));
ChartContainer.displayName = "ChartContainer";

const Chart = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ResponsiveContainer>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ResponsiveContainer>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ResponsiveContainer
    ref={ref}
    className={cn("h-[350px] w-full", className)}
    {...props}
  />
));
Chart.displayName = "Chart";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartLegend = RechartsPrimitive.Legend;

const ChartLine = RechartsPrimitive.Line;

const ChartArea = RechartsPrimitive.Area;

const ChartBar = RechartsPrimitive.Bar;

const ChartPie = RechartsPrimitive.Pie;

const ChartCell = RechartsPrimitive.Cell;

const ChartXAxis = RechartsPrimitive.XAxis;

const ChartYAxis = RechartsPrimitive.YAxis;

const ChartCartesianGrid = RechartsPrimitive.CartesianGrid;

const ChartPolarGrid = RechartsPrimitive.PolarGrid;

const ChartPolarAngleAxis = RechartsPrimitive.PolarAngleAxis;

const ChartPolarRadiusAxis = RechartsPrimitive.PolarRadiusAxis;

const ChartRadar = RechartsPrimitive.Radar;

const ChartComposedChart = RechartsPrimitive.ComposedChart;

const ChartScatter = RechartsPrimitive.Scatter;

const ChartScatterChart = RechartsPrimitive.ScatterChart;

const ChartFunnel = RechartsPrimitive.Funnel;

const ChartFunnelChart = RechartsPrimitive.FunnelChart;

const ChartPieChart = RechartsPrimitive.PieChart;

const ChartRadarChart = RechartsPrimitive.RadarChart;

const ChartSector = RechartsPrimitive.Sector;

const ChartTreemap = RechartsPrimitive.Treemap;

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLine,
  ChartArea,
  ChartBar,
  ChartPie,
  ChartCell,
  ChartXAxis,
  ChartYAxis,
  ChartCartesianGrid,
  ChartPolarGrid,
  ChartPolarAngleAxis,
  ChartPolarRadiusAxis,
  ChartRadar,
  ChartComposedChart,
  ChartScatter,
  ChartScatterChart,
  ChartFunnel,
  ChartFunnelChart,
  ChartPieChart,
  ChartRadarChart,
  ChartSector,
  ChartTreemap,
};
