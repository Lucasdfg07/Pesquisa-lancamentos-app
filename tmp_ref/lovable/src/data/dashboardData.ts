// Mock data for the lead score dashboard

export interface CampaignRow {
  name: string;
  leads: number;
  score: number;
}

export interface AdSetRow {
  name: string;
  leads: number;
  score: number;
  campaignName: string;
}

export interface CreativeRow {
  name: string;
  leads: number;
  score: number;
  campaignName: string;
  adSetName: string;
}

export const kpiData = {
  totalLeads: 2284,
  leadGoal: 2500,
  organicLeads: 812,
  paidLeads: 1650,
  hotLeads: 876,
  warmLeads: 643,
  coldLeads: 765,
  avgLeadScore: 59.73,
  responseRate: 77.35,
  totalResponses: 1940,
};

export const dailyCaptureData = [
  { date: "10/ago", paid: 36, organic: 11 },
  { date: "11/ago", paid: 40, organic: 25 },
  { date: "12/ago", paid: 179, organic: 40 },
  { date: "13/ago", paid: 37, organic: 106 },
  { date: "14/ago", paid: 41, organic: 50 },
  { date: "15/ago", paid: 80, organic: 47 },
  { date: "16/ago", paid: 83, organic: 20 },
  { date: "17/ago", paid: 126, organic: 22 },
  { date: "18/ago", paid: 90, organic: 44 },
  { date: "19/ago", paid: 66, organic: 22 },
  { date: "20/ago", paid: 35, organic: 5 },
  { date: "21/ago", paid: 35, organic: 8 },
  { date: "22/ago", paid: 79, organic: 20 },
  { date: "23/ago", paid: 86, organic: 13 },
  { date: "24/ago", paid: 110, organic: 22 },
  { date: "25/ago", paid: 125, organic: 39 },
  { date: "26/ago", paid: 109, organic: 38 },
  { date: "27/ago", paid: 176, organic: 39 },
  { date: "28/ago", paid: 89, organic: 29 },
  { date: "29/ago", paid: 50, organic: 18 },
  { date: "30/ago", paid: 60, organic: 9 },
  { date: "31/ago", paid: 59, organic: 10 },
];

export const hourlyCaptureData = [
  { hour: "0h", total: 71 }, { hour: "1h", total: 56 }, { hour: "2h", total: 106 },
  { hour: "3h", total: 35 }, { hour: "4h", total: 58 }, { hour: "5h", total: 62 },
  { hour: "6h", total: 84 }, { hour: "7h", total: 130 }, { hour: "8h", total: 155 },
  { hour: "9h", total: 158 }, { hour: "10h", total: 174 }, { hour: "11h", total: 155 },
  { hour: "12h", total: 132 }, { hour: "13h", total: 104 }, { hour: "14h", total: 101 },
  { hour: "15h", total: 100 }, { hour: "16h", total: 87 }, { hour: "17h", total: 106 },
  { hour: "18h", total: 106 }, { hour: "19h", total: 109 }, { hour: "20h", total: 85 },
  { hour: "21h", total: 99 }, { hour: "22h", total: 73 }, { hour: "23h", total: 75 },
];

export const campaignData = [
  { name: "CONVERSAO_F_CAPTACAO_ASC_VIDEOS", leads: 431, score: 72.4 },
  { name: "CONVERSAO_F_CAPTACAO_ASC_IMAGENS", leads: 328, score: 65.8 },
  { name: "CONVERSAO_Q_CAPTACAO_MIX_QUENTE_180D", leads: 281, score: 81.2 },
  { name: "ENVOLVIMENTO_90D_TESTE_CRIATIVOS_L2", leads: 163, score: 45.3 },
  { name: "CONVERSAO_F_CAPTACAO_LAL_1P_LOTE_2", leads: 83, score: 58.9 },
  { name: "DEMANDA_F_CAPTACAO_INTERESSES_PROG", leads: 68, score: 42.1 },
  { name: "DEMANDA_Q_CAPTACAO_ENVOLVIMENTO_540D", leads: 63, score: 38.7 },
  { name: "CONVERSAO_Q_CAPTACAO_ENVOLVIMENTO_90D", leads: 33, score: 55.2 },
  { name: "ENVOLVIMENTO_90D_LEADS_TESTE_CRIATIVOS", leads: 20, score: 31.5 },
  { name: "CONVERSAO_Q_CAPTACAO_LAL_1_TESTE", leads: 19, score: 49.8 },
] satisfies CampaignRow[];

