export interface ClickSessionInput {
  sessionId: string;
  landingUrl: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  adId?: string | null;
  adsetId?: string | null;
  campaignId?: string | null;
  creativeId?: string | null;
  campaignName?: string | null;
  adsetName?: string | null;
  creativeName?: string | null;
  xcod?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  ttclid?: string | null;
  createdAt?: number;
}

export interface CheckoutIntentInput {
  sessionId: string;
  email?: string | null;
  checkoutUrl: string;
  createdAt?: number;
}

export interface SurveyInput {
  email: string;
  firstName?: string | null;
  experience: string;
  languageSkill: string;
  englishLevel: string;
  hasInternationalInterview: string;
  internationalInterest: string;
  salaryRange: string;
  helpText: string;
  testEmail?: string | null;
  formId?: string | null;
  formName?: string | null;
  rawBodyJson?: string | null;
  submittedAt?: number;
}

export interface AttributionReportRow {
  creativeId: string;
  leads: number;
  purchases: number;
  revenue: number;
  avgLeadScore: number;
}

export interface DashboardFilters {
  startDate?: string | null;
  endDate?: string | null;
  experience?: string | null;
  languageSkill?: string | null;
  englishLevel?: string | null;
  hasInternationalInterview?: string | null;
  internationalInterest?: string | null;
  salaryRange?: string | null;
  campaignId?: string | null;
  adsetId?: string | null;
  creativeId?: string | null;
}

export interface PieSlice {
  label: string;
  count: number;
  proportion: number;
}

export interface DimensionOption {
  id: string;
  name: string;
  count: number;
}

export interface TreeNode {
  id: string;
  name: string;
  leadCount: number;
  leadScoreSum: number;
  leadScoreAvg: number;
  children: TreeNode[];
}

export interface DashboardData {
  totals: {
    filteredLeads: number;
    respondedLeads: number;
    responseRate: number;
    filteredLeadScoreAvg: number;
    filteredLeadScoreSum: number;
  };
  acquisition: {
    paid: { count: number; proportion: number };
    organic: { count: number; proportion: number };
  };
  campaignHeat: {
    quentePQ: { count: number; proportion: number };
    frioPF: { count: number; proportion: number };
    other: { count: number; proportion: number };
  };
  scoreBands: {
    hot: { count: number; proportion: number };
    warm: { count: number; proportion: number };
    cold: { count: number; proportion: number };
  };
  insights: {
    topCampaignName: string;
    topCampaignLeads: number;
    paidHotRate: number;
    organicHotRate: number;
  };
  questions: {
    key: keyof DashboardFilters;
    title: string;
    selected: string | null;
    slices: PieSlice[];
  }[];
  dimensions: {
    campaigns: DimensionOption[];
    adsets: DimensionOption[];
    creatives: DimensionOption[];
    selectedCampaignId: string | null;
    selectedAdsetId: string | null;
    selectedCreativeId: string | null;
  };
  tree: TreeNode[];
}

export interface DashboardLeadRow {
  email: string;
  firstName: string;
  experience: string;
  languageSkill: string;
  englishLevel: string;
  hasInternationalInterview: string;
  internationalInterest: string;
  salaryRange: string;
  leadScore: number;
  campaignId: string;
  campaignName: string;
  adsetId: string;
  adsetName: string;
  creativeId: string;
  creativeName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  xcod: string;
  attributionSource: "hotmart_origin" | "src" | "fallback_email" | "unknown";
}
