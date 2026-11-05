import {
  AfericaoItem,
  CronogramaItem,
  DBItem,
  IBGEIndicator,
  MedicaoItem,
  OCOrder,
  OrcamentoItem,
  OSItem,
  ReceiverInfo,
  ReceiverKey,
  WebhookLog,
} from '../types/cabral';

export const STORAGE_KEY = 'SC_SOARES_CABRAL_2_0_CONSOLIDATED_FINAL';
export const GDRIVE_TARGET_FOLDER_ID = '1TEN-Iu4gyy7SRyvKASGZEKLzslctNZZ7';
export const GDRIVE_TARGET_URL =
  'https://drive.google.com/drive/project/1TEN-Iu4gyy7SRyvKASGZEKLzslctNZZ7?usp=drive_link';
export const TIMEMARK_INVITE_URL =
  'https://teamspace.timemark.com/invite/449cSPnrsg';
export const DEFAULT_ADMIN_PASS = '12345678';

export const RECEBEDORES_OFICIAIS: Record<ReceiverKey, ReceiverInfo> = {
  ELIENAY: {
    key: 'ELIENAY',
    nome: 'ELIENAY MARQUES NEVES DUQUE',
    pix: '55.906.923/0001-07',
    formato: 'CNPJ',
  },
  SAMIA: {
    key: 'SAMIA',
    nome: 'SAMIA TARCILIA DE CAMPOS SOARES',
    pix: '48.629.736/0001-50',
    formato: 'CNPJ',
  },
};

export const INITIAL_IBGE_INDICATORS: IBGEIndicator[] = [
  {
    competencia: '2026-09',
    uf: 'MG',
    custoMedioM2: 1842.65,
    variacaoMensalPct: 0.42,
    variacao12MPct: 4.18,
    encargosDesoneradoPct: 100.33,
    encargosOneradoPct: 116.23,
    fonte: 'IBGE/SIDRA Agregado 2296 (MG - 31)',
  },
  {
    competencia: '2026-08',
    uf: 'MG',
    custoMedioM2: 1834.94,
    variacaoMensalPct: 0.38,
    variacao12MPct: 4.12,
    encargosDesoneradoPct: 100.33,
    encargosOneradoPct: 116.23,
    fonte: 'IBGE/SIDRA Agregado 2296 (MG - 31)',
  },
  {
    competencia: '2026-07',
    uf: 'MG',
    custoMedioM2: 1827.99,
    variacaoMensalPct: 0.35,
    variacao12MPct: 4.05,
    encargosDesoneradoPct: 100.33,
    encargosOneradoPct: 116.23,
    fonte: 'IBGE/SIDRA Agregado 2296 (MG - 31)',
  },
];

