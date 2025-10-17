'use client';

import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { format, startOfWeek, endOfWeek, getWeek, isSameWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Trade } from '@/types/trade';

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

interface WeekGroup {
  weekNumber: number;
  weekLabel: string;
  dateRange: string;
  trades: Trade[];
  totalProfit: number;
  winCount: number;
  lossCount: number;
}

export function TradeTable({ trades, onEdit, onDelete }: TradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  // Agrupar trades por semana
  const weekGroups = useMemo<WeekGroup[]>(() => {
    if (trades.length === 0) return [];

    // Ordenar trades por data (mais recente primeiro)
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const groups: Map<number, WeekGroup> = new Map();

    sortedTrades.forEach(trade => {
      const tradeDate = new Date(trade.data);
      const weekNum = getWeek(tradeDate, { locale: ptBR, weekStartsOn: 0 });
      const weekStart = startOfWeek(tradeDate, { locale: ptBR, weekStartsOn: 0 });
      const weekEnd = endOfWeek(tradeDate, { locale: ptBR, weekStartsOn: 0 });

      if (!groups.has(weekNum)) {
        groups.set(weekNum, {
          weekNumber: weekNum,
          weekLabel: `Semana ${weekNum}`,
          dateRange: `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`,
          trades: [],
          totalProfit: 0,
          winCount: 0,
          lossCount: 0,
        });
      }

      const group = groups.get(weekNum)!;
      group.trades.push(trade);
      group.totalProfit += trade.lucro;
      
      if (trade.lucro > 0) {
        group.winCount++;
      } else if (trade.lucro < 0) {
        group.lossCount++;
      }
    });

    return Array.from(groups.values()).sort((a, b) => b.weekNumber - a.weekNumber);
  }, [trades]);

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const columns: ColumnDef<Trade>[] = [
    {
      accessorKey: 'data',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return format(new Date(row.getValue('data')), 'dd/MM/yyyy', { locale: ptBR });
      },
    },
    {
      accessorKey: 'hora',
      header: 'Hora',
    },
    {
      accessorKey: 'ativo',
      header: 'Ativo',
      cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue('ativo')}</Badge>;
      },
    },
    {
      accessorKey: 'operacional',
      header: 'Operacional',
    },
    {
      accessorKey: 'entrada',
      header: 'Entrada',
    },
    {
      accessorKey: 'stopLoss',
      header: 'Stop Loss',
      cell: ({ row }) => {
        const value = row.getValue('stopLoss') as number | undefined;
        return value ? `$${value.toFixed(2)}` : '-';
      },
    },
    {
      accessorKey: 'takeProfit',
      header: 'Take Profit',
      cell: ({ row }) => {
        const value = row.getValue('takeProfit') as number | undefined;
        return value ? `$${value.toFixed(2)}` : '-';
      },
    },
    {
      accessorKey: 'lucro',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Lucro/Prejuízo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue('lucro') as number;
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
        
        return (
          <span className={value >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {formatted}
          </span>
        );
      },
    },
    {
      accessorKey: 'observacoes',
      header: 'Observações',
      cell: ({ row }) => {
        const obs = row.getValue('observacoes') as string | undefined;
        return obs ? (
          <div className="max-w-[200px] truncate" title={obs}>
            {obs}
          </div>
        ) : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const trade = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(trade)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(trade.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (trades.length === 0) {
    return (
      <div className="rounded-md border bg-white">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhuma operação registrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filtrar por ativo..."
          value={(columnFilters.find(f => f.id === 'ativo')?.value as string) ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            setColumnFilters(prev => 
              value 
                ? [...prev.filter(f => f.id !== 'ativo'), { id: 'ativo', value }]
                : prev.filter(f => f.id !== 'ativo')
            );
          }}
          className="max-w-sm"
        />
      </div>

      {/* Agrupar por semanas */}
      <div className="space-y-6">
        {weekGroups.map((weekGroup) => {
          const isExpanded = expandedWeeks.has(weekGroup.weekNumber);
          
          return (
            <div key={weekGroup.weekNumber} className="rounded-lg border bg-white overflow-hidden">
              {/* Header da Semana */}
              <div 
                className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleWeek(weekGroup.weekNumber)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{weekGroup.weekLabel}</h3>
                    <p className="text-sm text-muted-foreground">{weekGroup.dateRange}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Operações</p>
                    <p className="text-lg font-semibold">{weekGroup.trades.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Wins/Losses</p>
                    <p className="text-lg font-semibold">
                      <span className="text-green-600">{weekGroup.winCount}</span>
                      {' / '}
                      <span className="text-red-600">{weekGroup.lossCount}</span>
                    </p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className={`text-xl font-bold ${
                      weekGroup.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(weekGroup.totalProfit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabela de Trades (expandível) */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column.id || (column as any).accessorKey}>
                            {typeof column.header === 'function'
                              ? column.header({ column } as any)
                              : column.header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weekGroup.trades.map((trade) => (
                        <TableRow key={trade.id}>
                          {columns.map((column) => (
                            <TableCell key={column.id || (column as any).accessorKey}>
                              {column.cell
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ? column.cell({ row: { original: trade, getValue: (key: string) => (trade as any)[key] } } as any)
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                : (trade as any)[(column as any).accessorKey]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
