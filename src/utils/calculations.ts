import {
  AfericaoItem,
  CronogramaItem,
  DBItem,
  MedicaoItem,
  MetricUnit,
  OCItem,
  OSItem,
  ReceiverInfo,
} from '../types/cabral';

export function brl(v: number | undefined | null): string {
  return (Number(v) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function numBR(v: number | undefined | null): string {
  return (Number(v) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Regra Oficial CAIXA / TCU (Livro SINAPI: Cálculos e Parâmetros):
 * Custo parcial truncado em 2 casas decimais: Math.floor((coef * precoUnit + 1e-9) * 100) / 100
 */
export function truncateTCU(coeficiente: number, precoUnitario: number): number {
  const c = Number(coeficiente) || 0;
  const p = Number(precoUnitario) || 0;
  return Math.floor((c * p + 1e-9) * 100) / 100;
}

export function recalculateAnalyticalComposition(item: DBItem): DBItem {
  if (!item.itensAnaliticos || item.itensAnaliticos.length === 0) {
    const insumo =
      item.priceInsumo !== undefined
        ? item.priceInsumo
        : Math.max(0, +(item.priceTotal - item.priceMO).toFixed(2));
    const total = +(item.priceMO + insumo).toFixed(2);
    const pctMO = total > 0 ? +((item.priceMO / total) * 100).toFixed(1) : 0;
    return {
      ...item,
      priceInsumo: insumo,
      priceTotal: total,
      priceNaoDesonerado:
        item.priceNaoDesonerado || +(total * 1.068).toFixed(2),
      pctMO,
    };
  }

  let mo = 0;
  let insumos = 0;
  const updatedChildren = item.itensAnaliticos.map((child) => {
    const parcial = truncateTCU(child.coeficiente, child.precoUnitario);
    if (child.categoria === 'MAO_DE_OBRA') {
      mo = Math.round((mo + parcial) * 100) / 100;
    } else {
      insumos = Math.round((insumos + parcial) * 100) / 100;
    }
    return {
      ...child,
      custoParcialTruncado: parcial,
    };
  });

  const total = Math.round((mo + insumos) * 100) / 100;
  const pctMO = total > 0 ? +((mo / total) * 100).toFixed(1) : 0;

  return {
    ...item,
    priceMO: mo,
    priceInsumo: insumos,
    priceTotal: total,
    priceNaoDesonerado: +(total * 1.068).toFixed(2),
    pctMO,
    itensAnaliticos: updatedChildren,
  };
}

export function detectMetricFromDescription(desc: string): {
  unit: MetricUnit;
  label: string;
} {
  const d = String(desc || '').toUpperCase();
  if (
    d.includes('DIÁRIA') ||
    d.includes('DIARIA') ||
    d.includes('SEPARAÇÃO DE PRUMADAS')
  ) {
    return { unit: 'DIÁRIA', label: 'DIÁRIA' };
  }
  if (
    d.includes('VERMICULITA') ||
    d.includes('CONCRETAGEM') ||
    d.includes('M³') ||
    d.includes('VOLUME')
  ) {
    return { unit: 'M³', label: 'M³' };
  }
  if (
    d.includes('PONTUAL') ||
    d.includes('PONTO DE') ||
    d.includes('VIGA BALDRAME') ||
    d.includes('LAJE TRELIÇADA') ||
    d.includes('KIT')
  ) {
    return { unit: 'UN', label: 'UN' };
  }
  if (
    d.includes('LINEAR') ||
    d.includes('REQUADRO') ||
    d.includes('RODAPÉ') ||
    d.includes('RODAPE') ||
    d.includes('GRAUTE') ||
    d.includes('VIGAS') ||
    d.includes('COLUNAS') ||
    d.includes('TUBULAÇÃO')
  ) {
    return { unit: 'M. LINEAR', label: 'M. LINEAR' };
  }
  return { unit: 'M²', label: 'M²' };
}

export function calculateAfericaoMetrics(
  comp: number,
  larg: number,
  peDireito: number
): {
  areaPiso: number;
  perimetro: number;
  areaParede: number;
} {
  const c = Number(comp) || 0;
  const l = Number(larg) || 0;
  const pd = Number(peDireito) || 0;
  const areaPiso = +(c * l).toFixed(2);
  const perimetro = +(2 * (c + l)).toFixed(2);
  const areaParede = +(perimetro * pd).toFixed(2);
  return { areaPiso, perimetro, areaParede };
}

export function computeDimensionForMode(
  room: AfericaoItem,
  mode: string,
  currentUnit: MetricUnit
): { value: number; formula: string; suggestedUnit: MetricUnit } {
  const metrics = calculateAfericaoMetrics(room.comp, room.larg, room.peDireito);
  const effectiveMode =
    mode === 'AUTO'
      ? currentUnit === 'M. LINEAR'
        ? 'PERIMETRO'
        : currentUnit === 'UN'
        ? 'UNIDADE'
        : 'AREA_PISO'
      : mode;

  if (effectiveMode === 'PERIMETRO') {
    return {
      value: metrics.perimetro,
      formula: `${room.ambiente} Perím. 2×(${room.comp}m+${room.larg}m) = ${metrics.perimetro} M.Lin`,
      suggestedUnit: 'M. LINEAR',
    };
  }
  if (effectiveMode === 'AREA_PAREDE') {
    return {
      value: metrics.areaParede,
      formula: `${room.ambiente} Parede (${metrics.perimetro}m × ${room.peDireito}m) = ${metrics.areaParede} M²`,
      suggestedUnit: 'M²',
    };
  }
  if (effectiveMode === 'UNIDADE') {
    return {
      value: 1,
      formula: `${room.ambiente} (1 UN)`,
      suggestedUnit: 'UN',
    };
  }
  return {
    value: metrics.areaPiso,
    formula: `${room.ambiente} (${room.comp}m × ${room.larg}m = ${metrics.areaPiso} M²)`,
    suggestedUnit: 'M²',
  };
}

export function syncOSWithMedicaoList(
  os: OSItem,
  medicaoList: MedicaoItem[]
): MedicaoItem[] {
  const next = [...medicaoList];
  const existingIdx = next.findIndex(
    (m) => m.osId === os.id && m.week === os.week
  );

  if (os.status === 'EXECUTADO' && os.exec > 0) {
    const item: MedicaoItem = {
      id: existingIdx >= 0 ? next[existingIdx].id : `MED-${os.id}`,
      week: os.week,
      bloco: os.bloco,
      code: os.codeRef || 'PRP',
      desc: `[${os.id}] ${os.desc}`,
      unit: os.unit,
      unitPrice: os.unitPrice,
      qty: os.exec,
      osId: os.id,
    };
    if (existingIdx >= 0) {
      next[existingIdx] = item;
    } else {
      next.push(item);
    }
  } else if (existingIdx >= 0) {
    next.splice(existingIdx, 1);
  }
  return next;
}

export function calculateMedicaoBlockTotals(
  week: string,
  medicaoList: MedicaoItem[]
): {
  sumAlv: number;
  sumRev: number;
  sumEma: number;
  sumOutros: number;
  sumTotal: number;
} {
  const list = medicaoList.filter((m) => m.week === week);
  let sumAlv = 0;
  let sumRev = 0;
  let sumEma = 0;
  let sumOutros = 0;

  for (const m of list) {
    const sub = (Number(m.qty) || 0) * (Number(m.unitPrice) || 0);
    const b = String(m.bloco || '').toUpperCase();
    if (b.includes('ALVENARIA')) {
      sumAlv += sub;
    } else if (b.includes('REVESTIMENTO')) {
      sumRev += sub;
    } else if (b.includes('EMASSAMENTO')) {
      sumEma += sub;
    } else {
      sumOutros += sub;
    }
  }

  const sumTotal = +(sumAlv + sumRev + sumEma + sumOutros).toFixed(2);
  return {
    sumAlv: +sumAlv.toFixed(2),
    sumRev: +sumRev.toFixed(2),
    sumEma: +sumEma.toFixed(2),
    sumOutros: +sumOutros.toFixed(2),
    sumTotal,
  };
}

export function syncMedicaoToCronogramaList(
  week: string,
  medicaoList: MedicaoItem[],
  cronogramaList: CronogramaItem[],
  receiver: ReceiverInfo
): CronogramaItem[] {
  const { sumAlv, sumRev, sumEma, sumOutros } = calculateMedicaoBlockTotals(
    week,
    medicaoList
  );

  const filtered = cronogramaList.filter(
    (c) =>
      !(
        c.week === week &&
        ['AUTO_ALV', 'AUTO_REV', 'AUTO_EMA', 'AUTO_OUTROS'].includes(
          c.autoTag || ''
        )
      )
  );

  const autoItems: CronogramaItem[] = [];
  if (sumAlv > 0) {
    autoItems.push({
      id: `CR-${week}-ALV`,
      week,
      desc: `ALVENARIA 1, 2 E 3 (${week})`,
      recebedor: receiver.nome,
      pix: receiver.pix,
      formato: receiver.formato,
      valor: sumAlv,
      autoTag: 'AUTO_ALV',
    });
  }
  if (sumRev > 0) {
    autoItems.push({
      id: `CR-${week}-REV`,
      week,
      desc: `REVESTIMENTOS EM GERAL (${week})`,
      recebedor: receiver.nome,
      pix: receiver.pix,
      formato: receiver.formato,
      valor: sumRev,
      autoTag: 'AUTO_REV',
    });
  }
  if (sumEma > 0) {
    autoItems.push({
      id: `CR-${week}-EMA`,
      week,
      desc: `EMASSAMENTO (${week})`,
      recebedor: receiver.nome,
      pix: receiver.pix,
      formato: receiver.formato,
      valor: sumEma,
      autoTag: 'AUTO_EMA',
    });
  }
  if (sumOutros > 0) {
    autoItems.push({
      id: `CR-${week}-OUTROS`,
      week,
      desc: `ESTRUTURAL / HIDRÁULICA (${week})`,
      recebedor: receiver.nome,
      pix: receiver.pix,
      formato: receiver.formato,
      valor: sumOutros,
      autoTag: 'AUTO_OUTROS',
    });
  }

  return [...autoItems, ...filtered];
}

export function calculateCronogramaTotals(
  week: string,
  cronogramaList: CronogramaItem[]
): {
  subtotal: number;
  rt: number;
  finalTotal: number;
} {
  const list = cronogramaList.filter((c) => c.week === week);
  const subtotal = +list
    .reduce((acc, c) => acc + (Number(c.valor) || 0), 0)
    .toFixed(2);
  const rt = +(subtotal * 0.12).toFixed(2);
  const finalTotal = +(subtotal + rt).toFixed(2);
  return { subtotal, rt, finalTotal };
}

export function calculateOCTotals(
  items: OCItem[],
  desconto: number
): {
  subtotal: number;
  desconto: number;
  valorFinal: number;
} {
  const subtotal = +items
    .reduce(
      (acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
      0
    )
    .toFixed(2);
  const desc = Math.max(0, Number(desconto) || 0);
  const valorFinal = +Math.max(0, subtotal - desc).toFixed(2);
  return { subtotal, desconto: desc, valorFinal };
}

export function verifyAdminPassword(
  input: string,
  currentPassword: string
): boolean {
  return String(input).trim() === String(currentPassword).trim();
}

export interface CronogramaFridayReminderEvaluation {
  shouldNotify: boolean;
  shouldTrigger: boolean;
  isExceeded: boolean;
  isEffectiveFriday: boolean;
  statusLevel: 'ok' | 'warning' | 'exceeded';
  statusLabel: 'Dentro do orçamento' | 'Atenção: Próximo do limite' | 'Alerta de estouro';
  plannedBudget: number;
  subtotal: number;
  finalTotal: number;
  totalExpenses: number;
  remainingBudget: number;
  usagePct: number;
  excessAmount: number;
  difference: number;
  excessPct: number;
  plannedOSTotal: number;
  message: string;
}

export interface CronogramaFridayReminderParams {
  week?: string;
  cronogramaList?: CronogramaItem[];
  osList?: OSItem[];
  plannedBudgets?: Record<string, number>;
  totalExpenses?: number;
  plannedBudget?: number;
  enabled?: boolean;
  simulateFriday?: boolean;
  currentDayOfWeek?: number; // 0 = Sun ... 5 = Friday
}

export function evaluateCronogramaFridayReminder(
  paramsOrTotal: CronogramaFridayReminderParams | number,
  directPlannedBudget?: number,
  directIsFriday: boolean = true,
  directWeek: string = 'SEMANA ATUAL'
): CronogramaFridayReminderEvaluation {
  if (typeof paramsOrTotal === 'number') {
    const finalTotal = +Math.max(0, Number(paramsOrTotal) || 0).toFixed(2);
    const plannedBudget = +Math.max(0, Number(directPlannedBudget) || 0).toFixed(2);
    const remainingBudget = +Math.max(0, plannedBudget - finalTotal).toFixed(2);
    const usagePct =
      plannedBudget > 0 ? +((finalTotal / plannedBudget) * 100).toFixed(2) : 0;
    const excessAmount = +Math.max(0, finalTotal - plannedBudget).toFixed(2);
    const excessPct =
      plannedBudget > 0 && excessAmount > 0
        ? +((excessAmount / plannedBudget) * 100).toFixed(2)
        : 0;
    const isExceeded = finalTotal > plannedBudget;
    const statusLevel: 'ok' | 'warning' | 'exceeded' = isExceeded
      ? 'exceeded'
      : usagePct >= 85
      ? 'warning'
      : 'ok';
    const statusLabel =
      statusLevel === 'exceeded'
        ? 'Alerta de estouro'
        : statusLevel === 'warning'
        ? 'Atenção: Próximo do limite'
        : 'Dentro do orçamento';
    const isEffectiveFriday = Boolean(directIsFriday);
    const shouldNotify = isEffectiveFriday && isExceeded;
    const message = isExceeded
      ? `Alerta de Sexta-Feira (${directWeek}): O Valor Total Final do Cronograma (${brl(
          finalTotal
        )}) excedeu o planejado para a semana (${brl(plannedBudget)}) em ${brl(
          excessAmount
        )} (+${numBR(excessPct)}%)!`
      : `Cronograma ${directWeek} dentro do planejado: Total Final ${brl(
          finalTotal
        )} de ${brl(plannedBudget)} planejados.`;

    return {
      shouldNotify,
      shouldTrigger: shouldNotify,
      isExceeded,
      isEffectiveFriday,
      statusLevel,
      statusLabel,
      plannedBudget,
      subtotal: finalTotal,
      finalTotal,
      totalExpenses: finalTotal,
      remainingBudget,
      usagePct,
      excessAmount,
      difference: excessAmount,
      excessPct,
      plannedOSTotal: plannedBudget,
      message,
    };
  }

  const {
    week = 'SEMANA 37',
    cronogramaList = [],
    osList = [],
    plannedBudgets = {},
    totalExpenses,
    plannedBudget: explicitPlannedBudget,
    enabled = true,
    simulateFriday = true,
    currentDayOfWeek = new Date().getDay(),
  } = paramsOrTotal;

  const cronoTotals = calculateCronogramaTotals(week, cronogramaList);
  const subtotal = cronoTotals.subtotal;
  const finalTotal =
    typeof totalExpenses === 'number'
      ? +Math.max(0, totalExpenses).toFixed(2)
      : cronoTotals.finalTotal;

  const plannedOSTotal = +osList
    .filter((o) => o.week === week)
    .reduce((acc, o) => acc + (Number(o.prev) || 0) * (Number(o.unitPrice) || 0), 0)
    .toFixed(2);

  const rawPlanned =
    typeof explicitPlannedBudget === 'number' && explicitPlannedBudget > 0
      ? explicitPlannedBudget
      : plannedBudgets[week];

  const plannedBudget =
    typeof rawPlanned === 'number' && rawPlanned > 0
      ? +rawPlanned.toFixed(2)
      : plannedOSTotal > 0
      ? plannedOSTotal
      : 5000;

  const remainingBudget = +Math.max(0, plannedBudget - finalTotal).toFixed(2);
  const usagePct =
    plannedBudget > 0 ? +((finalTotal / plannedBudget) * 100).toFixed(2) : 0;
  const excessAmount = +Math.max(0, finalTotal - plannedBudget).toFixed(2);
  const excessPct =
    plannedBudget > 0 && excessAmount > 0
      ? +((excessAmount / plannedBudget) * 100).toFixed(2)
      : 0;
  const isExceeded = finalTotal > plannedBudget;
  const statusLevel: 'ok' | 'warning' | 'exceeded' = isExceeded
    ? 'exceeded'
    : usagePct >= 85
    ? 'warning'
    : 'ok';
  const statusLabel =
    statusLevel === 'exceeded'
      ? 'Alerta de estouro'
      : statusLevel === 'warning'
      ? 'Atenção: Próximo do limite'
      : 'Dentro do orçamento';
  const isEffectiveFriday = currentDayOfWeek === 5 || Boolean(simulateFriday);
  const shouldNotify = Boolean(enabled) && isEffectiveFriday && isExceeded;

  const message = isExceeded
    ? `Alerta de Sexta-Feira (${week}): O Valor Total Final do Cronograma (${brl(
        finalTotal
      )}) excedeu o planejado para a semana (${brl(plannedBudget)}) em ${brl(
        excessAmount
      )} (+${numBR(excessPct)}%)!`
    : `Cronograma ${week} dentro do planejado: Total Final ${brl(
        finalTotal
      )} de ${brl(plannedBudget)} planejados.`;

  return {
    shouldNotify,
    shouldTrigger: shouldNotify,
    isExceeded,
    isEffectiveFriday,
    statusLevel,
    statusLabel,
    plannedBudget,
    subtotal,
    finalTotal,
    totalExpenses: finalTotal,
    remainingBudget,
    usagePct,
    excessAmount,
    difference: excessAmount,
    excessPct,
    plannedOSTotal,
    message,
  };
}



