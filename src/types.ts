export interface PresetMapping {
  id: string;
  name: string;
  windowsPrefix: string; // e.g. "\\Tuhin-046-digit\f"
  macPrefix: string;     // e.g. "/Volumes/tuhin-046-digit"
}

export type PathType = 'windows' | 'mac_local' | 'mac_smb' | 'unknown';

export interface ConversionResult {
  detectedType: PathType;
  windowsPath: string;
  macLocalPath: string;
  macSmbPath: string;
  error?: string;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: string;
  input: string;
  windowsPath: string;
  macLocalPath: string;
  macSmbPath: string;
  detectedType: PathType;
}