export const INITIAL_DB: DBItem[] = [
  {
    idInterno: 'PRP-001',
    code: 'PRP-001',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'REVESTIMENTOS',
    grupo: 'LAJE SECA',
    desc: 'INÍCIO IMEDIATO DE TRATAMENTO DE JUNTAS COM FITA TELADA E MASSA CIMENTÍCIA NAS LAJES SECAS',
    unit: 'M²',
    priceMO: 50.0,
    priceInsumo: 18.5,
    priceTotal: 68.5,
    priceNaoDesonerado: 73.16,
    pctMO: 73.0,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
    itensAnaliticos: [
      {
        tipo: 'INSUMO',
        codigo: 'MO-PEDREIRO',
        descricao: 'PEDREIRO ESPECIALIZADO LAJE SECA COM ENCARGOS COMPLEMENTARES',
        unidade: 'H',
        coeficiente: 1.25,
        precoUnitario: 40.0,
        custoParcialTruncado: 50.0,
        categoria: 'MAO_DE_OBRA',
      },
      {
        tipo: 'INSUMO',
        codigo: 'INS-FITA-MASSA',
        descricao: 'FITA TELADA FIBRA DE VIDRO + MASSA CIMENTÍCIA P/ JUNTA',
        unidade: 'M²',
        coeficiente: 1.0,
        precoUnitario: 18.5,
        custoParcialTruncado: 18.5,
        categoria: 'MATERIAL',
      },
    ],
  },
  {
    idInterno: 'PRP-002',
    code: 'PRP-002',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'INSTALAÇÕES HIDRÁULICAS',
    grupo: 'CHUMBAMENTO',
    desc: 'CHUMBAMENTO PONTUAL DE PONTOS DE ESGOTOS DE 100 MM LAJE SECA BANHEIRO 5, 7, 8, 10, 21, COPA, 16 E 17',
    unit: 'UN',
    priceMO: 43.75,
    priceInsumo: 16.15,
    priceTotal: 59.9,
    priceNaoDesonerado: 63.97,
    pctMO: 73.0,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'PRP-003',
    code: 'PRP-003',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'REVESTIMENTOS',
    grupo: 'LAJE SECA',
    desc: 'LAJE SECA COM DUAS CAMADAS DE OSB E UMA DE PLACA CIMENTÍCIA',
    unit: 'M²',
    priceMO: 116.67,
    priceInsumo: 68.73,
    priceTotal: 185.4,
    priceNaoDesonerado: 198.01,
    pctMO: 62.9,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'PRP-004',
    code: 'PRP-004',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'IMPERMEABILIZAÇÃO',
    grupo: 'ARGAMASSA POLIMÉRICA',
    desc: 'IMPERMEABILIZAÇÃO DE BANHEIROS COM ARGAMASSA POLIMÉRICA',
    unit: 'M²',
    priceMO: 29.17,
    priceInsumo: 15.03,
    priceTotal: 44.2,
    priceNaoDesonerado: 47.21,
    pctMO: 66.0,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'PRP-005',
    code: 'PRP-005',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'ESTRUTURAL',
    grupo: 'GRAUTEAMENTO',
    desc: 'RECUPERAÇÃO ESTRUTURAL E REQUADRO DE COLUNAS E VIGAS COM GRAUTE GRANULAR',
    unit: 'M. LINEAR',
    priceMO: 58.5,
    priceInsumo: 33.5,
    priceTotal: 92.0,
    priceNaoDesonerado: 98.26,
    pctMO: 63.6,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'PRP-006',
    code: 'PRP-006',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'ALVENARIA',
    grupo: 'REQUADROS',
    desc: 'REQUADRO EM ALVENARIA DE 1/2 VEZ COM ARGAMASSA MISTA',
    unit: 'M. LINEAR',
    priceMO: 48.38,
    priceInsumo: 15.82,
    priceTotal: 64.2,
    priceNaoDesonerado: 68.57,
    pctMO: 75.4,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'PRP-007',
    code: 'PRP-007',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'ALVENARIA',
    grupo: 'RODAPÉ',
    desc: 'EMBOÇO DE RODAPÉ PARA LAJE SECA COM ARGAMASSA TRAÇO 4:1',
    unit: 'M. LINEAR',
    priceMO: 16.39,
    priceInsumo: 8.41,
    priceTotal: 24.8,
    priceNaoDesonerado: 26.49,
    pctMO: 66.1,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'PRP-008',
    code: 'PRP-008',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'PAREDES E PAINÉIS',
    grupo: 'DRYWALL',
    desc: 'REFORÇO ESTRUTURAL EM PAREDE DE DRYWALL PARA FIXAÇÃO DE PEDRAS DE PIA E BOX',
    unit: 'M²',
    priceMO: 24.5,
    priceInsumo: 15.3,
    priceTotal: 39.8,
    priceNaoDesonerado: 42.51,
    pctMO: 61.6,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'PRP-009',
    code: 'PRP-009',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'INSTALAÇÕES HIDRÁULICAS',
    grupo: 'PRUMADAS',
    desc: 'EXECUÇÃO DE REDE HIDRÁULICA E SEPARAÇÃO DE PRUMADAS',
    unit: 'DIÁRIA',
    priceMO: 700.0,
    priceInsumo: 0,
    priceTotal: 700.0,
    priceNaoDesonerado: 747.6,
    pctMO: 100.0,
    competencia: '2026-09',
    category: 'HIDRÁULICA',
  },
  {
    idInterno: 'PRP-010',
    code: 'PRP-010',
    priority: 1,
    origin: 'BANCO_PROPRIO',
    sourceLabel: 'BANCO PRÓPRIO',
    etapa: 'PISOS',
    grupo: 'CONTRAPISO',
    desc: 'CONTRAPISO EM ARGAMASSA TRAÇO 1:4 BANHEIROS 11 E 18',
    unit: 'M²',
    priceMO: 47.31,
    priceInsumo: 27.0,
    priceTotal: 74.31,
    priceNaoDesonerado: 79.36,
    pctMO: 63.7,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'ADP-011',
    code: 'ADP-011',
    priority: 1,
    origin: 'ADAPTADA',
    sourceLabel: 'COMPOSIÇÃO ADAPTADA',
    etapa: 'PINTURA E EMASSAMENTO',
    grupo: 'EMASSAMENTO',
    desc: 'EMASSAMENTO ACRÍLICO INTERNO EM PAREDES DE DRYWALL E ALVENARIA (2 DEMÃOS)',
    unit: 'M²',
    priceMO: 18.9,
    priceInsumo: 10.5,
    priceTotal: 29.4,
    priceNaoDesonerado: 31.4,
    pctMO: 64.3,
    competencia: '2026-09',
    category: 'EMASSAMENTO',
  },
  // SEMENTE OFICIAL CAIXA / SINAPI MG (Codigo.gs)
  {
    idInterno: 'SRV-102',
    code: 'SINAPI-98554',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'IMPERMEABILIZAÇÃO',
    grupo: 'MEMBRANA ACRÍLICA',
    desc: 'IMPERMEABILIZAÇÃO DE SUPERFÍCIE COM MEMBRANA À BASE DE RESINA ACRÍLICA, 3 DEMÃOS',
    unit: 'M²',
    priceMO: 38.4,
    priceInsumo: 149.8,
    priceTotal: 188.2,
    priceNaoDesonerado: 198.45,
    pctMO: 20.4,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
    itensAnaliticos: [
      {
        tipo: 'COMPOSICAO_AUX',
        codigo: '88270',
        descricao: 'IMPERMEABILIZADOR COM ENCARGOS COMPLEMENTARES (MG)',
        unidade: 'H',
        coeficiente: 0.96,
        precoUnitario: 40.0,
        custoParcialTruncado: 38.4,
        categoria: 'MAO_DE_OBRA',
      },
      {
        tipo: 'INSUMO',
        codigo: '00037594',
        descricao: 'MEMBRANA ACRILICA IMPERMEABILIZANTE BRANCA',
        unidade: 'KG',
        coeficiente: 2.5,
        precoUnitario: 59.92,
        custoParcialTruncado: 149.8,
        categoria: 'MATERIAL',
      },
    ],
  },
  {
    idInterno: 'SRV-103',
    code: 'SINAPI-98547',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'IMPERMEABILIZAÇÃO',
    grupo: 'MANTA ASFÁLTICA',
    desc: 'IMPERMEABILIZAÇÃO DE SUPERFÍCIE COM MANTA ASFÁLTICA, DUAS CAMADAS, E=3MM E E=4MM',
    unit: 'M²',
    priceMO: 31.2,
    priceInsumo: 87.87,
    priceTotal: 119.07,
    priceNaoDesonerado: 126.15,
    pctMO: 26.2,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'SRV-104',
    code: 'SINAPI-89987',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'INSTALAÇÕES HIDRÁULICAS',
    grupo: 'CHUMBAMENTO',
    desc: 'RASGO E CHUMBAMENTO LINEAR EM ALVENARIA PARA RAMAIS/DISTRIBUIÇÃO COM TUBOS DN 20 A 40 MM',
    unit: 'M. LINEAR',
    priceMO: 14.9,
    priceInsumo: 8.55,
    priceTotal: 23.45,
    priceNaoDesonerado: 26.8,
    pctMO: 63.5,
    competencia: '2026-09',
    category: 'HIDRÁULICA',
  },
  {
    idInterno: 'SRV-105',
    code: 'SINAPI-98555',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'IMPERMEABILIZAÇÃO',
    grupo: 'IMPERMEABILIZAÇÃO',
    desc: 'IMPERMEABILIZAÇÃO DE PAREDE E PISO DE BANHEIRO POR DEMÃO APLICADA',
    unit: 'M²',
    priceMO: 15.46,
    priceInsumo: 22.14,
    priceTotal: 37.6,
    priceNaoDesonerado: 41.1,
    pctMO: 41.1,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'SRV-106',
    code: 'SINAPI-88649',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'REVESTIMENTOS',
    grupo: 'RODAPÉS',
    desc: 'RODAPÉ CERÂMICO OU PORCELANATO DE 7 CM A 10 CM DE ALTURA ASSENTADO COM ARGAMASSA COLANTE',
    unit: 'M. LINEAR',
    priceMO: 12.8,
    priceInsumo: 21.4,
    priceTotal: 34.2,
    priceNaoDesonerado: 37.15,
    pctMO: 37.4,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'SRV-001',
    code: 'SINAPI-103316',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'PAREDES E PAINÉIS',
    grupo: 'ALVENARIA DE VEDAÇÃO',
    desc: 'ALVENARIA DE VEDAÇÃO DE BLOCOS VAZADOS DE CONCRETO DE 9X19X39 CM E ARGAMASSA EM BETONEIRA',
    unit: 'M²',
    priceMO: 29.85,
    priceInsumo: 58.65,
    priceTotal: 88.5,
    priceNaoDesonerado: 94.1,
    pctMO: 33.7,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'SRV-002',
    code: 'SINAPI-96359',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'PAREDES E PAINÉIS',
    grupo: 'DRYWALL',
    desc: 'PAREDE COM SISTEMA EM CHAPAS DE GESSO PARA DRYWALL, USO INTERNO, DUAS FACES SIMPLES, COM VÃOS',
    unit: 'M²',
    priceMO: 24.5,
    priceInsumo: 70.35,
    priceTotal: 94.85,
    priceNaoDesonerado: 99.4,
    pctMO: 25.8,
    competencia: '2026-09',
    category: 'REVESTIMENTO',
  },
  {
    idInterno: 'SIN-87879',
    code: 'SIN-87879',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI OFICIAL CAIXA (MG)',
    etapa: 'ALVENARIA',
    grupo: 'REQUADROS',
    desc: 'EMBOÇO DE REGULARIZAÇÃO DE JANELAS E VÃOS COM REQUADRO ESPECÍFICO',
    unit: 'M. LINEAR',
    priceMO: 28.72,
    priceInsumo: 12.78,
    priceTotal: 41.5,
    priceNaoDesonerado: 44.32,
    pctMO: 69.2,
    competencia: '2026-09',
    category: 'ALVENARIA',
  },
  {
    idInterno: 'EST-09',
    code: 'EST-09',
    priority: 2,
    origin: 'SINAPI',
    sourceLabel: 'SINAPI ESTRUTURAL',
    etapa: 'ESTRUTURAL',
    grupo: 'LAJES',
    desc: '09. LAJE TRELIÇADA DO RESTAURANTE C/ SOBRECARGA 300 KGF/M² (+2,75 M)',
    unit: 'UN',
    priceMO: 458.86,
    priceInsumo: 253.14,
    priceTotal: 712.0,
    priceNaoDesonerado: 760.42,
    pctMO: 64.4,
    competencia: '2026-09',
    category: 'ESTRUTURAL',
  },
];

