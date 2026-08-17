import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { OccupancyData } from "@/types/report";
import { Bed, TrendingUp } from "lucide-react";

interface OccupancyChartProps {
  data: OccupancyData[];
}

const chartConfig = {
  taxa: {
    label: "Taxa de Ocupação",
    color: "hsl(var(--primary))",
  },
};

export function OccupancyChart({ data }: OccupancyChartProps) {
  const avgOccupancy = data.length > 0 
    ? data.reduce((sum, d) => sum + d.taxa, 0) / data.length 
    : 0;
  const maxOccupancy = Math.max(...data.map(d => d.taxa));
  const minOccupancy = Math.min(...data.map(d => d.taxa));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              Taxa de Ocupação
            </CardTitle>
            <CardDescription>Evolução da ocupação no período</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {avgOccupancy.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">média do período</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <p className="text-lg font-bold text-success">{maxOccupancy.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Máxima</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-lg font-bold text-primary">{avgOccupancy.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Média</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <p className="text-lg font-bold text-destructive">{minOccupancy.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Mínima</p>
          </div>
        </div>
        
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
            <ReferenceLine y={avgOccupancy} stroke="hsl(var(--secondary))" strokeDasharray="5 5" />
            <Area 
              type="monotone" 
              dataKey="taxa" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#occupancyGradient)" 
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
