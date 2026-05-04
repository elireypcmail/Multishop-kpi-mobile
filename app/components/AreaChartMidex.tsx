'use client'

import { useEffect, useState, useRef, useMemo } from "react"
import { DollarSign, TrendingUp, Package, Calculator } from "lucide-react"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
} from "@comp/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@comp/chart"

const companyColors = [
  "var(--color-chart-1, #3b82f6)",
  "var(--color-chart-2, #1e3a8a)",
  "var(--color-chart-3, #001a33)",
  "var(--color-chart-4, #312e81)", 
  "var(--color-chart-5, #0f172a)", 
];

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(value);
}

// Función para parsear el rango de fechas similar al componente Pie
const parseDateRange = (dateStr: string) => {
  if (!dateStr) return { from: "", to: "" };
  const dates = dateStr.split(" - ").map((date) => date.trim());
  if (dates.length === 2) {
    return { from: dates[0], to: dates[1] };
  }
  return { from: dateStr, to: dateStr }; 
};

interface DataItem {
  periodo: string;
  total_valor: string;
  promedio_valor: string;
  kpiType: string;
  nomemp: string;
  nomempc?: string;
}

interface LineChartMixedProps {
  data: DataItem[];
  dateRange: { from: string; to: string };
}

export default function IndexLineChart({ data, dateRange }: LineChartMixedProps) {
  const [selectedKpi, setSelectedKpi] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedKpi = localStorage.getItem("selectedGraph")
    setSelectedKpi(savedKpi || '')
  }, [data])

  // Lógica de identificación de KPI
  const isMargin = selectedKpi === "margenDeUtilidad";
  const isUnits = selectedKpi === "unidadesVendidas";
  const isAverage = selectedKpi === "valorDeLaUnidadPromedio";
  const isTicket = selectedKpi === "ticketDeVenta"; // <-- Nuevo KPI agregado
  
  // Ahora showAverage también evalúa si es ticketDeVenta
  const showAverage = isMargin || isUnits || isAverage || isTicket;

  // Lógica de parseo de fechas
  const parsedDateRange = dateRange?.from ? parseDateRange(dateRange.from) : { from: "", to: "" };
  const parsedDateRangeTo = dateRange?.to ? parseDateRange(dateRange.to) : { from: "", to: "" };

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      name: item.nomempc || item.nomemp || "NO NAME",
      value: parseFloat(item.total_valor) || 0,
      periodo: item.periodo
    })).sort((a, b) => b.value - a.value); 
  }, [data]);

  const footerValue = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    return chartData.length > 0 ? (showAverage ? total / chartData.length : total) : 0;
  }, [chartData, showAverage]);

  const chartConfig = {
    value: {
      label: "Cantidad",
    },
  } satisfies ChartConfig

  if (!data || data.length === 0) return <div className="p-10 text-center uppercase text-xs font-bold">No hay datos disponibles.</div>

  return (
    <Card ref={cardRef} className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="mx-auto w-full aspect-[20/9] max-h-[220px]">
          <LineChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -25, bottom: 0 }}
            style={{ width: '100%', maxWidth: 800, margin: 'auto' }}
          >
            <CartesianGrid stroke="var(--border, #e5e7eb)" strokeDasharray="5 5" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground, #737373)"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="uppercase text-[10px] font-black"
              tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 8)}..` : value}
            />
            <YAxis 
               stroke="var(--muted-foreground, #737373)"
               tickLine={false}
               axisLine={false}
               tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0)+'k' : formatNumber(value)}`}
               className="text-[9px] font-medium"
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--muted, #f5f5f5)', strokeWidth: 2 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-chart-1, #3b82f6)" 
              strokeWidth={2}
              dot={{
                fill: 'var(--background, #ffffff)',
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{
                stroke: 'var(--background, #ffffff)',
                strokeWidth: 2,
                r: 6
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm uppercase pt-20">
        <div className="flex flex-col w-full gap-2 border-t pt-5">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: companyColors[index % companyColors.length] }} 
                />
                <span className="text-[11px] font-medium text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-[11px] font-bold">{formatNumber(item.value)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 font-bold text-base mt-2 border-t w-full justify-center pt-4">
          {/* Se unificó la lógica del ícono para cualquier KPI que muestre promedio */}
          {showAverage && <TrendingUp className="h-5 w-5 text-blue-500" />}
          
          <span>
            {showAverage ? "PROMEDIO GENERAL" : "TOTAL GENERAL"}: {formatNumber(footerValue)}
          </span>
        </div>
        
        {parsedDateRange.from && (
          <div className="text-[11px] text-muted-foreground font-medium text-center mt-1">
            {new Date(parsedDateRange.from).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(parsedDateRangeTo.to || parsedDateRange.from).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </div>
        )}

        {/* Mantenemos el periodo simple si existe como fallback */}
        {!parsedDateRange.from && data[0]?.periodo && (
          <div className="text-muted-foreground text-[10px] text-center mt-1 font-medium">
             PERIODO: {data[0].periodo}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}