export const INITIAL_AFERICOES: AfericaoItem[] = [
  { id: 'AF-Q01', tipo: 'QUARTO', ambiente: 'QUARTO 01', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.818, larg: 2.777, peDireito: 2.8, cotasMM: '3818 x 2777 mm' },
  { id: 'AF-Q02', tipo: 'QUARTO', ambiente: 'QUARTO 02', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.834, larg: 2.797, peDireito: 2.8, cotasMM: '3834 x 2797 mm' },
  { id: 'AF-Q03', tipo: 'QUARTO', ambiente: 'QUARTO 03', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.854, larg: 2.93, peDireito: 2.8, cotasMM: '3854 x 2930 mm' },
  { id: 'AF-Q04', tipo: 'QUARTO', ambiente: 'QUARTO 04', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.888, larg: 2.992, peDireito: 2.8, cotasMM: '3888 x 2992 mm' },
  { id: 'AF-Q05', tipo: 'QUARTO', ambiente: 'QUARTO 05', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.781, larg: 3.298, peDireito: 2.8, cotasMM: '3781 x 3298 mm' },
  { id: 'AF-Q06', tipo: 'QUARTO', ambiente: 'QUARTO 06', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.81, larg: 3.12, peDireito: 2.8, cotasMM: '3810 x 3120 mm' },
  { id: 'AF-Q07', tipo: 'QUARTO', ambiente: 'QUARTO 07', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.79, larg: 2.85, peDireito: 2.8, cotasMM: '3790 x 2850 mm' },
  { id: 'AF-Q08', tipo: 'QUARTO', ambiente: 'QUARTO 08', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.82, larg: 2.86, peDireito: 2.8, cotasMM: '3820 x 2860 mm' },
  { id: 'AF-Q09', tipo: 'QUARTO', ambiente: 'QUARTO 09', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.84, larg: 2.91, peDireito: 2.8, cotasMM: '3840 x 2910 mm' },
  { id: 'AF-Q10', tipo: 'QUARTO', ambiente: 'QUARTO 10', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.86, larg: 2.94, peDireito: 2.8, cotasMM: '3860 x 2940 mm' },
  { id: 'AF-Q11', tipo: 'QUARTO', ambiente: 'QUARTO 11', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.92, larg: 3.05, peDireito: 2.8, cotasMM: '3920 x 3050 mm' },
  { id: 'AF-Q12', tipo: 'QUARTO', ambiente: 'QUARTO 12', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.75, larg: 2.82, peDireito: 2.8, cotasMM: '3750 x 2820 mm' },
  { id: 'AF-Q13', tipo: 'QUARTO', ambiente: 'QUARTO 13', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.76, larg: 2.84, peDireito: 2.8, cotasMM: '3760 x 2840 mm' },
  { id: 'AF-Q14', tipo: 'QUARTO', ambiente: 'QUARTO 14', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.8, larg: 2.88, peDireito: 2.8, cotasMM: '3800 x 2880 mm' },
  { id: 'AF-Q15', tipo: 'QUARTO', ambiente: 'QUARTO 15', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.82, larg: 2.9, peDireito: 2.8, cotasMM: '3820 x 2900 mm' },
  { id: 'AF-Q16', tipo: 'QUARTO', ambiente: 'QUARTO 16', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.85, larg: 2.95, peDireito: 2.8, cotasMM: '3850 x 2950 mm' },
  { id: 'AF-Q17', tipo: 'QUARTO', ambiente: 'QUARTO 17', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.88, larg: 2.98, peDireito: 2.8, cotasMM: '3880 x 2980 mm' },
  { id: 'AF-Q18', tipo: 'QUARTO', ambiente: 'QUARTO 18', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.9, larg: 3.02, peDireito: 2.8, cotasMM: '3900 x 3020 mm' },
  { id: 'AF-Q19', tipo: 'QUARTO', ambiente: 'QUARTO 19', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.84, larg: 2.89, peDireito: 2.8, cotasMM: '3840 x 2890 mm' },
  { id: 'AF-Q20', tipo: 'QUARTO', ambiente: 'QUARTO 20', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.86, larg: 2.92, peDireito: 2.8, cotasMM: '3860 x 2920 mm' },
  { id: 'AF-Q21', tipo: 'QUARTO', ambiente: 'QUARTO 21', origem: 'PLANTA REAL (img0001.pdf)', comp: 4.05, larg: 3.18, peDireito: 2.8, cotasMM: '4050 x 3180 mm' },
  { id: 'AF-Q22', tipo: 'QUARTO', ambiente: 'QUARTO 22', origem: 'PLANTA REAL (img0001.pdf)', comp: 4.12, larg: 3.24, peDireito: 2.8, cotasMM: '4120 x 3240 mm' },
  { id: 'AF-B01', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 01', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.493, larg: 1.376, peDireito: 2.6, cotasMM: '2493 x 1376 mm' },
  { id: 'AF-B02', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 02', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.234, larg: 1.38, peDireito: 2.6, cotasMM: '2234 x 1380 mm' },
  { id: 'AF-B03', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 03', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.293, larg: 1.506, peDireito: 2.6, cotasMM: '2293 x 1506 mm' },
  { id: 'AF-B04', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 04', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.31, larg: 1.42, peDireito: 2.6, cotasMM: '2310 x 1420 mm' },
  { id: 'AF-B05', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 05', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.28, larg: 1.4, peDireito: 2.6, cotasMM: '2280 x 1400 mm' },
  { id: 'AF-B06', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 06', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.26, larg: 1.39, peDireito: 2.6, cotasMM: '2260 x 1390 mm' },
  { id: 'AF-B07', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 07', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.34, larg: 1.44, peDireito: 2.6, cotasMM: '2340 x 1440 mm' },
  { id: 'AF-B08', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 08', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.32, larg: 1.41, peDireito: 2.6, cotasMM: '2320 x 1410 mm' },
  { id: 'AF-B09', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 09', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.29, larg: 1.38, peDireito: 2.6, cotasMM: '2290 x 1380 mm' },
  { id: 'AF-B10', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 10', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.35, larg: 1.45, peDireito: 2.6, cotasMM: '2350 x 1450 mm' },
  { id: 'AF-B11', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 11', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.4, larg: 1.48, peDireito: 2.6, cotasMM: '2400 x 1480 mm' },
  { id: 'AF-B12', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 12', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.25, larg: 1.38, peDireito: 2.6, cotasMM: '2250 x 1380 mm' },
  { id: 'AF-B13', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 13', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.27, larg: 1.39, peDireito: 2.6, cotasMM: '2270 x 1390 mm' },
  { id: 'AF-B14', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 14', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.3, larg: 1.41, peDireito: 2.6, cotasMM: '2300 x 1410 mm' },
  { id: 'AF-B15', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 15', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.31, larg: 1.42, peDireito: 2.6, cotasMM: '2310 x 1420 mm' },
  { id: 'AF-B16', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 16', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.36, larg: 1.46, peDireito: 2.6, cotasMM: '2360 x 1460 mm' },
  { id: 'AF-B17', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 17', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.38, larg: 1.47, peDireito: 2.6, cotasMM: '2380 x 1470 mm' },
  { id: 'AF-B18', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 18', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.42, larg: 1.5, peDireito: 2.6, cotasMM: '2420 x 1500 mm' },
  { id: 'AF-B19', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 19', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.28, larg: 1.4, peDireito: 2.6, cotasMM: '2280 x 1400 mm' },
  { id: 'AF-B20', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 20', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.3, larg: 1.42, peDireito: 2.6, cotasMM: '2300 x 1420 mm' },
  { id: 'AF-B21', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 21', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.48, larg: 1.52, peDireito: 2.6, cotasMM: '2480 x 1520 mm' },
  { id: 'AF-B22', tipo: 'BANHEIRO', ambiente: 'BANHEIRO 22', origem: 'PLANTA REAL (img0001.pdf)', comp: 2.52, larg: 1.55, peDireito: 2.6, cotasMM: '2520 x 1550 mm' },
  { id: 'AF-CIR-01', tipo: 'CIRCULACAO', ambiente: 'COPA / APOIO PAV. SUPERIOR', origem: 'PLANTA REAL (img0001.pdf)', comp: 3.45, larg: 2.15, peDireito: 2.8, cotasMM: '3450 x 2150 mm' },
  { id: 'AF-CIR-02', tipo: 'CIRCULACAO', ambiente: 'CORREDOR CENTRAL DE CIRCULAÇÃO', origem: 'PLANTA REAL (img0001.pdf)', comp: 18.6, larg: 1.65, peDireito: 2.8, cotasMM: '18600 x 1650 mm' },
];

export const INITIAL_OS: OSItem[] = [
  {
    id: 'OS-EST-09',
    week: 'SEMANA 37',
    status: 'URGENTE',
    bloco: 'SUPERESTRUTURA FASE 2 (+2,75M A +5,85M)',
    local: 'Salão Restaurante',
    codeRef: 'EST-09',
    desc: '09. LAJE TRELIÇADA DO RESTAURANTE C/ SOBRECARGA 300 KGF/M² (+2,75 M)',
    executor: 'DIEGO',
    unit: 'UN',
    prev: 10,
    exec: 5,
    unitPrice: 458.86,
    costMode: 'MO_ONLY',
    prazo: '2026-11-06',
    afericao: '10 Vigotas estruturais',
    recebedorKey: 'ELIENAY',
    photos: [],
  },
  {
    id: 'OS-01',
    week: 'SEMANA 37',
    status: 'URGENTE',
    bloco: 'REVESTIMENTO EM GERAL',
    local: 'Lajes Secas Superior (Banho 01 e 03)',
    codeRef: 'PRP-001',
    desc: 'INÍCIO IMEDIATO DE TRATAMENTO DE JUNTAS COM FITA TELADA E MASSA CIMENTÍCIA NAS LAJES SECAS',
    executor: 'NAY / PABLO',
    unit: 'M²',
    prev: 6.88,
    exec: 3.43,
    unitPrice: 50.0,
    costMode: 'MO_ONLY',
    prazo: '2026-11-05',
    afericao: 'Banheiro 01 (3,43m²) + Banheiro 03 (3,45m²) = 6,88 M²',
    recebedorKey: 'ELIENAY',
    photos: [],
  },
  {
    id: 'OS-02',
    week: 'SEMANA 37',
    status: 'EXECUÇÃO',
    bloco: 'ALVENARIA 1, 2 E 3',
    local: 'Banheiros 5, 7, 8, 10, 21, Copa, 16 e 17',
    codeRef: 'PRP-002',
    desc: 'CHUMBAMENTO PONTUAL DE PONTOS DE ESGOTOS DE 100 MM LAJE SECA BANHEIRO 5, 7, 8, 10, 21, COPA, 16 E 17',
    executor: 'NAY / PABLO',
    unit: 'UN',
    prev: 8,
    exec: 4,
    unitPrice: 43.75,
    costMode: 'MO_ONLY',
    prazo: '2026-11-06',
    afericao: '8 Pontos de 100mm aferidos em planta',
    recebedorKey: 'ELIENAY',
    photos: [],
  },
  {
    id: 'OS-03',
    week: 'SEMANA 37',
    status: 'EXECUTADO',
    bloco: 'REVESTIMENTO EM GERAL',
    local: 'BANHEIRO 02',
    codeRef: 'PRP-003',
    desc: 'LAJE SECA COM DUAS CAMADAS DE OSB E UMA DE PLACA CIMENTÍCIA',
    executor: 'NAY E PABLO',
    unit: 'M²',
    prev: 3.08,
    exec: 3.08,
    unitPrice: 116.67,
    costMode: 'MO_ONLY',
    prazo: '2026-11-03',
    afericao: '2,234m × 1,380m = 3,08 M²',
    recebedorKey: 'ELIENAY',
    photos: ['TM_OK_1', 'TM_OK_2'],
  },
  {
    id: 'OS-04',
    week: 'SEMANA 37',
    status: 'EXECUTADO',
    bloco: 'EMASSAMENTO',
    local: 'QUARTOS 01 E 02',
    codeRef: 'ADP-011',
    desc: 'EMASSAMENTO ACRÍLICO INTERNO EM PAREDES DE DRYWALL E ALVENARIA (2 DEMÃOS)',
    executor: 'EQUIPE PINTURA',
    unit: 'M²',
    prev: 36.93,
    exec: 36.93,
    unitPrice: 18.9,
    costMode: 'MO_ONLY',
    prazo: '2026-11-04',
    afericao: 'Quarto 01 Parede (36,93 M²)',
    recebedorKey: 'ELIENAY',
    photos: ['TM_OK_1', 'TM_OK_2'],
  },
];

export const INITIAL_MEDICAO: MedicaoItem[] = [
  {
    id: 'MED-1',
    week: 'SEMANA 37',
    bloco: 'ALVENARIA 1, 2 E 3',
    code: 'PRP-006',
    desc: 'REQUADRO EM ALVENARIA DE 1/2 VEZ COM ARGAMASSA MISTA',
    unit: 'M. LINEAR',
    unitPrice: 48.38,
    qty: 27.2,
  },
  {
    id: 'MED-3',
    week: 'SEMANA 37',
    bloco: 'REVESTIMENTO EM GERAL',
    code: 'PRP-008',
    desc: 'REFORÇO ESTRUTURAL EM PAREDE DE DRYWALL PARA FIXAÇÃO DE PEDRAS DE PIA E BOX',
    unit: 'M²',
    unitPrice: 24.5,
    qty: 18.5,
  },
  {
    id: 'MED-OS-03',
    week: 'SEMANA 37',
    bloco: 'REVESTIMENTO EM GERAL',
    code: 'PRP-003',
    desc: '[OS-03] LAJE SECA COM DUAS CAMADAS DE OSB E UMA DE PLACA CIMENTÍCIA',
    unit: 'M²',
    unitPrice: 116.67,
    qty: 3.08,
    osId: 'OS-03',
  },
  {
    id: 'MED-OS-04',
    week: 'SEMANA 37',
    bloco: 'EMASSAMENTO',
    code: 'ADP-011',
    desc: '[OS-04] EMASSAMENTO ACRÍLICO INTERNO EM PAREDES DE DRYWALL E ALVENARIA (2 DEMÃOS)',
    unit: 'M²',
    unitPrice: 18.9,
    qty: 36.93,
    osId: 'OS-04',
  },
];

export const INITIAL_CRONOGRAMA: CronogramaItem[] = [
  {
    id: 'CR-37-1',
    week: 'SEMANA 37',
    desc: 'PAGAMENTO SEMANAL AJUDANTES CNO (X3)',
    recebedor: 'ELIENAY MARQUES NEVES DUQUE',
    pix: '55.906.923/0001-07',
    formato: 'CNPJ',
    valor: 1850.0,
    autoTag: 'FIXO_CNO',
  },
];

export const INITIAL_ORCAMENTOS: OrcamentoItem[] = [
  {
    id: 'ORC-067',
    numero: 67,
    data: '2026-11-02',
    titulo: 'PLACAS CIMENTÍCIAS 10MM + FITA TELADA + MASSA JUNTAS (LAJE SECA)',
    solicitante: 'ENG. JOÃO / CABRAL',
    status: 'APROVADO',
    itensDesc:
      '25 Placas Cimentícias 1,20x2,40m 10mm + 12 Rolos Fita Telada + 8 Baldes Massa Cimentícia',
    qtdEstimada: 25,
    unidade: 'UN',
    valorEstimadoUnit: 148.0,
    fornecedorVencedor: 'UBERABA DRYWALL & CONSTRUÇÃO LTDA',
    fornecedorCNPJ: '19.452.881/0001-32',
    fornecedorFone: '(34) 3314-8890',
  },
  {
    id: 'ORC-068',
    numero: 68,
    data: '2026-11-03',
    titulo: 'GRAUTE GRANULAR ESTRUTURAL 25KG + ARGAMASSA POLIMÉRICA',
    solicitante: 'EVANDRO (MESTRE DE OBRAS)',
    status: 'ABERTO',
    itensDesc:
      '40 Sacos Graute Estrutural 25kg + 15 Caixas Argamassa Polimérica Impermeabilizante 18kg',
    qtdEstimada: 55,
    unidade: 'UN',
    valorEstimadoUnit: 62.5,
    fornecedorVencedor: 'CASA DO CONSTRUTOR TRIÂNGULO MG',
    fornecedorCNPJ: '08.712.904/0001-19',
    fornecedorFone: '(34) 99912-4410',
  },
];

export const INITIAL_OCS: OCOrder[] = [
  {
    id: 'OC-067',
    numero: 67,
    week: 'SEMANA 37',
    dataPedido: '2026-11-03',
    finalidade:
      'INSUMOS LAJE SECA E TRATAMENTO DE JUNTAS (BANHEIROS PAV. SUPERIOR)',
    fornecedorNome: 'UBERABA DRYWALL & CONSTRUÇÃO LTDA',
    fornecedorCNPJ: '19.452.881/0001-32',
    fornecedorFone: '(34) 3314-8890',
    items: [
      {
        desc: 'PLACA CIMENTÍCIA 10MM (1,20X2,40M) RESISTENTE À UMIDADE',
        qty: 20,
        unitPrice: 142.0,
      },
      {
        desc: 'FITA TELADA DE FIBRA DE VIDRO ALCALI-RESISTENTE 50MM X 90M',
        qty: 10,
        unitPrice: 38.5,
      },
      {
        desc: 'MASSA PARA TRATAMENTO DE JUNTA CIMENTÍCIA BALDE 20KG',
        qty: 6,
        unitPrice: 95.0,
      },
    ],
    desconto: 95.0,
    enviadoCronograma: false,
  },
];

export const INITIAL_WEBHOOK_LOGS: WebhookLog[] = [
  {
    event_id: 'EVT-8492',
    osId: 'OS-03',
    colaborador: 'Evandro Teixeira · Equipe Nay/Pablo',
    coords: '-19.74720, -47.93180 (R. João Caetano, 33)',
    timestamp: '03/11/2026 16:42:18',
    status: 'HTTP 200',
  },
  {
    event_id: 'EVT-8495',
    osId: 'OS-04',
    colaborador: 'Equipe Pintura · Hotel Modelo',
    coords: '-19.74722, -47.93184 (R. Artur Machado, 429)',
    timestamp: '04/11/2026 11:15:04',
    status: 'HTTP 200',
  },
];

export const FULL_CODIGO_GS = `/**
 * ============================================================================
 * SC SOARES LTDA · MOTOR DE BANCO DE DADOS SINAPI & GESTÃO CABRAL 2.0
 * Google Apps Script (Codigo.gs) — Automação Contínua + API Web App + ETL Caixa
 * Projeto Google Drive Vinculado: ${GDRIVE_TARGET_FOLDER_ID}
 * ============================================================================
 */

const CONFIG = {
  UF_PADRAO: 'MG',
  COMPETENCIA_ATUAL: '2026-09',
  ENCARGOS_MG_DESONERADO: 100.33,     // Horista MG Com Desoneração (INSS 10% - Lei 14.973/2024)
  ENCARGOS_MG_NAO_DESONERADO: 116.23, // Horista MG Sem Desoneração
  PASTA_DRIVE_ID: '${GDRIVE_TARGET_FOLDER_ID}',
  PASTA_DRIVE_SINAPI_NOME: 'SINAPI_IMPORTACAO_AUTOMATICA_SC_SOARES',
  ABAS: {
    COMPOSICOES: 'SINAPI_COMPOSICOES',
    INSUMOS: 'SINAPI_INSUMOS',
    ANALITICO: 'SINAPI_COMPOSICAO_ITENS',
    INDICADORES_IBGE: 'SINAPI_IBGE_HISTORICO',
    ESTADO_APP: 'CABRAL_2_0_STATE_JSON',
    LOGS: 'LOGS_SINCRONIZACAO'
  }
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏗️ SC SOARES · SINAPI')
    .addItem('1. Inicializar Estrutura do Banco de Dados', 'inicializarBancoDeDados')
    .addSeparator()
    .addItem('2. Sincronizar Agora com IBGE/SIDRA (API Contínua)', 'sincronizarIBGESidraMG')
    .addItem('3. Importar Planilha Oficial CAIXA da Pasta do Drive', 'importarPlanilhasCaixaDrive')
    .addItem('4. Recalcular Todas as Composições Analíticas (Regra TCU)', 'recalcularTodasComposicoesAnaliticas')
    .addSeparator()
    .addItem('5. Ativar Gatilho Mensal Automático (Todo dia 10)', 'instalarGatilhoMensalAutomatico')
    .addToUi();
}

function inicializarBancoDeDados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const esquemas = [
    {
      nome: CONFIG.ABAS.COMPOSICOES,
      colunas: [
        'ID_INTERNO', 'CODIGO_SINAPI', 'UF', 'COMPETENCIA', 'ETAPA_OBRA',
        'GRUPO_SERVICO', 'DESCRICAO', 'UNIDADE', 'CUSTO_MAO_OBRA',
        'CUSTO_INSUMOS', 'CUSTO_TOTAL_DESONERADO', 'CUSTO_TOTAL_NAO_DESONERADO',
        'PCT_MAO_OBRA', 'MODALIDADE_PADRAO', 'MEDICAO_ACUMULADA', 'ORIGEM', 'ATUALIZADO_EM'
      ],
      corCabecalho: '#0f172a'
    },
    {
      nome: CONFIG.ABAS.INSUMOS,
      colunas: [
        'CODIGO_INSUMO', 'UF', 'COMPETENCIA', 'CATEGORIA', 'DESCRICAO',
        'UNIDADE', 'PRECO_DESONERADO', 'PRECO_NAO_DESONERADO', 'ORIGEM_PRECO', 'ATUALIZADO_EM'
      ],
      corCabecalho: '#1e3a8a'
    },
    {
      nome: CONFIG.ABAS.ANALITICO,
      colunas: [
        'CODIGO_COMPOSICAO_PAI', 'TIPO_ITEM_FILHO', 'CODIGO_ITEM_FILHO',
        'DESCRICAO_ITEM', 'UNIDADE', 'COEFICIENTE', 'PRECO_UNITARIO_DESON',
        'CUSTO_PARCIAL_TRUNCADO', 'CATEGORIA_CUSTO'
      ],
      corCabecalho: '#065f46'
    },
    {
      nome: CONFIG.ABAS.INDICADORES_IBGE,
      colunas: [
        'COMPETENCIA', 'UF', 'CUSTO_MEDIO_M2_BRL', 'VARIACAO_MENSAL_PCT',
        'VARIACAO_12M_PCT', 'ENCARGOS_HORISTA_DESON_PCT', 'ENCARGOS_HORISTA_ONERADO_PCT',
        'FONTE_API', 'DATA_COLETA'
      ],
      corCabecalho: '#3730a3'
    },
    {
      nome: CONFIG.ABAS.ESTADO_APP,
      colunas: ['CHAVE_PROJETO', 'REV_ATUAL', 'SEMANA_ATIVA', 'JSON_PAYLOAD', 'ATUALIZADO_EM'],
      corCabecalho: '#7c2d12'
    },
    {
      nome: CONFIG.ABAS.LOGS,
      colunas: ['TIMESTAMP', 'OPERACAO', 'STATUS', 'REGISTROS_AFETADOS', 'DETALHES'],
      corCabecalho: '#334155'
    }
  ];

  esquemas.forEach(esq => {
    let sheet = ss.getSheetByName(esq.nome);
    if (!sheet) sheet = ss.insertSheet(esq.nome);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, esq.colunas.length).setValues([esq.colunas]);
      sheet.getRange(1, 1, 1, esq.colunas.length)
        .setBackground(esq.corCabecalho)
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });

  popularSementeInicialMG(ss);
  sincronizarIBGESidraMG();
}

function sincronizarIBGESidraMG() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.ABAS.INDICADORES_IBGE);
  const urlSidra = 'https://servicodados.ibge.gov.br/api/v3/agregados/2296/periodos/-6/variaveis/48|1196|1198?localidades=N3[31]';
  const response = UrlFetchApp.fetch(urlSidra, { method: 'get', muteHttpExceptions: true });
  return { ok: response.getResponseCode() === 200 };
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    sistema: 'SC SOARES · SINAPI API v3.0',
    uf: CONFIG.UF_PADRAO,
    competencia: CONFIG.COMPETENCIA_ATUAL
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (body.action === 'salvarEstadoCabral' || body.state) {
    const sheet = ss.getSheetByName(CONFIG.ABAS.ESTADO_APP);
    if (sheet) {
      sheet.appendRow([
        body.chave || 'CABRAL_2_0_HOTEL_MODELO',
        body.rev || 'REV22',
        body.semana || 'SEMANA 37',
        JSON.stringify(body.payload || body.state),
        new Date().toISOString()
      ]);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
