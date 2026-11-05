export type MetricUnit = 'M²' | 'M. LINEAR' | 'M³' | 'UN' | 'DIÁRIA';

export type OSStatus = 'URGENTE' | 'EXECUÇÃO' | 'LIBERADO' | 'EXECUTADO';

export type ReceiverKey = 'ELIENAY' | 'SAMIA';

export interface ReceiverInfo {
  key: ReceiverKey;
  nome: string;
  pix: string;
  formato: string;
}

export type TabId =
  | 'os'
  | 'medicao'
  | 'cronograma'
  | 'orcamento'
  | 'oc'
  | 'banco'
  | 'afericao'
  | 'webhook'
  | 'cloud';

export interface AnaliticoItem {
  tipo: 'INSUMO' | 'COMPOSICAO_AUX';
  codigo: string;
  descricao: string;
  unidade: string;
  coeficiente: number;
  precoUnitario: number;
  custoParcialTruncado: number;
  categoria: 'MAO_DE_OBRA' | 'MATERIAL' | 'EQUIPAMENTO';
}

export interface IBGEIndicator {
  competencia: string;
  uf: string;
  custoMedioM2: number;
  variacaoMensalPct: number;
  variacao12MPct: number;
  encargosDesoneradoPct: number;
  encargosOneradoPct: number;
  fonte: string;
}

export interface DBItem {
  idInterno?: string;
  code: string;
  priority: number;
  origin: 'BANCO_PROPRIO' | 'ADAPTADA' | 'SINAPI';
  sourceLabel: string;
  etapa?: string;
  grupo?: string;
  desc: string;
  unit: MetricUnit;
  priceMO: number;
  priceInsumo?: number;
  priceTotal: number;
  priceNaoDesonerado?: number;
  pctMO?: number;
  competencia?: string;
  category: string;
  itensAnaliticos?: AnaliticoItem[];
}

export interface AfericaoItem {
  id: string;
  tipo: 'QUARTO' | 'BANHEIRO' | 'CIRCULACAO' | 'MANUAL';
  ambiente: string;
  origem: string;
  comp: number;
  larg: number;
  peDireito: number;
  cotasMM: string;
}

export interface TimemarkPhoto {
  dataUrl: string;
  timestamp: string;
  coords: string;
  member: string;
  slot: number;
}

export interface OSItem {
  id: string;
  week: string;
  status: OSStatus;
  bloco: string;
  local: string;
  codeRef: string;
  desc: string;
  executor: string;
  unit: MetricUnit;
  prev: number;
  exec: number;
  unitPrice: number;
  costMode: 'MO_ONLY' | 'MO_INSUMO';
  prazo: string;
  afericao: string;
  recebedorKey: ReceiverKey;
  photos: (TimemarkPhoto | string | null)[];
}

export interface MedicaoItem {
  id: string;
  week: string;
  bloco: string;
  code: string;
  desc: string;
  unit: MetricUnit;
  unitPrice: number;
  qty: number;
  osId?: string;
}

export interface CronogramaItem {
  id: string;
  week: string;
  desc: string;
  recebedor: string;
  pix: string;
  formato: string;
  valor: number;
  autoTag?: string;
}

export interface OrcamentoItem {
  id: string;
  numero: number;
  data: string;
  titulo: string;
  solicitante: string;
  status: 'ABERTO' | 'APROVADO' | 'CONVERTIDO_OC';
  itensDesc: string;
  qtdEstimada: number;
  unidade: string;
  valorEstimadoUnit: number;
  fornecedorVencedor: string;
  fornecedorCNPJ: string;
  fornecedorFone: string;
}

export interface OCItem {
  desc: string;
  qty: number;
  unitPrice: number;
}

export interface OCOrder {
  id: string;
  numero: number;
  week: string;
  dataPedido: string;
  finalidade: string;
  fornecedorNome: string;
  fornecedorCNPJ: string;
  fornecedorFone: string;
  items: OCItem[];
  desconto: number;
  enviadoCronograma: boolean;
}

export interface WebhookLog {
  event_id: string;
  osId: string;
  colaborador: string;
  coords: string;
  timestamp: string;
  status: string;
}

export interface CloudRevision {
  revisionId: string;
  fileName: string;
  origin: string;
  timestamp: string;
  status: string;
  snapshot?: string;
}

export interface CronogramaReminderConfig {
  enabled: boolean;
  simulateFriday: boolean;
  plannedBudgets: Record<string, number>;
}

export interface CabralState {
  currentWeek: string;
  defaultReceiverKey: ReceiverKey;
  adminPassword: string;
  lastUpdatedTimestamp: number;
  processedEventIds: string[];
  webhookLogs: WebhookLog[];
  db: DBItem[];
  ibgeIndicators?: IBGEIndicator[];
  afericoesList: AfericaoItem[];
  osList: OSItem[];
  medicaoList: MedicaoItem[];
  cronogramaList: CronogramaItem[];
  orcamentosList: OrcamentoItem[];
  ocList: OCOrder[];
  cronogramaReminder?: CronogramaReminderConfig;
}

