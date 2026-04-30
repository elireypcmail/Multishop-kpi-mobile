"use client";

import { Label, Pie, PieChart } from "recharts";
import { TrendingUp, DollarSign, Package } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";

import { Card, CardContent, CardFooter } from "@comp/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@comp/chart";

const generateBlueShades = (count: number) => {
  const customPalette = [
    "#3b82f6", 
    "#1e3a8a", 
    "#001a33", 
    "#312e81", 
    "#0f172a", 
    "#1e293b", 
  ];

  return Array.from(
    { length: count },
    (_, i) => customPalette[i % customPalette.length]
  );
};

const chartConfig = {
  desktop: {
    label: "TOTAL",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

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
  if (dates.length === 2) {
    return { from: dates[0], to: dates[1] };
  }
  return { from: dateStr, to: dateStr }; 
};

interface DataItem {
  periodo: string;
  total_valor: string;
  promedio_valor: string;
  label?: string;
  kpiType?: string;
  nomemp?: string;
  nomempc?: string;
  sincro?: string;
}

interface PieChartMixedComponentProps {
  data: DataItem[];
  dateRange: { from: string; to: string };
  dateTypeRange?: string;
}

export default function PieChartMixedComponent({
  data,
  dateRange,
  dateTypeRange,
}: PieChartMixedComponentProps) {
  const [selectedKpi, setSelectedKpi] = useState("");
  const [activeCompany, setActiveCompany] = useState("");
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKpi = localStorage.getItem("selectedGraph");
    setSelectedKpi(savedKpi || "");
  }, [data]);

  useEffect(() => {
    const updateChartDimensions = () => {
      if (cardRef.current) {
        const { width } = cardRef.current.getBoundingClientRect();
        const height = Math.min(width, 480); 
        setChartDimensions({ width, height });
      }
    };

    updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);
    return () => window.removeEventListener("resize", updateChartDimensions);
  }, []);

  const isMargin = selectedKpi === "margenDeUtilidad";
  const isUnits = selectedKpi === "unidadesVendidas";
  const isAverage = selectedKpi === "valorDeLaUnidadPromedio";
  const showAverage = isMargin || isUnits || isAverage;

  const formattedData = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      let groupedData = data.map((item) => ({
        ...item,
        companyName: item.nomempc || item.nomemp || "SIN NOMBRE",
        value: parseFloat(item.total_valor) || 0,
        label: item.label,
      }));

      groupedData.sort((a, b) => b.value - a.value);
      const shades = generateBlueShades(groupedData.length);

      return groupedData.map((item, index) => ({
        ...item,
        fill: shades[index] 
      })).filter((item) => item.value > 0);
    }
    return [];
  }, [data]);

  useEffect(() => {
    setActiveCompany(formattedData[0]?.companyName || "");
  }, [formattedData]);

  const activeIndex = useMemo(
    () => formattedData.findIndex((item) => item.companyName === activeCompany),
    [formattedData, activeCompany]
  );

  const handlePieClick = (data: any) => {
    if (data && data.companyName) {
      setActiveCompany(data.companyName);
    }
  };

  const totalValue = useMemo(
    () => formattedData.reduce((sum, item) => sum + item.value, 0),
    [formattedData]
  );
  
  const footerValue = useMemo(
    () => (formattedData.length > 0 ? (showAverage ? totalValue / formattedData.length : totalValue) : 0),
    [formattedData, totalValue, showAverage]
  );

  if (!data || data.length === 0)
    return <div className="p-4 text-center">NO HAY DATOS DISPONIBLES.</div>;

  const activeData = formattedData[activeIndex] || formattedData[0];
  const percentage = activeData && totalValue > 0 ? (activeData.value / totalValue) * 100 : 0;

  const parsedDateRange = dateRange?.from ? parseDateRange(dateRange.from) : { from: "", to: "" };
  const parsedDateRangeTo = dateRange?.to ? parseDateRange(dateRange.to) : { from: "", to: "" };

  return (
    <Card className="w-full z-50 border-none shadow-none" ref={cardRef}>
      <CardContent className="p-0 flex justify-center items-center">
        <ChartContainer config={chartConfig} className="mx-auto w-full aspect-square max-h-[480px]">
          <PieChart
            width={chartDimensions.width}
            height={chartDimensions.height}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={formattedData}
              dataKey="value"
              nameKey="companyName"
              cx="50%"
              cy="50%"
              innerRadius={chartDimensions.width * 0.22} 
              outerRadius={chartDimensions.width * 0.40} 
              strokeWidth={4}
              onClick={(_, index) => handlePieClick(formattedData[index])}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const cy = viewBox.cy ?? 0;
                    return (
                      <g>
                        <text
                          x={viewBox.cx ?? 0}
                          y={cy - 25}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground text-[14px]"
                        >
                          {/* Se quitó el símbolo % del porcentaje de participación */}
                          {percentage.toFixed(2)}
                        </text>
                        <text
                          x={viewBox.cx ?? 0}
                          y={cy + 8}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-2xl font-bold"
                        >
                          {/* Se eliminaron todos los símbolos condicionales ($ y %) */}
                          {formatNumber(activeData?.value ?? 0)}
                        </text>
                        <text
                          x={viewBox.cx ?? 0}
                          y={cy + 40}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground text-[12px] font-semibold uppercase"
                        >
                          {activeData?.companyName.length > 20 
                            ? `${activeData?.companyName.substring(0, 17)}...` 
                            : activeData?.companyName || "TOTAL"}
                        </text>
                      </g>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm uppercase pt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold leading-none">
            {isMargin && <TrendingUp className="h-4 w-4" />}
            {isUnits && <TrendingUp className="h-4 w-4" />}
            {isAverage && <TrendingUp className="h-4 w-4" />}
            
            <span>
              {showAverage ? "PROMEDIO GENERAL" : `TOTAL GENERAL ${dateTypeRange || ''}`}:{" "}
              {formatNumber(footerValue)}
            </span>
          </div>
        </div>

        {parsedDateRange.from && (
          <div className="flex items-center gap-2 leading-none text-muted-foreground text-[12px] mt-4">
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