import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import FooterGraph from "./Footer";
import BarChartComponent from "./BarChart";
import PieChartComponent from "./PieChart";
import LineChartComponent from "./AreaChart";
// Mixed
import BarChartMixedComponent from "./BarChartMixed";
import PieChartMixedComponent from "./PieChartMixed";
import LineChartMixedComponent from "./AreaChartMidex";

import { defaultChartTypes } from "@conf/defaultChartTypes";
import GraphTypeModal from "./GraphType";
import {
  Sun,
  Moon,
  NotFound,
  ArrowLeft,
  Options,
  Winner,
  WinnerSale,
  CloseModal,
  FactoryLogo,
  Inventory,
  Boxes,
  Employee,
  Earnings,
} from "./Icons";

export default function Graph() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [chartDataState, setChartDataState] = useState(null);
  const [nameGraph, setNameGraph] = useState("");
  const [dateGraph, setDateGraph] = useState("");
  const [currentGraphType, setCurrentGraphType] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [category, setCategory] = useState("");
  const [typeRange, setTypeRange] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [confirmedCompany, setConfirmedCompany] = useState(null);
  const [typeCompanies, setTypeCompanies] = useState("");
  const [lastDateSincro, setLastDateSincro] = useState("");
  const [showGraphTypeModal, setShowGraphTypeModal] = useState(false);
  const [criterio, setCriterio] = useState("monto"); // valor por defecto

  useEffect(() => {
    const savedCriterio = localStorage.getItem("criterio");
    if (savedCriterio) setCriterio(savedCriterio);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    const savedCategory = localStorage.getItem("selectedCategory");
    setCategory(savedCategory || "");
    const savedTypeCompanies = localStorage.getItem("typeCompanies");
    setTypeCompanies(savedTypeCompanies || "");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    loadName();
    loadChartData();
  }, []);

  const loadChartData = () => {
    const storedChartData = localStorage.getItem("chartData");
    const storedNoDataMessage = localStorage.getItem("noDataMessage");

    if (storedNoDataMessage) {
      setNoDataMessage(storedNoDataMessage);
      localStorage.removeItem("noDataMessage");
    }

    if (storedChartData) {
      try {
        const parsedData = JSON.parse(storedChartData);
        setChartDataState(parsedData);
      } catch (error) {
        console.error("Error parsing chart data:", error);
        setNoDataMessage("Error al cargar los datos del gráfico.");
      }
    }
  };

  useEffect(() => {
    const selectedGraphType = localStorage.getItem("selectedGraphType");
    const defaultGraphType = defaultChartTypes[nameGraph] || "Barra";
    setCurrentGraphType(selectedGraphType || defaultGraphType);
  }, [nameGraph]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  const loadName = () => {
    let res = localStorage.getItem("selectedGraphName");
    const date = JSON.parse(localStorage.getItem("dateRange"));
    const lastdateSincronizate = localStorage.getItem("lastdateSincro");

    if (date) {
      const lastest = new Date(lastdateSincronizate);
      // const dateAct = lastest.toISOString().slice(0, 10); // "2025-04-23"
      const dateAct = lastest.toLocaleDateString("en-CA", {
        timeZone: "America/Caracas",
      });
      const time = lastest.toLocaleTimeString("es-VE", {
        timeZone: "America/Caracas", // Zona horaria fija
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const formatted = `${dateAct} ${time.toLowerCase()}`;

      const from = new Date(date.from);
      const to = new Date(date.to);

      const fromFormatted = from.toLocaleDateString("en-CA");
      const toFormatted = to.toLocaleDateString("en-CA");

      const diffInTime = to.getTime() - from.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

      let typeRange;
      if (diffInDays <= 15) {
        typeRange = "Diario";
      } else if (diffInDays <= 45) {
        typeRange = "Semanal";
      } else {
        typeRange = "Mensual";
      }

      setNameGraph(res);
      setDateGraph(`${fromFormatted} / ${toFormatted}`);
      setLastDateSincro(formatted);
      // setLastDateSincroHour(hourFormated)
      setTypeRange(typeRange);
    }
  };

  // const renderChart = () => {
  //   if (noDataMessage) {
  //     return (
  //       <div className="not-found">
  //         <div className="icon-not-found"><NotFound /></div>
  //         <span>{noDataMessage}</span>
  //       </div>
  //     );
  //   }

  //   if (!chartDataState) {
  //     return <div>Cargando datos...</div>;
  //   }

  //   if (category === "Estadísticos") return renderStatisticalData();

  //   const chartData = chartDataState.results || chartDataState;
  //   const selectedGraph = localStorage.getItem("selectedGraph");
  //   const typeCompanies = localStorage.getItem("typeCompanies");

  //   if (selectedGraph === "flujoDeCaja") return renderStatisticalData();

  //   // --- LÓGICA PARA MULTIEMPRESA O COMPARATIVAS (MIXED) ---
  //   if (selectedGraph === "ventasVScompras" || typeCompanies === "Multiple") {
  //     switch (currentGraphType) {
  //       case "Barra":
  //         return (
  //           <BarChartMixedComponent
  //             data={chartData}
  //             dateRange={chartDataState.dateRange}
  //             dateTypeRange={typeRange}
  //           />
  //         );
  //       case "Torta":
  //         return (
  //           <PieChartMixedComponent
  //             data={chartData}
  //             dateRange={chartDataState.dateRange}
  //             dateTypeRange={typeRange}
  //           />
  //         );
  //       case "Línea":
  //         return (
  //           <LineChartMixedComponent
  //             data={chartData}
  //             dateRange={chartDataState.dateRange}
  //             dateTypeRange={typeRange}
  //           />
  //         );
  //       default:
  //         return (
  //           <BarChartMixedComponent
  //             data={chartData}
  //             dateRange={chartDataState.dateRange}
  //             dateTypeRange={typeRange}
  //           />
  //         );
  //     }
  //   }

  //   // --- LÓGICA PARA EMPRESA ÚNICA (ESTÁNDAR) ---
  //   switch (currentGraphType) {
  //     case "Barra":
  //       return (
  //         <BarChartComponent
  //           data={chartData}
  //           dateRange={chartDataState.dateRange}
  //           dateTypeRange={typeRange}
  //         />
  //       );
  //     case "Torta":
  //       return (
  //         <PieChartComponent
  //           data={chartData}
  //           dateRange={chartDataState.dateRange}
  //           dateTypeRange={typeRange}
  //         />
  //       );
  //     case "Línea":
  //       return (
  //         <LineChartComponent
  //           data={chartData}
  //           dateRange={chartDataState.dateRange}
  //           dateTypeRange={typeRange}
  //         />
  //       );
  //     default:
  //       return (
  //         <div className="not-found">
  //           <div className="icon-not-found"><NotFound /></div>
  //           <span>No se ha seleccionado ningún tipo de gráfico válido.</span>
  //         </div>
  //       );
  //   }
  // };

  const renderChart = () => {
    if (noDataMessage) {
      return (
        <div className="not-found">
          <div className="icon-not-found"><NotFound /></div>
          <span>{noDataMessage}</span>
        </div>
      );
    }

    if (!chartDataState) {
      return <div>Cargando datos...</div>;
    }

    if (category === "Estadísticos") return renderStatisticalData();

    const chartData = chartDataState.results || chartDataState;
    const selectedGraph = localStorage.getItem("selectedGraph");
    const typeCompanies = localStorage.getItem("typeCompanies");

    if (selectedGraph === "flujoDeCaja") return renderStatisticalData();

    if (selectedGraph === "ventasVScompras") {
      return (
        <BarChartMixedComponent
          data={chartData}
          dateRange={chartDataState.dateRange}
          dateTypeRange={typeRange}
        />
      );
    }

    if (typeCompanies === "Multiple") {
      switch (currentGraphType) {
        case "Barra":
          return (
            <BarChartMixedComponent
              data={chartData}
              dateRange={chartDataState.dateRange}
              dateTypeRange={typeRange}
            />
          );
        case "Torta":
          return (
            <PieChartMixedComponent
              data={chartData}
              dateRange={chartDataState.dateRange}
              dateTypeRange={typeRange}
            />
          );
        case "Línea":
          return (
            <LineChartMixedComponent
              data={chartData}
              dateRange={chartDataState.dateRange}
              dateTypeRange={typeRange}
            />
          );
        default:
          return (
            <BarChartMixedComponent
              data={chartData}
              dateRange={chartDataState.dateRange}
              dateTypeRange={typeRange}
            />
          );
      }
    }

    // --- LÓGICA PARA EMPRESA ÚNICA (ESTÁNDAR) ---
    switch (currentGraphType) {
      case "Barra":
        return (
          <BarChartComponent
            data={chartData}
            dateRange={chartDataState.dateRange}
            dateTypeRange={typeRange}
          />
        );
      case "Torta":
        return (
          <PieChartComponent
            data={chartData}
            dateRange={chartDataState.dateRange}
            dateTypeRange={typeRange}
          />
        );
      case "Línea":
        return (
          <LineChartComponent
            data={chartData}
            dateRange={chartDataState.dateRange}
            dateTypeRange={typeRange}
          />
        );
      default:
        return (
          <div className="not-found">
            <div className="icon-not-found"><NotFound /></div>
            <span>No se ha seleccionado ningún tipo de gráfico válido.</span>
          </div>
        );
    }
  };

  const renderStatisticalData = () => {
    if (!chartDataState || Object.keys(chartDataState).length === 0) {
      return <div>No hay datos estadísticos disponibles.</div>;
    }

    const typeCompanies = localStorage.getItem("typeCompanies");
    const dataEntries = Object.entries(chartDataState).filter(
      ([key]) => key !== "dateRange",
    );
    const uniqueCompanies = [
      ...new Set(dataEntries.flatMap(([, values]) => values.nomemp)),
    ];
    const activeCompany = confirmedCompany || uniqueCompanies[0];

    const handleSelectCompany = (company) => setSelectedCompany(company);
    const handleSaveSelection = () => {
      setConfirmedCompany(selectedCompany);
      setModalVisible(false);
    };

    const getKPIValue = (value) => {
      const parse = (v) => {
        if (v === null || v === undefined || v === "") return 0;
        if (typeof v === "number") return v;

        let str = v.toString().trim().replace(/[^\d.,-]/g, "");

        if (str.includes(",") && str.includes(".")) {
          str = str.replace(/\./g, "").replace(",", ".");
        } else if (str.includes(",")) {
          str = str.replace(",", ".");
        } else if (str.includes(".")) {
          const parts = str.split(".");
          if (parts.length > 2) {
            str = str.replace(/\./g, "");
          } else {
            if (parts[1].length !== 2) {
              str = str.replace(/\./g, "");
            }
          }
        }

        const n = parseFloat(str);
        return isNaN(n) ? 0 : n;
      };

      const format = (n) => {
        return new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(n);
      };

      const showTotalUnidadesKPIs = [
        "Productos más vendidos USD",
        "Productos más vendidos UND",
        "Laboratorio con más Ventas USD",
        "Laboratorio con más Ventas UND",
        "ProductosTOP"
      ];

      // Caso: UNIDADES
      if (criterio === "unidades") {
        const main = parse(value.unidades_vendidas ?? value.total_unidades ?? 0);
        const secondary = parse(value.total_ventas ?? value.totusd ?? 0);

        return {
          main: format(main),
          secondary: format(secondary)
        };
      }

      // Caso: MONTO
      const shouldShowSecondary = showTotalUnidadesKPIs.some(kpi => nameGraph.includes(kpi));

      const main = parse(value.total_ventas ?? value.totusd ?? 0);
      const secondary = shouldShowSecondary
        ? parse(value.total_unidades ?? value.unidades_vendidas ?? 0)
        : 0;

      return {
        main: format(main),
        secondary: format(secondary)
      };
    };

    const isTopDay =
      nameGraph.includes("Día más Exitoso") ||
      nameGraph.includes("Valores de Inventario");

    const hideDateForKPI = [
      "Productos más vendidos",
      "Fabricantes con más Ventas",
      "Cajeros con más Venta",
      "Flujo de Caja",
    ];

    const hideUnidadesForKPI = [
      "Día más Exitoso",
      "Venta más Exitosa",
      "Cajeros con más Venta",
      "Valores de Inventario",
    ];

    const hideNomempForKPI = [
      "Productos más vendidos",
      "Fabricantes con más Ventas",
      "Cajeros con más Venta",
      "Valores de Inventario",
      "Cajeros con más venta",
      "Flujo de Caja",
    ];

    const hideCompanySelectorForKPI = ["Día más Exitoso", "Venta más Exitosa"];

    const getFieldName = (key) => {
      // if (criterio === "unidades") {
      //   if (key === "total_ventas") return "Total Unidades";
      //   if (key === "total_unidades" || key === "unidades_vendidas") return "Total Ventas";
      // }

      const fieldNames = {
        nom_op_bs: "Nombre",
        cod_op_bs: "Código",
        nom_clibs: "Cliente",
        cod_clibs: "Código Cliente",
        nom_fab_bs: "Fabricante",
        cod_fab_bs: "Código Fabricante",
        nom_art_bs: "Producto",
        cod_art_bs: "Código Producto",
        numero_operaciones: "N° de Operaciones",
        unidades_vendidas: "Unidades Vendidas",
        fecha: "Fecha",
        total_ventas: "Total Ventas",
        total_unidades: "Total Unidades",
        cantidad_und_inv: "Cantidad de Unidades",
        total_usdca_inv: "Valor Inventario USD CA",
        total_usdcp_inv: "Valor Inventario USD CP",
        total_bsca_inv: "Valor Inventario BS CA",
        total_bscp_inv: "Valor Inventario BS CP",
        clientesa: "Clientes Atendidos",
        clientesf: "Clientes Frecuentes",
        clientesn: "Clientes Nuevos",
        nomemp: "Empresa",
        totusd: "Total Dolares",
        totcop: "Total Pesos",
        totbs: "Total Bs",
      };

      return fieldNames[key] || key;
    };

    const renderField = (fieldKey, fieldValue, value) => {
      const parseNumber = (v) => {
        if (v === null || v === undefined || v === "") return 0;
        if (typeof v === "number") return v;

        let str = v.toString().trim();

        if (str.includes(",") && str.includes(".")) {
          str = str.replace(/\./g, "").replace(",", ".");
        }
        else if (str.includes(",")) {
          str = str.replace(",", ".");
        }
        
        const n = parseFloat(str);
        return isNaN(n) ? 0 : n;
      };

      // Campos a ignorar siempre
      if (["id", "codemp"].includes(fieldKey)) return null;
      if (
        fieldKey === "total_unidades" &&
        hideUnidadesForKPI.includes(nameGraph)
      )
        return null;
      if (fieldKey === "fecha" && hideDateForKPI.includes(nameGraph))
        return null;
      if (fieldKey === "nomemp" && hideNomempForKPI.includes(nameGraph))
        return null;
      if (
        fieldKey === "nomemp" &&
        typeCompanies !== "Multiple" &&
        hideCompanySelectorForKPI.includes(nameGraph)
      )
        return null;

      // Fecha
      if (fieldKey === "fecha") {
        const date = new Date(fieldValue);
        const isoDate = date.toISOString().split("T")[0];
        return (
          <p
            key={fieldKey}
            className="text-sm text-gray-500 truncate dark:text-gray-400"
          >
            Fecha: {isoDate}
          </p>
        );
      }

      // Evitar repetir valores principales
      if (criterio === "monto" && fieldKey === "total_ventas") return null;
      if (
        criterio === "unidades" &&
        (fieldKey === "total_unidades" || fieldKey === "unidades_vendidas")
      )
        return null;

      // Mostrar Total Ventas solo si no es KPI principal
      if (fieldKey === "total_ventas") {
        return (
          <p
            key={fieldKey}
            className="text-sm text-gray-500 truncate dark:text-gray-400"
          >
            Total Ventas: $
            {parseNumber(fieldValue).toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        );
      }

      // Mostrar Total Unidades solo si no es KPI principal
      if (fieldKey === "total_unidades" || fieldKey === "unidades_vendidas") {
        return (
          <p
            key={fieldKey}
            className="text-sm text-gray-500 truncate dark:text-gray-400"
          >
            Total Unidades: {parseNumber(fieldValue).toLocaleString("es-ES")}
          </p>
        );
      }

      // Otros campos (producto, empresa, cliente, etc.)
      if (typeof fieldValue === "string" || typeof fieldValue === "number") {
        const formatNumber = (v) => {
          if (isNaN(v) || v === "" || v === null) return v;
          const number = parseFloat(v).toFixed(2);
          return number
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            .replace(/(\d+)\.(\d{2})$/, "$1,$2");
        };

        const codeFields = [
          "cod_art_bs",
          "cod_op_bs",
          "cod_clibs",
          "cod_fab_bs",
        ];
        const formattedValue = codeFields.includes(fieldKey)
          ? String(fieldValue)
          : formatNumber(fieldValue);

        return (
          <p
            key={fieldKey}
            className="text-sm text-gray-500 truncate dark:text-gray-400"
          >
            {getFieldName(fieldKey)}: {formattedValue}
          </p>
        );
      }

      return null;
    };

    const sortCriteriaMap = {
      "Productos más vendidos": "unidades_vendidas",
      "Fabricantes con más Ventas": "total_ventas",
      "Cajeros con más Venta": "numero_operaciones",
      "Día más Exitoso": "total_ventas",
      "Venta más Exitosa": "total_ventas",
      "Flujo de Caja": "total_ventas",
    };

    const sortKey =
      (nameGraph.includes("Productos más vendidos") ||
        nameGraph.includes("Laboratorio con más Ventas")) &&
        criterio === "unidades"
        ? "unidades_vendidas"
        : sortCriteriaMap[nameGraph] || "total_ventas";

    const parseNumber = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const cleaned = value.replace(/\./g, "").replace(/,/g, ".").replace(/\s*UND/i, "");
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
      }
      return 0;
    };


    const filteredEntries = dataEntries.filter(([, value]) =>
      hideCompanySelectorForKPI.includes(nameGraph)
        ? true
        : value.nomemp === activeCompany,
    );

    const sortedEntriesByKPI = filteredEntries.sort(
      ([, a], [, b]) => parseNumber(b[sortKey]) - parseNumber(a[sortKey]),
    );

    return (
      <div className="statistical-data w-full max-w-md p-6">
        {/* Mostrar iconos y empresa seleccionada */}
        {typeCompanies === "Multiple" &&
          !hideCompanySelectorForKPI.includes(nameGraph) && (
            <div>
              <button
                className="button-selectComp"
                onClick={() => setModalVisible(true)}
              >
                Seleccionar Empresa
              </button>
            </div>
          )}

        {activeCompany && !hideCompanySelectorForKPI.includes(nameGraph) && (
          <div
            style={{
              textAlign: "center",
              fontSize: "17px",
              fontWeight: 500,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            {activeCompany}
          </div>
        )}

        {nameGraph === "Día más Exitoso" && (
          <div className="found-winner">
            <Winner />
          </div>
        )}
        {nameGraph === "Venta más Exitosa" && (
          <div className="found-winner">
            <WinnerSale />
          </div>
        )}
        {nameGraph === "Fabricantes con más Ventas" && (
          <div className="found-winner">
            <FactoryLogo />
          </div>
        )}
        {nameGraph === "Cajeros con más Venta" && (
          <div className="found-winner">
            <Employee />
          </div>
        )}
        {nameGraph === "Productos más vendidos USD" && (
          <div className="found-winner">
            <Boxes />
          </div>
        )}
        {nameGraph === "Productos más vendidos UND" && (
          <div className="found-winner">
            <Boxes />
          </div>
        )}
        {nameGraph === "Laboratorio con más Ventas USD" && (
          <div className="found-winner">
            <FactoryLogo />
          </div>
        )}
        {nameGraph === "Laboratorio con más Ventas UND" && (
          <div className="found-winner">
            <FactoryLogo />
          </div>
        )}
        {nameGraph === "Valores de Inventario" && (
          <div className="found-winner">
            <Inventory />
          </div>
        )}
        {nameGraph === "Flujo de Caja" && (
          <div className="found-winner">
            <Earnings />
          </div>
        )}

        {/* Modal de selección */}
        {modalVisible && (
          <div className="modal-type" style={{ backgroundColor: "#00000042" }}>
            <div className="modal-content-type">
              <span
                className="close-button"
                onClick={() => setModalVisible(false)}
              >
                <CloseModal />
              </span>
              <h2 className="ti-graph">Seleccionar Empresa</h2>
              <ul className="flex flex-col text-center list-none gap-[20px]">
                {uniqueCompanies.map((company) => (
                  <li
                    key={company}
                    className={`separate ${selectedCompany === company ? "selected" : ""}`}
                  >
                    <button onClick={() => handleSelectCompany(company)}>
                      {company}
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", justifyContent: "end" }}>
                <button
                  style={{
                    padding: "5px 20px",
                    backgroundColor: "#4487B2",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    color: "white",
                    fontFamily: "title",
                    fontSize: "18px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={handleSaveSelection}
                >
                  Mostrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de datos estadísticos */}
        <div className="flow-root">
          <ul role="list" className="divide-y">
            {sortedEntriesByKPI.map(([key, value]) => {
              const sortedFields = Object.entries(value).sort(([a], [b]) => {
                if (hideCompanySelectorForKPI.includes(nameGraph)) {
                  if (a === "nomemp") return -1;
                  if (b === "nomemp") return 1;
                }
                if (isTopDay) {
                  if (a === "fecha") return -1;
                  if (b === "fecha") return 1;
                }
                return 0;
              });

              const { main } = getKPIValue(value);

              return (
                <li key={key} className="statistical-item py-10 sm:py-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 ms-4">
                      {sortedFields.map(([fieldKey, fieldValue]) =>
                        renderField(fieldKey, fieldValue, value),
                      )}
                    </div>
                    {nameGraph !== "Valores de Inventario" &&
                      nameGraph !== "Flujo de Caja" && (
                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                          {criterio === "unidades"
                            ? `${main} UND`
                            : `$${main}`}
                        </div>
                      )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  };

  const backRouter = (e) => {
    e.preventDefault();
    router.push("/listkpi");
  };

  const handleOpenGraphTypeModal = () => {
    setShowGraphTypeModal(true);
  };

  const handleSaveGraphType = (newGraphType) => {
    setCurrentGraphType(newGraphType);
    localStorage.setItem("selectedGraphType", newGraphType);
    setShowGraphTypeModal(false);
  };

  return (
    <div className="body">
      <div className="calendar gra-content">
        <div className="graph-option">
          <div className="graph-type" onClick={handleOpenGraphTypeModal}>
            <Options />
          </div>
          <div className="mood">
            <button
              className={`mood-btn ${darkMode ? "dark" : ""}`}
              onClick={toggleDarkMode}
            >
              <Sun className="icon" />
              <div className="circle2"></div>
              <Moon className="icon" />
            </button>
          </div>
        </div>

        <div className="graph__body">
          <div className="graph__header">
            <div className="content-header">
              <div className="graph__header__title">{nameGraph}</div>
              <div className="graph__header__data">
                <span> Periodo: {dateGraph}</span>
                <span>Última Actualización:</span>
                <span>{lastDateSincro}</span>
                {/* <span>{activeCompany}</span> */}
                {nameGraph !== "Día más Exitoso" &&
                  nameGraph !== "Venta más Exitosa" &&
                  nameGraph !== "Cajeros con más Venta" &&
                  nameGraph !== "Fabricantes con más Ventas" &&
                  nameGraph !== "Productos más vendidos" &&
                  nameGraph !== "Valores de Inventario" &&
                  nameGraph !== "Análisis de Ventas vs Compras" &&
                  nameGraph !== "Flujo de Caja" &&
                  (typeCompanies !== "Multiple" ? (
                    <div>
                      <span>Tipo de presentación de datos: {typeRange}</span>
                    </div>
                  ) : null)}
              </div>
            </div>
          </div>
          <div className="graph__body__content">{renderChart()}</div>

          <div className="button__graph">
            <button className="btn" onClick={backRouter}>
              <ArrowLeft />
              <span>Atrás</span>
            </button>
          </div>
        </div>

        <FooterGraph />
      </div>

      {/* Modal de tipos de gráfico */}
      {showGraphTypeModal && category !== "Estadísticos" && (
        <GraphTypeModal
          onClose={() => setShowGraphTypeModal(false)}
          onSave={handleSaveGraphType}
          selectedGraphName={nameGraph}
        />
      )}
    </div>
  );
}
