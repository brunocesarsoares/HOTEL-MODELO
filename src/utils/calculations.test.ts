import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectMetricFromDescription,
  calculateAfericaoMetrics,
  computeDimensionForMode,
  syncOSWithMedicaoList,
  calculateMedicaoBlockTotals,
  syncMedicaoToCronogramaList,
  calculateCronogramaTotals,
  calculateOCTotals,
  verifyAdminPassword,
  truncateTCU,
  recalculateAnalyticalComposition,
  evaluateCronogramaFridayReminder,
} from './calculations';
import {
  INITIAL_AFERICOES,
  INITIAL_DB,
  RECEBEDORES_OFICIAIS,
} from '../data/initialData';
import { OSItem } from '../types/cabral';

test('truncateTCU applies official CAIXA/TCU 2-decimal truncation rule', () => {
  // 0.96 * 40.00 = 38.40
  assert.equal(truncateTCU(0.96, 40.0), 38.4);
  // 0.333 * 10.00 = 3.33 (truncated, not rounded up)
  assert.equal(truncateTCU(0.3339, 10.0), 3.33);
});

test('recalculateAnalyticalComposition computes MO, Insumo, Total, and %MO from analytical children', () => {
  const sinapiItem = INITIAL_DB.find((x) => x.code === 'SINAPI-98554')!;
  const recalc = recalculateAnalyticalComposition(sinapiItem);
  assert.equal(recalc.priceMO, 38.4);
  assert.equal(recalc.priceInsumo, 149.8);
  assert.equal(recalc.priceTotal, 188.2);
  assert.equal(recalc.pctMO, 20.4);
});

test('detectMetricFromDescription identifies correct units from descriptions', () => {
  assert.equal(
    detectMetricFromDescription(
      'EXECUÇÃO DE REDE HIDRÁULICA E SEPARAÇÃO DE PRUMADAS'
    ).unit,
    'DIÁRIA'
  );
  assert.equal(
    detectMetricFromDescription('REQUADRO EM ALVENARIA DE 1/2 VEZ').unit,
    'M. LINEAR'
  );
  assert.equal(
    detectMetricFromDescription('CHUMBAMENTO PONTUAL DE PONTOS DE ESGOTOS')
      .unit,
    'UN'
  );
  assert.equal(
    detectMetricFromDescription('CONCRETAGEM COM VERMICULITA M³').unit,
    'M³'
  );
  assert.equal(
    detectMetricFromDescription(
      'IMPERMEABILIZAÇÃO DE BANHEIROS COM ARGAMASSA POLIMÉRICA'
    ).unit,
    'M²'
  );
});

test('calculateAfericaoMetrics computes floor area, perimeter, and wall area accurately', () => {
  const res = calculateAfericaoMetrics(3.818, 2.777, 2.8);
  assert.equal(res.areaPiso, 10.6);
  assert.equal(res.perimetro, 13.19);
  assert.equal(res.areaParede, 36.93);
});

test('computeDimensionForMode adapts to room and selected mode', () => {
  const room = INITIAL_AFERICOES[0]; // QUARTO 01
  const piso = computeDimensionForMode(room, 'AREA_PISO', 'M²');
  assert.equal(piso.value, 10.6);
  assert.equal(piso.suggestedUnit, 'M²');

  const perim = computeDimensionForMode(room, 'PERIMETRO', 'M. LINEAR');
  assert.equal(perim.value, 13.19);
  assert.equal(perim.suggestedUnit, 'M. LINEAR');
});

test('syncOSWithMedicaoList adds executed OS and removes non-executed OS', () => {
  const sampleOS: OSItem = {
    id: 'OS-99',
    week: 'SEMANA 37',
    status: 'EXECUTADO',
    bloco: 'ALVENARIA 1, 2 E 3',
    local: 'Quarto 01',
    codeRef: 'PRP-006',
    desc: 'REQUADRO TESTE',
    executor: 'NAY',
    unit: 'M. LINEAR',
    prev: 10,
    exec: 10,
    unitPrice: 50,
    costMode: 'MO_ONLY',
    prazo: '2026-11-06',
    afericao: '10m',
    recebedorKey: 'ELIENAY',
    photos: [],
  };

  const added = syncOSWithMedicaoList(sampleOS, []);
  assert.equal(added.length, 1);
  assert.equal(added[0].osId, 'OS-99');
  assert.equal(added[0].qty, 10);

  const pendingOS: OSItem = { ...sampleOS, status: 'EXECUÇÃO' };
  const removed = syncOSWithMedicaoList(pendingOS, added);
  assert.equal(removed.length, 0);
});

