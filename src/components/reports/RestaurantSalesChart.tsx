import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { RestaurantSalesData } from "@/types/report";
import { UtensilsCrossed } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RestaurantSalesChartProps {
  data: RestaurantSalesData[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(142, 76%, 36%)",
  "hsl(280, 65%, 60%)",
];

const chartConfig = {
  vendas: {
    label: "Vendas",
    color: "hsl(var(--primary))",
  },
  quantidade: {
    label: "Quantidade",
    color: "hsl(var(--secondary))",
  },
};

export function RestaurantSalesChart({ data }: RestaurantSalesChartProps) {
  const totalSales = data.reduce((sum, d) => sum + d.vendas, 0);
  const totalItems = data.reduce((sum, d) => sum + d.quantidade, 0);
  const topCategory = data.reduce((max, d) => d.vendas > max.vendas ? d : max, data[0]);

  const pieData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              Vendas do Restaurante
            </CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">{totalItems} itens vendidos</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pie">Pizza</TabsTrigger>
            <TabsTrigger value="bar">Barras</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pie">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="vendas"
                  nameKey="categoria"
                  label={({ categoria, percent }) => `${categoria} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="bar">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                  className="text-xs"
                />
                <YAxis 
                  dataKey="categoria" 
                  type="category" 
                  className="text-xs"
                  width={70}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Bar 
                  dataKey="vendas" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Categoria mais vendida: <span className="font-semibold text-foreground">{topCategory?.categoria}</span>
            {" "}com R$ {topCategory?.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
