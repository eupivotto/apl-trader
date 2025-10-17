'use client';

import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, getWeek } from 'date-fns';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [filterValue, setFilterValue] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);

  // Agrupar trades por semana
  const weekGroups = useMemo<WeekGroup[]>(() => {
    if (trades.length === 0) return [];

    const filteredTrades = trades.filter(trade => 
      !filterValue || trade.ativo.toLowerCase().includes(filterValue.toLowerCase())
    );

    const sortedTrades = [...filteredTrades].sort((a, b) => 
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
          weekLabel: `Semana ${String(weekNum).padStart(2, '0')}`,
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
  }, [trades, filterValue]);

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const handleDeleteClick = (trade: Trade) => {
    setTradeToDelete(trade);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tradeToDelete) {
      onDelete(tradeToDelete.id);
      setDeleteDialogOpen(false);
      setTradeToDelete(null);
    }
  };

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
      {/* Filtro */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filtrar por ativo..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Grupos por Semana */}
      <div className="space-y-6">
        {weekGroups.map((weekGroup) => {
          const isExpanded = expandedWeeks.has(weekGroup.weekNumber);
          
          return (
            <div key={weekGroup.weekNumber} className="rounded-lg border bg-white overflow-hidden shadow-sm">
              {/* Header da Semana */}
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all"
                onClick={() => toggleWeek(weekGroup.weekNumber)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{weekGroup.weekLabel}</h3>
                    <p className="text-sm text-gray-600">{weekGroup.dateRange}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Operações</p>
                    <p className="text-lg font-semibold text-gray-800">{weekGroup.trades.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Wins/Losses</p>
                    <p className="text-lg font-semibold">
                      <span className="text-green-600">{weekGroup.winCount}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600">{weekGroup.lossCount}</span>
                    </p>
                  </div>
                  <div className="text-right min-w-[140px] bg-white rounded-lg px-4 py-2 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase mb-1">Total Semana</p>
                    <p className={`text-2xl font-bold ${
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

              {/* Tabela de Trades */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Hora</TableHead>
                        <TableHead className="font-semibold">Ativo</TableHead>
                        <TableHead className="font-semibold">Operacional</TableHead>
                        <TableHead className="font-semibold">Entrada</TableHead>
                        <TableHead className="font-semibold">Stop Loss</TableHead>
                        <TableHead className="font-semibold">Take Profit</TableHead>
                        <TableHead className="font-semibold">Lucro/Prejuízo</TableHead>
                        <TableHead className="font-semibold">Observações</TableHead>
                        <TableHead className="font-semibold text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weekGroup.trades.map((trade) => (
                        <TableRow key={trade.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">
                            {format(new Date(trade.data), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>{trade.hora}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-semibold">
                              {trade.ativo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{trade.operacional}</TableCell>
                          <TableCell className="font-mono text-sm">{trade.entrada}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {trade.takeProfit ? `$${trade.takeProfit.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`font-bold ${
                              trade.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(trade.lucro)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {trade.observacoes ? (
                              <div className="max-w-[200px] truncate text-sm text-gray-600" title={trade.observacoes}>
                                {trade.observacoes}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200" onClick={() => console.log('DropdownMenuTrigger clicked')}>
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onEdit(trade)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Editar operação</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(trade)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir operação</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
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

      {weekGroups.length === 0 && (
        <div className="rounded-md border bg-white p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma operação encontrada com o filtro aplicado.
          </p>
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta operação?
              {tradeToDelete && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-semibold text-gray-800">
                    {tradeToDelete.ativo} - {format(new Date(tradeToDelete.data), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lucro/Prejuízo: <span className={tradeToDelete.lucro >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(tradeToDelete.lucro)}
                    </span>
                  </p>
                </div>
              )}
              <p className="mt-4 text-sm">
                Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
