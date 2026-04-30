"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";

import { Card, CardContent, CardFooter } from "@comp/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@comp/chart";

const chartConfig: ChartConfig = {
  desktop: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value);
};

const parseDateRange = (dateStr: string) => {
  if (!dateStr) return { from: "", to: "" };
  const dates = dateStr.split(" - ").map((date) => date.trim());
  if (dates.length === 2) return { from: dates[0], to: dates[1] };
  return { from: dateStr, to: dateStr };
};

interface DataItem {
  periodo: string;
  total_valor: string;
  promedio_valor: string;
  label: string;
  kpiType: string;
  nomemp: string;
  nomempc: string;
  sincro: string;
}

interface BarChartComponentProps {
  data: DataItem[];
  dateRange: { from: string; to: string };
}

const CustomLabel = ({ x, y, width, height, value, isMargin }: any) => {
  const isDarkMode = typeof window !== "undefined" && localStorage.getItem("darkMode") === "true";
  const textWidth = 60;
  const insideBar = width > textWidth + 20;
  const textColor = insideBar ? "white" : isDarkMode ? "white" : "black";

  const displayValue = `${formatNumber(value)}${isMargin ? '' : ''}`;

  return (
    <text
      x={insideBar ? x + width / 2 : x + width + 5}
      y={y + height / 2}
      fill={textColor}
      textAnchor={insideBar ? "middle" : "start"}
      dominantBaseline="middle"
      fontSize={11}
      className="font-bold"
    >
      {displayValue}
    </text>
  );
};

export default function BarChartMixedComponent({
  data,
  dateRange,
}: BarChartComponentProps) {
  const [graphName, setGraphName] = useState("");
  const [nameCompany, setNameCompany] = useState("");
  const [typeCompanies, setTypeCompanies] = useState("");
  const [selectedKpi, setSelectedKpi] = useState("");

  const cardRef = useRef(null);

  useEffect(() => {
    const savedGraphName = localStorage.getItem("selectedGraphName");
    const savedKpi = localStorage.getItem("selectedGraph");
    setGraphName(savedGraphName || "");
    setSelectedKpi(savedKpi || "");
    setNameCompany(data[0]?.nomemp || "");
    const savedTypeCompanies = localStorage.getItem("typeCompanies");
    setTypeCompanies(savedTypeCompanies || "");
  }, [data]);

  const isMargin = selectedKpi === "margenDeUtilidad";
  const isUnits = selectedKpi === "unidadesVendidas";
  const isAverage = selectedKpi === "valorDeLaUnidadPromedio";
  const showAverage = isMargin || isUnits || isAverage;
  const isVentasVsCompras = graphName === "Análisis de Ventas vs Compras";

  const { combinedData, footerValue, totalVentas, totalCompras } = useMemo(() => {
    if (!data.length) return { combinedData: [], footerValue: 0, totalVentas: 0, totalCompras: 0 };

    let sum = 0;
    let sumVentas = 0;
    let sumCompras = 0;
    
    // Set para controlar que el nombre de la empresa solo se asigne a la etiqueta del eje Y una vez
    const displayedNames = new Set();

    const groupedData = [...data].map((item) => {
      const val = parseFloat(item.total_valor) || 0;
      sum += val;
      
      const isVenta = item.label === "Valor Total" || item.label === "Ventas";
      if (isVenta) sumVentas += val;
      else sumCompras += val;

      const rawName = item.nomempc || item.nomemp || "";
      let yAxisLabel = rawName;

      // Lógica para no repetir nombres en el eje Y en Ventas vs Compras
      if (isVentasVsCompras) {
        if (displayedNames.has(rawName)) {
          yAxisLabel = ""; 
        } else {
          displayedNames.add(rawName);
        }
      }

      return {
        ...item,
        yAxisLabel,
        total: val,
        fill: isVenta ? "#3b82f6" : "#001a33",
      };
    });

    const sortedData = isVentasVsCompras 
      ? groupedData 
      : [...groupedData].sort((a, b) => b.total - a.total);

    return {
      combinedData: sortedData,
      footerValue: showAverage ? sum / data.length : sum,
      totalVentas: sumVentas,
      totalCompras: sumCompras,
    };
  }, [data, showAverage, isVentasVsCompras]);

  if (!data.length) return <div className="p-4 text-center">NO HAY DATOS DISPONIBLES.</div>;

  const parsedDateRange = dateRange?.from ? parseDateRange(dateRange.from) : { from: "", to: "" };
  const parsedDateRangeTo = dateRange?.to ? parseDateRange(dateRange.to) : { from: "", to: "" };

  return (
    <Card ref={cardRef} className="w-full border-none shadow-none bg-transparent">
      {typeCompanies !== "Multiple" && (
        <div className="text-center text-[15px] font-bold mt-2 uppercase text-muted-foreground">
          {nameCompany}
        </div>
      )}
      <CardContent className="p-0">
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ minHeight: "350px", height: "auto" }}
        >
          <BarChart
            accessibilityLayer
            data={combinedData}
            layout="vertical"
            margin={{ right: 80, left: 10, top: 10 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.2} />
            <YAxis
              dataKey="yAxisLabel"
              type="category"
              tickLine={false}
              axisLine={false}
              className="text-[10px] font-black uppercase"
              width={100}
              tickFormatter={(value) => (value && value.length > 15 ? `${value.substring(0, 12)}...` : value)}
            />
            <XAxis dataKey="total" type="number" hide />
            <ChartTooltip
              cursor={{ fill: "transparent", opacity: 0.1 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="total" layout="vertical" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="total"
                content={(props) => (
                  <CustomLabel {...props} isMargin={isMargin} />
                )}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 border-t pt-6 w-full uppercase">
        
        {isVentasVsCompras ? (
          /* LEYENDAS CON VALORES DEBAJO */
          <div className="flex justify-center flex-row gap-10 mt-2">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 mt-1 rounded-sm bg-[#3b82f6]" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground leading-none">VENTAS</span>
                <span className="text-sm font-black text-[#3b82f6] leading-tight">
                  {formatNumber(totalVentas)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 mt-1 rounded-sm bg-[#001a33]" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground leading-none">COMPRAS</span>
                <span className="text-sm font-black text-[#001a33] dark:text-gray-300 leading-tight">
                  {formatNumber(totalCompras)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-bold text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>
              {showAverage ? "PROMEDIO GENERAL" : "TOTAL GENERAL"}:{" "}
              {formatNumber(footerValue)}
              {isMargin && ""}
            </span>
          </div>
        )}

        {parsedDateRange.from && (
          <div className="text-[11px] text-muted-foreground font-medium mt-6">
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
      </CardFooter>
    </Card>
  );
}