test('syncMedicaoToCronogramaList and calculateCronogramaTotals compute 12% RT accurately', () => {
  const medicao = [
    {
      id: 'M1',
      week: 'SEMANA 37',
      bloco: 'ALVENARIA 1, 2 E 3',
      code: 'PRP-006',
      desc: 'Teste Alvenaria',
      unit: 'M. LINEAR' as const,
      unitPrice: 100,
      qty: 5,
    },
    {
      id: 'M2',
      week: 'SEMANA 37',
      bloco: 'REVESTIMENTO EM GERAL',
      code: 'PRP-001',
      desc: 'Teste Revestimento',
      unit: 'M²' as const,
      unitPrice: 50,
      qty: 10,
    },
  ];

  const totals = calculateMedicaoBlockTotals('SEMANA 37', medicao);
  assert.equal(totals.sumAlv, 500);
  assert.equal(totals.sumRev, 500);
  assert.equal(totals.sumTotal, 1000);

  const crono = syncMedicaoToCronogramaList(
    'SEMANA 37',
    medicao,
    [],
    RECEBEDORES_OFICIAIS.ELIENAY
  );
  assert.equal(crono.length, 2);

  const cronoTotals = calculateCronogramaTotals('SEMANA 37', crono);
  assert.equal(cronoTotals.subtotal, 1000);
  assert.equal(cronoTotals.rt, 120);
  assert.equal(cronoTotals.finalTotal, 1120);
});

test('calculateOCTotals and verifyAdminPassword work as expected', () => {
  const oc = calculateOCTotals(
    [
      { desc: 'Item A', qty: 2, unitPrice: 150 },
      { desc: 'Item B', qty: 1, unitPrice: 100 },
    ],
    50
  );
  assert.equal(oc.subtotal, 400);
  assert.equal(oc.desconto, 50);
  assert.equal(oc.valorFinal, 350);

  assert.equal(verifyAdminPassword('12345678', '12345678'), true);
  assert.equal(verifyAdminPassword('wrong', '12345678'), false);
});

test('evaluateCronogramaFridayReminder triggers toast alert on Friday when finalTotal exceeds planned budget', () => {
  const crono = [
    {
      id: 'C1',
      week: 'SEMANA 37',
      desc: 'Pagamento Equipe',
      recebedor: 'ELIENAY MARQUES NEVES DUQUE',
      pix: '55.906.923/0001-07',
      formato: 'CNPJ',
      valor: 5000, // + 12% RT = 5600
    },
  ];

  // Case 1: Friday (day 5), planned = 5000, finalTotal = 5600 -> shouldNotify = true
  const alertEval = evaluateCronogramaFridayReminder({
    week: 'SEMANA 37',
    cronogramaList: crono,
    osList: [],
    plannedBudgets: { 'SEMANA 37': 5000 },
    enabled: true,
    simulateFriday: false,
    currentDayOfWeek: 5,
  });
  assert.equal(alertEval.finalTotal, 5600);
  assert.equal(alertEval.plannedBudget, 5000);
  assert.equal(alertEval.excessAmount, 600);
  assert.equal(alertEval.difference, 600);
  assert.equal(alertEval.excessPct, 12);
  assert.equal(alertEval.isExceeded, true);
  assert.equal(alertEval.statusLevel, 'exceeded');
  assert.equal(alertEval.statusLabel, 'Alerta de estouro');
  assert.equal(alertEval.shouldNotify, true);
  assert.equal(alertEval.shouldTrigger, true);
  assert.ok(alertEval.message.includes('Alerta de Sexta-Feira'));

  // Case 2: Wednesday (day 3) without simulateFriday -> shouldNotify = false even if exceeded
  const wedEval = evaluateCronogramaFridayReminder({
    week: 'SEMANA 37',
    cronogramaList: crono,
    osList: [],
    plannedBudgets: { 'SEMANA 37': 5000 },
    enabled: true,
    simulateFriday: false,
    currentDayOfWeek: 3,
  });
  assert.equal(wedEval.isExceeded, true);
  assert.equal(wedEval.shouldNotify, false);
  assert.equal(wedEval.shouldTrigger, false);

  // Case 3: Within budget (planned = 7000, finalTotal = 5600 -> 80% used -> 'ok') -> shouldNotify = false
  const okEval = evaluateCronogramaFridayReminder({
    week: 'SEMANA 37',
    cronogramaList: crono,
    osList: [],
    plannedBudgets: { 'SEMANA 37': 7000 },
    enabled: true,
    simulateFriday: true,
    currentDayOfWeek: 5,
  });
  assert.equal(okEval.isExceeded, false);
  assert.equal(okEval.statusLevel, 'ok');
  assert.equal(okEval.statusLabel, 'Dentro do orçamento');
  assert.equal(okEval.remainingBudget, 1400);
  assert.equal(okEval.shouldNotify, false);

  // Case 4: Warning level (planned = 6000, finalTotal = 5600 -> 93.33% used -> 'warning')
  const warnEval = evaluateCronogramaFridayReminder({
    week: 'SEMANA 37',
    cronogramaList: crono,
    osList: [],
    plannedBudgets: { 'SEMANA 37': 6000 },
    enabled: true,
    simulateFriday: true,
    currentDayOfWeek: 5,
  });
  assert.equal(warnEval.isExceeded, false);
  assert.equal(warnEval.statusLevel, 'warning');
  assert.equal(warnEval.statusLabel, 'Atenção: Próximo do limite');

  // Case 5: Direct numeric signature (totalExpenses, plannedBudget, isFriday)
  const directEval = evaluateCronogramaFridayReminder(7500, 6000, true, 'SEMANA 37');
  assert.equal(directEval.shouldNotify, true);
  assert.equal(directEval.shouldTrigger, true);
  assert.equal(directEval.isExceeded, true);
  assert.equal(directEval.statusLabel, 'Alerta de estouro');
  assert.equal(directEval.excessAmount, 1500);
  assert.equal(directEval.excessPct, 25);
});



