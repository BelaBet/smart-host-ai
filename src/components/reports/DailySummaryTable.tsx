import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DailySummary } from "@/types/report";
import { CalendarDays } from "lucide-react";

interface DailySummaryTableProps {
  data: DailySummary[];
}

export function DailySummaryTable({ data }: DailySummaryTableProps) {
  const getOccupancyBadge = (ocupacao: number) => {
    if (ocupacao >= 80) return <Badge variant="default" className="bg-success">Alta</Badge>;
    if (ocupacao >= 50) return <Badge variant="secondary">Média</Badge>;
    return <Badge variant="outline">Baixa</Badge>;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Resumo Diário
        </CardTitle>
        <CardDescription>Detalhamento dia a dia do período</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead className="text-center">Check-ins</TableHead>
                <TableHead className="text-center">Check-outs</TableHead>
                <TableHead className="text-center">Pedidos Rest.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell>
                    R$ {row.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{row.ocupacao.toFixed(1)}%</span>
                      {getOccupancyBadge(row.ocupacao)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{row.checkIns}</TableCell>
                  <TableCell className="text-center">{row.checkOuts}</TableCell>
                  <TableCell className="text-center">{row.pedidosRestaurante}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
