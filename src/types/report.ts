export interface RevenueData {
  month: string;
  hospedagem: number;
  restaurante: number;
  outros: number;
  total: number;
}

export interface OccupancyData {
  date: string;
  taxa: number;
  quartosOcupados: number;
  quartosDisponiveis: number;
}

export interface RestaurantSalesData {
  categoria: string;
  vendas: number;
  quantidade: number;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  reportType: 'revenue' | 'occupancy' | 'restaurant' | 'all';
}

export interface DailySummary {
  date: string;
  receita: number;
  ocupacao: number;
  checkIns: number;
  checkOuts: number;
  pedidosRestaurante: number;
}
