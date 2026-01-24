import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter } from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReportFiltersProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onPresetChange: (preset: string) => void;
}

export function ReportFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetChange,
}: ReportFiltersProps) {
  const [preset, setPreset] = useState("month");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const today = new Date();
    
    switch (value) {
      case "7days":
        onStartDateChange(subDays(today, 7));
        onEndDateChange(today);
        break;
      case "30days":
        onStartDateChange(subDays(today, 30));
        onEndDateChange(today);
        break;
      case "month":
        onStartDateChange(startOfMonth(today));
        onEndDateChange(endOfMonth(today));
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        onStartDateChange(startOfMonth(lastMonth));
        onEndDateChange(endOfMonth(lastMonth));
        break;
      case "year":
        onStartDateChange(startOfYear(today));
        onEndDateChange(today);
        break;
      case "custom":
        break;
    }
    onPresetChange(value);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="lastMonth">Mês passado</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Data início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && onStartDateChange(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">até</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && onEndDateChange(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