export const adSetData = [
  { name: "CONVERSAO_F_CAPTACAO_ASC_VIDEOS", leads: 704, score: 74.1, campaignName: "CONVERSAO_F_CAPTACAO_ASC_VIDEOS" },
  { name: "MANUAL_MIX_QUENTE_180D", leads: 284, score: 79.5, campaignName: "CONVERSAO_Q_CAPTACAO_MIX_QUENTE_180D" },
  { name: "ENVOLVIMENTO_90D_AD42_IMG_C_15", leads: 106, score: 52.3, campaignName: "ENVOLVIMENTO_90D_TESTE_CRIATIVOS_L2" },
  { name: "ENVOLVIMENTO_540D", leads: 56, score: 36.8, campaignName: "DEMANDA_Q_CAPTACAO_ENVOLVIMENTO_540D" },
  { name: "INTERESSES_PROGRAMACAO_SP", leads: 50, score: 44.2, campaignName: "DEMANDA_F_CAPTACAO_INTERESSES_PROG" },
  { name: "ABO_CONVERSAO_F_CAPTACAO_ASC_IMG", leads: 49, score: 61.7, campaignName: "CONVERSAO_F_CAPTACAO_ASC_IMAGENS" },
  { name: "LAL_1_ALUNOS_AD34_VD_C_22", leads: 19, score: 58.4, campaignName: "CONVERSAO_F_CAPTACAO_LAL_1P_LOTE_2" },
  { name: "ENVOLVIMENTO_90D_AD34_VD_C_22", leads: 15, score: 47.9, campaignName: "CONVERSAO_Q_CAPTACAO_LAL_1_TESTE" },
  { name: "LAL_1_ALUNOS_AD42_IMG_C_15", leads: 15, score: 53.1, campaignName: "ENVOLVIMENTO_90D_LEADS_TESTE_CRIATIVOS" },
  { name: "ENVOLVIMENTO_90D_AD21_VD_C_09", leads: 14, score: 41.6, campaignName: "CONVERSAO_Q_CAPTACAO_ENVOLVIMENTO_90D" },
] satisfies AdSetRow[];

export const creativeData = [
  { name: "AD42_IMG_C_15_CAP", leads: 416, score: 68.3, campaignName: "CONVERSAO_F_CAPTACAO_ASC_VIDEOS", adSetName: "CONVERSAO_F_CAPTACAO_ASC_VIDEOS" },
  { name: "AD34_VD_C_22_CAP", leads: 411, score: 71.9, campaignName: "CONVERSAO_Q_CAPTACAO_MIX_QUENTE_180D", adSetName: "MANUAL_MIX_QUENTE_180D" },
  { name: "AD12_IMG_C_05_CAP", leads: 142, score: 55.4, campaignName: "CONVERSAO_F_CAPTACAO_ASC_IMAGENS", adSetName: "ABO_CONVERSAO_F_CAPTACAO_ASC_IMG" },
  { name: "AD01_VD_C_01_CAP", leads: 137, score: 62.7, campaignName: "CONVERSAO_F_CAPTACAO_LAL_1P_LOTE_2", adSetName: "LAL_1_ALUNOS_AD34_VD_C_22" },
  { name: "AD21_VD_C_09_CAP", leads: 97, score: 48.2, campaignName: "CONVERSAO_Q_CAPTACAO_ENVOLVIMENTO_90D", adSetName: "ENVOLVIMENTO_90D_AD21_VD_C_09" },
  { name: "AD43_IMG_C_16_CAP", leads: 81, score: 59.1, campaignName: "ENVOLVIMENTO_90D_TESTE_CRIATIVOS_L2", adSetName: "ENVOLVIMENTO_90D_AD42_IMG_C_15" },
  { name: "AD03_VD_C_03_CAP", leads: 66, score: 44.8, campaignName: "DEMANDA_F_CAPTACAO_INTERESSES_PROG", adSetName: "INTERESSES_PROGRAMACAO_SP" },
  { name: "AD36_IMG_C_09_CAP", leads: 34, score: 37.5, campaignName: "DEMANDA_Q_CAPTACAO_ENVOLVIMENTO_540D", adSetName: "ENVOLVIMENTO_540D" },
  { name: "AD37_IMG_C_10_CAP", leads: 23, score: 41.3, campaignName: "ENVOLVIMENTO_90D_LEADS_TESTE_CRIATIVOS", adSetName: "LAL_1_ALUNOS_AD42_IMG_C_15" },
  { name: "AD11_IMG_C_04_CAP", leads: 15, score: 52.6, campaignName: "CONVERSAO_Q_CAPTACAO_LAL_1_TESTE", adSetName: "ENVOLVIMENTO_90D_AD34_VD_C_22" },
] satisfies CreativeRow[];

export const leadScoreDistribution = [
  { range: "0-20", count: 342, label: "Muito Frio" },
  { range: "21-40", count: 423, label: "Frio" },
  { range: "41-60", count: 643, label: "Morno" },
  { range: "61-80", count: 512, label: "Quente" },
  { range: "81-100", count: 364, label: "Muito Quente" },
];
