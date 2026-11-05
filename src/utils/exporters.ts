import * as XLSX from 'xlsx';
import {
  AfericaoItem,
  CabralState,
  DBItem,
  OCOrder,
  OSItem,
} from '../types/cabral';
import {
  brl,
  calculateAfericaoMetrics,
  calculateCronogramaTotals,
  calculateOCTotals,
  detectMetricFromDescription,
  numBR,
} from './calculations';

export function exportAllDataToExcel(state: CabralState): void {
  const wb = XLSX.utils.book_new();

  const osRows = state.osList.map((o) => ({
    Codigo: o.id,
    Semana: o.week,
    Status: o.status,
    Bloco: o.bloco,
    Local_Ambiente: o.local,
    Memoria_Afericao: o.afericao,
    Servico: o.desc,
    Executor: o.executor,
    Metrica: o.unit,
    Previsto: o.prev,
    Executado: o.exec,
    Valor_Unitario: o.unitPrice,
    Subtotal_Previsto: +(o.prev * o.unitPrice).toFixed(2),
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(osRows),
    'Ordens_Servico'
  );

  const medRows = state.medicaoList.map((m) => ({
    ID: m.id,
    Semana: m.week,
    Bloco: m.bloco,
    Codigo: m.code,
    Descricao: m.desc,
    Metrica: m.unit,
    Valor_Unit: m.unitPrice,
    Quantidade: m.qty,
    Subtotal: +(m.qty * m.unitPrice).toFixed(2),
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(medRows),
    'Medicao_Semanal'
  );

  const cronRows = state.cronogramaList.map((c) => ({
    Semana: c.week,
    Descricao: c.desc,
    Recebedor: c.recebedor,
    PIX: c.pix,
    Formato: c.formato,
    Valor: c.valor,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(cronRows),
    'Cronograma_Sexta'
  );

  const afRows = state.afericoesList.map((a) => {
    const m = calculateAfericaoMetrics(a.comp, a.larg, a.peDireito);
    return {
      Codigo: a.id,
      Tipo: a.tipo,
      Ambiente: a.ambiente,
      Origem: a.origem,
      Comprimento_m: a.comp,
      Largura_m: a.larg,
      Pe_Direito_m: a.peDireito,
      Area_Piso_m2: m.areaPiso,
      Perimetro_m: m.perimetro,
      Area_Parede_m2: m.areaParede,
      Cotas_Planta_mm: a.cotasMM,
    };
  });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(afRows),
    'Memoria_Afericao'
  );

  const dbRows = state.db.map((d) => ({
    Codigo: d.code,
    Origem: d.sourceLabel,
    Descricao: d.desc,
    Metrica: d.unit,
    Preco_MO: d.priceMO,
    Preco_MO_Insumo: d.priceTotal,
    Categoria: d.category,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(dbRows),
    'Banco_Precos'
  );

  XLSX.writeFile(
    wb,
    `SC_SOARES_SISTEMA_COMPLETO_${state.currentWeek.replace(/\s+/g, '_')}.xlsx`
  );
}

export function exportAfericoesToExcel(afericoes: AfericaoItem[]): void {
  const wb = XLSX.utils.book_new();
  const rows = afericoes.map((a) => {
    const m = calculateAfericaoMetrics(a.comp, a.larg, a.peDireito);
    return {
      Codigo: a.id,
      Tipo: a.tipo,
      Ambiente: a.ambiente,
      Origem: a.origem,
      Comp_m: a.comp,
      Larg_m: a.larg,
      PeDireito_m: a.peDireito,
      Area_Piso_M2: m.areaPiso,
      Perimetro_M: m.perimetro,
      Area_Parede_M2: m.areaParede,
      Cotas_MM: a.cotasMM,
    };
  });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(rows),
    'Planta_Hotel_Modelo'
  );
  XLSX.writeFile(wb, 'SC_SOARES_MEMORIA_AFERICAO_PLANTA_REAL.xlsx');
}

export function exportAfericoesToJSON(afericoes: AfericaoItem[]): void {
  const blob = new Blob([JSON.stringify(afericoes, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'SC_SOARES_AFERICOES_INTEROPERAVEL.json';
  a.click();
}

export function downloadBackupJSON(state: CabralState, fileName?: string): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download =
    fileName ||
    `BACKUP_CABRAL_2_0_${state.currentWeek.replace(/\s+/g, '_')}.json`;
  a.click();
}

export function parseImportedSpreadsheet(
  data: ArrayBuffer,
  target: 'banco_sinapi' | 'afericoes'
): { dbItems?: DBItem[]; afericaoItems?: AfericaoItem[] } {
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    wb.Sheets[sheetName]
  );

  if (target === 'banco_sinapi') {
    const dbItems: DBItem[] = rows
      .map((r, idx): DBItem | null => {
        const desc = String(
          r.Descricao || r.DESCRICAO || r.desc || r.Serviço || ''
        ).trim();
        if (!desc) return null;
        const unitRaw = String(
          r.Metrica || r.Unidade || r.UN || detectMetricFromDescription(desc).unit
        ).toUpperCase();
        const unit = (['M²', 'M. LINEAR', 'M³', 'UN', 'DIÁRIA'].includes(unitRaw)
          ? unitRaw
          : detectMetricFromDescription(desc).unit) as DBItem['unit'];
        const priceMO =
          Number(r.Preco_MO || r.MO || r.Valor_Unitario || r.Preco || 45) || 45;
        const priceTotal =
          Number(r.Preco_MO_Insumo || r.Total || priceMO * 1.35) ||
          +(priceMO * 1.35).toFixed(2);
        return {
          code: String(r.Codigo || r.CODIGO || `IMP-${idx + 100}`),
          priority: 1,
          origin: 'BANCO_PROPRIO',
          sourceLabel: 'BANCO PRÓPRIO (EXCEL)',
          desc: desc.toUpperCase(),
          unit,
          priceMO,
          priceTotal,
          category: String(r.Categoria || 'GERAL').toUpperCase(),
        };
      })
      .filter((x): x is DBItem => x !== null);
    return { dbItems };
  }

  const afericaoItems: AfericaoItem[] = rows
    .map((r, idx): AfericaoItem | null => {
      const ambiente = String(
        r.Ambiente || r.Local || r.AMBIENTE || ''
      ).trim();
      if (!ambiente) return null;
      const comp = Number(r.Comprimento_m || r.Comp_m || r.Comp || 3.0) || 3.0;
      const larg = Number(r.Largura_m || r.Larg_m || r.Larg || 2.5) || 2.5;
      const peDireito = Number(r.Pe_Direito_m || r.PeDireito_m || 2.8) || 2.8;
      return {
        id: String(r.Codigo || `AF-IMP-${idx + 1}`),
        tipo: 'MANUAL',
        ambiente: ambiente.toUpperCase(),
        origem: 'IMPORTADO EXCEL',
        comp,
        larg,
        peDireito,
        cotasMM: `${Math.round(comp * 1000)} x ${Math.round(larg * 1000)} mm`,
      };
    })
    .filter((x): x is AfericaoItem => x !== null);

  return { afericaoItems };
}

export function buildCronogramaWhatsAppText(state: CabralState): string {
  const list = state.cronogramaList.filter((c) => c.week === state.currentWeek);
  const { subtotal, rt, finalTotal } = calculateCronogramaTotals(
    state.currentWeek,
    state.cronogramaList
  );

  let msg = `*SC SOARES LTDA · CRONOGRAMA DE PAGAMENTOS (${state.currentWeek})*\n`;
  msg += `Obra: Hotel Modelo (Uberaba/MG)\n\n`;
  list.forEach((item, idx) => {
    msg += `${idx + 1}. *${item.desc}*\n   Favorecido: ${item.recebedor}\n   PIX (${item.formato}): ${item.pix}\n   Valor: ${brl(item.valor)}\n\n`;
  });
  msg += `---------------------------------\n`;
  msg += `*Subtotal:* ${brl(subtotal)}\n`;
  msg += `*RT de Obra (12%):* ${brl(rt)}\n`;
  msg += `*VALOR TOTAL FINAL:* ${brl(finalTotal)}\n`;
  return msg;
}

export function buildOSWhatsAppText(o: OSItem): string {
  let msg = `*SC SOARES LTDA · ORDEM DE SERVIÇO Nº ${o.id}*\n`;
  msg += `*Obra:* Rua João Caetano, 33 (Hotel Modelo)\n`;
  msg += `*Semana:* ${o.week} | *Status:* ${o.status}\n`;
  msg += `*Local/Ambiente:* ${o.local || '-'}\n`;
  msg += `*Memória de Aferição:* ${o.afericao || '-'}\n`;
  msg += `*Executor:* ${o.executor}\n`;
  msg += `*Serviço:* ${o.desc}\n`;
  msg += `*Meta Prevista:* ${numBR(o.prev)} ${o.unit}\n`;
  msg += `*Valor Unitário:* ${brl(o.unitPrice)}\n`;
  msg += `*Total Previsto:* ${brl(o.prev * o.unitPrice)}\n`;
  return msg;
}

export function buildOCWhatsAppText(oc: OCOrder): string {
  const { subtotal, desconto, valorFinal } = calculateOCTotals(
    oc.items,
    oc.desconto
  );
  let msg = `*SC SOARES LTDA · ORDEM DE COMPRA Nº ${oc.numero}*\n`;
  msg += `*Fornecedor:* ${oc.fornecedorNome} (${oc.fornecedorCNPJ})\n`;
  msg += `*Finalidade:* ${oc.finalidade}\n`;
  msg += `*Data:* ${oc.dataPedido}\n\n`;
  oc.items.forEach((it, idx) => {
    msg += `${idx + 1}. ${it.desc} — ${numBR(it.qty)} x ${brl(it.unitPrice)} = ${brl(it.qty * it.unitPrice)}\n`;
  });
  msg += `\n*Subtotal:* ${brl(subtotal)}\n`;
  msg += `*Desconto:* ${brl(desconto)}\n`;
  msg += `*VALOR FINAL APROVADO:* ${brl(valorFinal)}\n`;
  return msg;
}

export async function exportElementToPDF(
  element: HTMLElement | null,
  filename: string
): Promise<boolean> {
  if (!element) return false;
  const win = window as unknown as {
    html2pdf?: () => {
      set: (opt: Record<string, unknown>) => {
        from: (el: HTMLElement) => { save: () => Promise<void> };
      };
    };
  };
  if (typeof win.html2pdf === 'function') {
    const opt = {
      margin: 5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    await win.html2pdf().set(opt).from(element).save();
    return true;
  }
  window.print();
  return false;
}

export function generateTimemarkCanvasDataUrl(
  os: OSItem,
  slot: number,
  customMember?: string,
  customCoords?: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#0D2238';
  ctx.fillRect(0, 0, 640, 420);

  ctx.fillStyle = '#1E3A5F';
  ctx.fillRect(16, 56, 608, 348);

  ctx.fillStyle = '#EA6A15';
  ctx.fillRect(0, 0, 640, 44);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
  ctx.fillText(
    `TIMEMARK CAMERA VERIFICADO · ${os.id} (${slot === 0 ? '1ª FOTO INÍCIO' : '2ª FOTO CONCLUSÃO 100%'})`,
    18,
    28
  );

  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 14px JetBrains Mono, monospace';
  ctx.fillText(
    `Data/Hora: ${new Date().toLocaleString('pt-BR')} · Teamspace: 449cSPnrsg`,
    32,
    92
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`Obra: R. João Caetano, 33 / Artur Machado, 429 (Hotel Modelo)`, 32, 130);
  ctx.fillText(`Ambiente: ${os.local || 'Pavimento Superior'}`, 32, 162);
  ctx.fillText(`Executor: ${customMember || os.executor}`, 32, 194);
  ctx.fillText(`Métrica Aferida: ${numBR(os.prev)} ${os.unit} (${os.afericao || 'Conforme Planta'})`, 32, 226);

  ctx.fillStyle = '#FBBF24';
  ctx.font = '13px JetBrains Mono, monospace';
  ctx.fillText(
    `GPS: ${customCoords || '-19.74720, -47.93180 · Uberaba/MG'}`,
    32,
    264
  );

  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px Plus Jakarta Sans, sans-serif';
  ctx.fillText(os.desc.slice(0, 68), 32, 304);
  if (os.desc.length > 68) {
    ctx.fillText(os.desc.slice(68, 136), 32, 324);
  }

  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 344, 290, 40);
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 13px JetBrains Mono, monospace';
  ctx.fillText('AUTENTICIDADE VERIFICADA SC SOARES', 44, 369);

  return canvas.toDataURL('image/jpeg', 0.88);
}
