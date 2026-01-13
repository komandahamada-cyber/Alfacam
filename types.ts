
export interface AnalysisResult {
  id: string;
  timestamp: number;
  originalText: string;
  identifiedTest: string;
  diagnosisAr?: string;
  diagnosisEn?: string;
  icd10Code?: string;
  icd11Code?: string;
  confidence: number;
  descriptionAr: string;
  descriptionEn: string;
  isUnclear: boolean;
  disclaimer: string;
}

export enum AppState {
  CAMERA = 'CAMERA',
  CROPPING = 'CROPPING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  ERROR = 'ERROR'
}
