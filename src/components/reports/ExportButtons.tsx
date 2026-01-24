import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { RevenueData, OccupancyData, RestaurantSalesData, DailySummary } from "@/types/report";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExportButtonsProps {
  revenueData: RevenueData[];
  occupancyData: OccupancyData[];
  restaurantData: RestaurantSalesData[];
  dailySummary: DailySummary[];
  startDate: Date;
  endDate: Date;
}

export function ExportButtons({
  revenueData,
  occupancyData,
  restaurantData,
  dailySummary,
  startDate,
  endDate,
}: ExportButtonsProps) {
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Revenue Sheet
      const revenueSheet = XLSX.utils.json_to_sheet(
        revenueData.map(d => ({
          'Mês': d.month,
          'Hospedagem (R$)': d.hospedagem,
          'Restaurante (R$)': d.restaurante,
          'Outros (R$)': d.outros,
          'Total (R$)': d.total,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, revenueSheet, "Receita Mensal");

      // Occupancy Sheet
      const occupancySheet = XLSX.utils.json_to_sheet(
        occupancyData.map(d => ({
          'Data': d.date,
          'Taxa de Ocupação (%)': d.taxa,
          'Quartos Ocupados': d.quartosOcupados,
          'Quartos Disponíveis': d.quartosDisponiveis,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, occupancySheet, "Ocupação");

      // Restaurant Sales Sheet
      const restaurantSheet = XLSX.utils.json_to_sheet(
        restaurantData.map(d => ({
          'Categoria': d.categoria,
          'Vendas (R$)': d.vendas,
          'Quantidade': d.quantidade,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, restaurantSheet, "Vendas Restaurante");

      // Daily Summary Sheet
      const summarySheet = XLSX.utils.json_to_sheet(
        dailySummary.map(d => ({
          'Data': d.date,
          'Receita (R$)': d.receita,
          'Ocupação (%)': d.ocupacao,
          'Check-ins': d.checkIns,
          'Check-outs': d.checkOuts,
          'Pedidos Restaurante': d.pedidosRestaurante,
        }))
      );
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo Diário");

      // Generate filename with date range
      const filename = `Relatorio_Hotel_${format(startDate, 'dd-MM-yyyy')}_a_${format(endDate, 'dd-MM-yyyy')}.xlsx`;
      
      XLSX.writeFile(workbook, filename);
      toast.success("Relatório Excel exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar para Excel");
      console.error(error);
    }
  };

  const exportToPDF = () => {
    // Create a printable version of the report
    const printContent = document.getElementById('report-content');
    if (!printContent) {
      toast.error("Erro ao gerar PDF");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup bloqueado. Permita popups para exportar PDF.");
      return;
    }

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1a1a1a; margin-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .period { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        .summary-box { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .summary-item { display: inline-block; margin-right: 30px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #1a1a1a; }
        .summary-label { font-size: 12px; color: #666; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    `;

    const totalRevenue = revenueData.reduce((sum, d) => sum + d.total, 0);
    const avgOccupancy = occupancyData.length > 0 
      ? occupancyData.reduce((sum, d) => sum + d.taxa, 0) / occupancyData.length 
      : 0;
    const totalRestaurantSales = restaurantData.reduce((sum, d) => sum + d.vendas, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório - ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}</title>
          ${styles}
        </head>
        <body>
          <div class="header">
            <h1>Relatório Gerencial</h1>
            <p class="period">Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}</p>
          </div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-value">R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="summary-label">Receita Total</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${avgOccupancy.toFixed(1)}%</div>
              <div class="summary-label">Ocupação Média</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">R$ ${totalRestaurantSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="summary-label">Vendas Restaurante</div>
            </div>
          </div>

          <h2>Receita Mensal</h2>
          <table>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Hospedagem</th>
                <th>Restaurante</th>
                <th>Outros</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${revenueData.map(d => `
                <tr>
                  <td>${d.month}</td>
                  <td>R$ ${d.hospedagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ ${d.restaurante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ ${d.outros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ ${d.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Vendas do Restaurante por Categoria</h2>
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Vendas</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${restaurantData.map(d => `
                <tr>
                  <td>${d.categoria}</td>
                  <td>R$ ${d.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${d.quantidade}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Resumo Diário</h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Receita</th>
                <th>Ocupação</th>
                <th>Check-ins</th>
                <th>Check-outs</th>
                <th>Pedidos Rest.</th>
              </tr>
            </thead>
            <tbody>
              ${dailySummary.slice(0, 15).map(d => `
                <tr>
                  <td>${d.date}</td>
                  <td>R$ ${d.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${d.ocupacao.toFixed(1)}%</td>
                  <td>${d.checkIns}</td>
                  <td>${d.checkOuts}</td>
                  <td>${d.pedidosRestaurante}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      toast.success("PDF gerado! Use 'Salvar como PDF' na janela de impressão.");
    }, 500);
  };

  const printReport = () => {
    window.print();
    toast.success("Imprimindo relatório...");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport} className="gap-2 cursor-pointer">
          <Printer className="h-4 w-4" />
          Imprimir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
