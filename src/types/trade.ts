export interface Trade {
  id: string;
  data: Date;
  hora: string;
  ativo: string;
  operacional: 'APG ABERTURA' | 'OUTRO';
  entrada: string;
  stopLoss?: number;
  takeProfit?: number;
  lucro: number;
  observacoes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeFormData {
  data: Date;
  hora: string;
  ativo: string;
  operacional: string;
  entrada: string;
  stopLoss?: number;
  takeProfit?: number;
  lucro: number;
  observacoes?: string;
}
