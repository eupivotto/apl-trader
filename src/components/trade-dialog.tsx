'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Trade } from '@/types/trade';

const tradeSchema = z.object({
  data: z.string(),
  hora: z.string(),
  ativo: z.string().min(1, 'Ativo é obrigatório'),
  operacional: z.string().min(1, 'Operacional é obrigatório'),
  entrada: z.string().min(1, 'Entrada é obrigatória'),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  lucro: z.string(),
  observacoes: z.string().optional(),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

interface TradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (trade: any) => void;
  initialData?: Trade | null;
}

export function TradeDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: TradeDialogProps) {
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: initialData
      ? {
          data: new Date(initialData.data).toISOString().split('T')[0],
          hora: initialData.hora,
          ativo: initialData.ativo,
          operacional: initialData.operacional,
          entrada: initialData.entrada,
          stopLoss: initialData.stopLoss?.toString() || '',
          takeProfit: initialData.takeProfit?.toString() || '',
          lucro: initialData.lucro.toString(),
          observacoes: initialData.observacoes || '',
        }
      : {
          data: new Date().toISOString().split('T')[0],
          hora: '',
          ativo: '',
          operacional: 'APG ABERTURA',
          entrada: '',
          stopLoss: '',
          takeProfit: '',
          lucro: '0',
          observacoes: '',
        },
  });

  const handleSubmit = (values: TradeFormValues) => {
    onSubmit({
      data: new Date(values.data),
      hora: values.hora,
      ativo: values.ativo,
      operacional: values.operacional,
      entrada: values.entrada,
      stopLoss: values.stopLoss ? parseFloat(values.stopLoss) : undefined,
      takeProfit: values.takeProfit ? parseFloat(values.takeProfit) : undefined,
      lucro: parseFloat(values.lucro),
      observacoes: values.observacoes,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Operação' : 'Nova Operação'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Atualize os dados da operação'
              : 'Adicione uma nova operação ao sistema'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ativo</FormLabel>
                    <FormControl>
                      <Input placeholder="HK50, XAUUSD, etc..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operacional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operacional</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APG ABERTURA">APG ABERTURA</SelectItem>
                        <SelectItem value="SCALPING">SCALPING</SelectItem>
                        <SelectItem value="SWING">SWING</SelectItem>
                        <SelectItem value="DAY TRADE">DAY TRADE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="entrada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrada</FormLabel>
                  <FormControl>
                    <Input placeholder="ST $ 25 / 2R 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stopLoss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="takeProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Take Profit</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lucro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lucro/Prejuízo</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas sobre a operação..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {initialData ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
