import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from "recharts";
import { RevenueData } from "@/types/report";
import { TrendingUp, DollarSign } from "lucide-react";

interface RevenueChartProps {
  data: RevenueData[];
  chartType?: 'bar' | 'line' | 'area';
}

const chartConfig = {
  hospedagem: {
    label: "Hospedagem",
    color: "hsl(var(--primary))",
  },
  restaurante: {
    label: "Restaurante",
    color: "hsl(var(--secondary))",
  },
  outros: {
    label: "Outros",
    color: "hsl(var(--accent))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--success))",
  },
};

export function RevenueChart({ data, chartType = 'bar' }: RevenueChartProps) {
  const totalRevenue = data.reduce((sum, d) => sum + d.total, 0);
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const lastMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const growth = previousMonth ? ((lastMonth?.total - previousMonth.total) / previousMonth.total) * 100 : 0;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Receita Mensal
            </CardTitle>
            <CardDescription>Visão geral da receita por categoria</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-sm flex items-center gap-1 justify-end ${growth >= 0 ? 'text-success' : 'text-destructive'}`}>
              <TrendingUp className={`h-4 w-4 ${growth < 0 ? 'rotate-180' : ''}`} />
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs. mês anterior
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="hospedagem" fill="var(--color-hospedagem)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="restaurante" fill="var(--color-restaurante)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outros" fill="var(--color-outros)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="hospedagem" stroke="var(--color-hospedagem)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="restaurante" stroke="var(--color-restaurante)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                className="text-xs"
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="total" fill="var(--color-total)" fillOpacity={0.2} stroke="var(--color-total)" />
              <Bar dataKey="hospedagem" fill="var(--color-hospedagem)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="restaurante" fill="var(--color-restaurante)" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
