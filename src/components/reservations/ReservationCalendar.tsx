import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reservation, reservationStatusConfig } from "@/types/reservation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReservationCalendarProps {
  reservations: Reservation[];
  onDayClick: (date: Date) => void;
  onReservationClick: (reservation: Reservation) => void;
}

export function ReservationCalendar({ 
  reservations, 
  onDayClick, 
  onReservationClick 
}: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const getReservationsForDay = (date: Date) => {
    return reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      
      return isWithinInterval(compareDate, { start: checkIn, end: checkOut }) && 
             reservation.status !== "cancelled";
    });
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50",
                  !isCurrentMonth && "opacity-40 bg-muted/30",
                  isToday && "ring-2 ring-primary"
                )}
                onClick={() => onDayClick(day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayReservations.slice(0, 2).map((reservation) => {
                    const config = reservationStatusConfig[reservation.status];
                    const isCheckIn = isSameDay(new Date(reservation.checkIn), day);
                    const isCheckOut = isSameDay(new Date(reservation.checkOut), day);
                    
                    return (
                      <Tooltip key={reservation.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer",
                              config.bgColor,
                              config.color
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReservationClick(reservation);
                            }}
                          >
                            {isCheckIn && "➡️ "}
                            {isCheckOut && "⬅️ "}
                            {reservation.roomNumber}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-semibold">{reservation.guestName}</p>
                            <p>Quarto {reservation.roomNumber}</p>
                            <p>{config.label}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {dayReservations.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayReservations.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          {Object.entries(reservationStatusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded", config.bgColor)} />
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
