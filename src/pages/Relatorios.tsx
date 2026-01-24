import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { OccupancyChart } from "@/components/reports/OccupancyChart";
import { RestaurantSalesChart } from "@/components/reports/RestaurantSalesChart";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { SummaryCards } from "@/components/reports/SummaryCards";
import { DailySummaryTable } from "@/components/reports/DailySummaryTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, PieChart, Table } from "lucide-react";
import { startOfMonth, endOfMonth, format, eachDayOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RevenueData, OccupancyData, RestaurantSalesData, DailySummary } from "@/types/report";

// Generate mock data for demonstration
const generateRevenueData = (): RevenueData[] => {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const hospedagem = Math.floor(Math.random() * 50000) + 30000;
    const restaurante = Math.floor(Math.random() * 20000) + 10000;
    const outros = Math.floor(Math.random() * 5000) + 2000;
    months.push({
      month: format(date, 'MMM/yy', { locale: ptBR }),
      hospedagem,
      restaurante,
      outros,
      total: hospedagem + restaurante + outros,
    });
  }
  return months;
};

const generateOccupancyData = (startDate: Date, endDate: Date): OccupancyData[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.map(day => {
    const taxa = Math.floor(Math.random() * 40) + 50; // 50-90%
    const quartosDisponiveis = 30;
    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      taxa,
      quartosOcupados: Math.floor((taxa / 100) * quartosDisponiveis),
      quartosDisponiveis,
    };
  });
};

const generateRestaurantData = (): RestaurantSalesData[] => [
  { categoria: "Pratos Principais", vendas: 15800, quantidade: 245 },
  { categoria: "Bebidas", vendas: 8500, quantidade: 520 },
  { categoria: "Sobremesas", vendas: 4200, quantidade: 180 },
  { categoria: "Entradas", vendas: 6300, quantidade: 210 },
  { categoria: "Lanches", vendas: 3800, quantidade: 95 },
  { categoria: "Café da Manhã", vendas: 9200, quantidade: 380 },
];

const generateDailySummary = (startDate: Date, endDate: Date): DailySummary[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.map(day => ({
    date: format(day, 'dd/MM/yyyy', { locale: ptBR }),
    receita: Math.floor(Math.random() * 5000) + 2000,
    ocupacao: Math.floor(Math.random() * 40) + 50,
    checkIns: Math.floor(Math.random() * 8) + 1,
    checkOuts: Math.floor(Math.random() * 6) + 1,
    pedidosRestaurante: Math.floor(Math.random() * 30) + 10,
  }));
};

export default function Relatorios() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  // Generate mock data
  const revenueData = generateRevenueData();
  const occupancyData = generateOccupancyData(startDate, endDate);
  const restaurantData = generateRestaurantData();
  const dailySummary = generateDailySummary(startDate, endDate);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8" id="report-content">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Análise completa do desempenho do hotel
            </p>
          </div>
          <ExportButtons 
            revenueData={revenueData}
            occupancyData={occupancyData}
            restaurantData={restaurantData}
            dailySummary={dailySummary}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ReportFilters
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPresetChange={() => {}}
          />
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCards 
            revenueData={revenueData}
            occupancyData={occupancyData}
            restaurantData={restaurantData}
            dailySummary={dailySummary}
          />
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Receita
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="gap-2">
                <PieChart className="h-4 w-4" />
                Restaurante
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <Table className="h-4 w-4" />
                Detalhado
              </TabsTrigger>
            </TabsList>

            <Select value={chartType} onValueChange={(v) => setChartType(v as 'bar' | 'line' | 'area')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Linhas</SelectItem>
                <SelectItem value="area">Área</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={revenueData} chartType={chartType} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OccupancyChart data={occupancyData} />
              <RestaurantSalesChart data={restaurantData} />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueChart data={revenueData} chartType={chartType} />
            <OccupancyChart data={occupancyData} />
          </TabsContent>

          <TabsContent value="restaurant" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RestaurantSalesChart data={restaurantData} />
              <OccupancyChart data={occupancyData} />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <DailySummaryTable data={dailySummary} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
