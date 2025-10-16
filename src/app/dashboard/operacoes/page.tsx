'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TradeTable } from '@/components/trade-table';
import { TradeDialog } from '@/components/trade-dialog';
import type { Trade } from '@/types/trade';

export default function OperacoesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const handleAddTrade = (trade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
      userId: 'user-id', // Virá da sessão
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTrades([newTrade, ...trades]);
    setDialogOpen(false);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setDialogOpen(true);
  };

  const handleUpdateTrade = (updatedTrade: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTrade) return;
    
    const updated: Trade = {
      ...updatedTrade,
      id: editingTrade.id,
      userId: editingTrade.userId,
      createdAt: editingTrade.createdAt,
      updatedAt: new Date(),
    };
    
    setTrades(trades.map(t => t.id === updated.id ? updated : t));
    setDialogOpen(false);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operações</h1>
          <p className="text-muted-foreground">
            Gerencie todos os trades da sua equipe
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Operação
        </Button>
      </div>

      <TradeTable
        trades={trades}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
      />

      <TradeDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTrade(null);
        }}
        onSubmit={editingTrade ? handleUpdateTrade : handleAddTrade}
        initialData={editingTrade}
      />
    </div>
  );
}
