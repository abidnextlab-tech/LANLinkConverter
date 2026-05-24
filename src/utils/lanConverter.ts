import { PresetMapping, PathType, ConversionResult } from '../types';

/**
 * Detect the likely platform/format of a given LAN path string.
 */
export function detectPathType(path: string): PathType {
  const trimmed = path.trim().replace(/^['"]|['"]$/g, ''); // Strip quotes
  
  if (trimmed.startsWith('\\\\') || trimmed.includes('\\')) {
    return 'windows';
  }
  
  if (trimmed.startsWith('smb://')) {
    return 'mac_smb';
  }
  
  if (trimmed.startsWith('/Volumes/') || trimmed.startsWith('/')) {
    return 'mac_local';
  }
  
  return 'unknown';
}

/**
 * Standardize path slashes based on requested platform.
 * Replace all backslashes with forward slashes or vice versa.
 */
export function normalizeSlashes(path: string, targetPlatform: 'win' | 'mac'): string {
  if (targetPlatform === 'win') {
    // Replace all / with \
    return path.replace(/\//g, '\\');
  } else {
    // Replace all \ with /
    return path.replace(/\\/g, '/');
  }
}

/**
 * Collapses consecutive backslashes while preserving the leading double-backslash for UNC paths.
 */
export function collapseWindowsSlashes(path: string): string {
  if (path.startsWith('\\\\')) {
    return '\\\\' + path.substring(2).replace(/\\+/g, '\\');
  }
  return path.replace(/\\+/g, '\\');
}

/**
 * Convert a LAN path from any detected format into all format representations
 * using custom prefix-mapping configurations.
 */
export function convertLanPath(
  input: string,
  mappings: PresetMapping[]
): ConversionResult {
  const cleanInput = input.trim().replace(/^['"]|['"]$/g, '');
  if (!cleanInput) {
    return {
      detectedType: 'unknown',
      windowsPath: '',
      macLocalPath: '',
      macSmbPath: ''
    };
  }

  const detectedType = detectPathType(cleanInput);
  
  let windowsPath = '';
  let macLocalPath = '';
  let macSmbPath = '';

  // 1. EXTRACT COMMON PATH (WITHOUT PREFIX) BASED ON MAPPING OR FALLBACK
  let matchedMapping: PresetMapping | null = null;
  let remainingPath = '';

  if (detectedType === 'windows') {
    // Check if starts with any Windows prefix (case-insensitive)
    const lowerInput = cleanInput.toLowerCase();
    for (const mapping of mappings) {
      const lowerWin = mapping.windowsPrefix.toLowerCase();
      if (lowerInput.startsWith(lowerWin)) {
        // Must ensure we split exactly at the end of prefix, avoiding partial folder matching
        // e.g., if prefix is \\host\f and input is \\host\f_folder, it should not match fully.
        const suffix = cleanInput.substring(mapping.windowsPrefix.length);
        if (suffix === '' || suffix.startsWith('\\') || suffix.startsWith('/')) {
          matchedMapping = mapping;
          remainingPath = suffix.startsWith('\\') || suffix.startsWith('/') ? suffix.substring(1) : suffix;
          break;
        }
      }
    }

    if (matchedMapping) {
      // Map using rule
      const subPathMac = normalizeSlashes(remainingPath, 'mac');
      macLocalPath = `${matchedMapping.macPrefix}/${subPathMac}`.replace(/\/+/g, '/');
      
      // Build SMB link. Extract host/share out from Windows Prefix
      // e.g., mapping windowsPrefix is "\\Tuhin-046-digit\f"
      // extract host and share names
      const match = matchedMapping.windowsPrefix.match(/^\\\\([^\\]+)\\(.+)$/);
      if (match) {
        const host = match[1];
        const share = normalizeSlashes(match[2], 'mac');
        macSmbPath = `smb://${host}/${share}/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      } else {
        // Fallback SMB
        macSmbPath = `smb://${matchedMapping.macPrefix.replace(/^\/Volumes\//, '')}/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      }
      windowsPath = collapseWindowsSlashes(cleanInput);
    } else {
      // Fallback parser for Windows UNC path: \\host\share\path...
      const uncMatch = cleanInput.match(/^\\\\([^\\]+)\\(.+)$/);
      if (uncMatch) {
        const host = uncMatch[1];
        const fullRest = uncMatch[2];
        const parts = fullRest.split('\\');
        const share = parts[0];
        const subPath = parts.slice(1).join('\\');
        
        const subPathMac = normalizeSlashes(subPath, 'mac');
        
        // Typical fallback:
        // Mac mounts it usually under shareName, or host-shareName
        // Let's output /Volumes/share/subpath and /Volumes/host/share/subpath
        // By default, let's keep Server name lowercase as macOS usually mounts it as the share name
        // but we'll show /Volumes/host-share style
        macLocalPath = `/Volumes/${host.toLowerCase()}/${subPathMac}`.replace(/\/+/g, '/');
        macSmbPath = `smb://${host}/${share}/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      } else {
        // Simple slash replacement
        macLocalPath = normalizeSlashes(cleanInput, 'mac');
        macSmbPath = `smb://${macLocalPath.replace(/^\/+/, '')}`;
      }
      windowsPath = collapseWindowsSlashes(cleanInput);
    }

  } else if (detectedType === 'mac_local') {
    // Check if starts with a Mac prefix (case-insensitive)
    const lowerInput = cleanInput.toLowerCase();
    for (const mapping of mappings) {
      const lowerMac = mapping.macPrefix.toLowerCase();
      if (lowerInput.startsWith(lowerMac)) {
        const suffix = cleanInput.substring(mapping.macPrefix.length);
        if (suffix === '' || suffix.startsWith('/') || suffix.startsWith('\\')) {
          matchedMapping = mapping;
          remainingPath = suffix.startsWith('/') || suffix.startsWith('\\') ? suffix.substring(1) : suffix;
          break;
        }
      }
    }

    if (matchedMapping) {
      const subPathWin = normalizeSlashes(remainingPath, 'win');
      windowsPath = collapseWindowsSlashes(`${matchedMapping.windowsPrefix}\\${subPathWin}`);
      
      const match = matchedMapping.windowsPrefix.match(/^\\\\([^\\]+)\\(.+)$/);
      const subPathMac = normalizeSlashes(remainingPath, 'mac');
      if (match) {
        const host = match[1];
        const share = normalizeSlashes(match[2], 'mac');
        macSmbPath = `smb://${host}/${share}/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      } else {
        macSmbPath = `smb://${matchedMapping.macPrefix.replace(/^\/Volumes\//, '')}/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      }
      macLocalPath = cleanInput;
    } else {
      // Fallback for Mac mount path: e.g. /Volumes/tuhin-046-digit/Apple Gadgets...
      if (cleanInput.startsWith('/Volumes/')) {
        const parts = cleanInput.substring(9).split('/');
        const volumeName = parts[0];
        const subPath = parts.slice(1).join('/');
        
        const subPathWin = normalizeSlashes(subPath, 'win');
        // Fallback assuming volumeName is of form host-share or just host
        // Let's split on hyphens if any, or general host
        // e.g. /Volumes/tuhin-046-digit maps to \\Tuhin-046-digit\f (but without the share we can default to volumeName)
        // Let's capitalize Host name nicely in fallback
        const hostCased = volumeName.charAt(0).toUpperCase() + volumeName.slice(1);
        windowsPath = collapseWindowsSlashes(`\\\\${hostCased}\\share\\${subPathWin}`);
        
        const subPathMac = normalizeSlashes(subPath, 'mac');
        macSmbPath = `smb://${hostCased}/share/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      } else {
        // Just general root mount /f/Apple...
        const plainPath = cleanInput.startsWith('/') ? cleanInput.substring(1) : cleanInput;
        const subPathWin = normalizeSlashes(plainPath, 'win');
        windowsPath = collapseWindowsSlashes(`\\\\server\\share\\${subPathWin}`);
        macSmbPath = `smb://server/share/${normalizeSlashes(plainPath, 'mac')}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
      }
      macLocalPath = cleanInput;
    }

  } else if (detectedType === 'mac_smb') {
    // Parse smb://host/share/subpath
    const smbMatch = cleanInput.match(/^smb:\/\/([^/]+)\/([^/]+)\/?(.*)$/);
    if (smbMatch) {
      const host = smbMatch[1];
      const share = smbMatch[2];
      const subPath = smbMatch[3] || '';
      
      const subPathWin = normalizeSlashes(subPath, 'win');
      const subPathMac = normalizeSlashes(subPath, 'mac');
      
      // Check if host and share match any windows prefix in mappings
      const possibleWinPrefix = `\\\\${host}\\${share}`.toLowerCase();
      for (const mapping of mappings) {
        if (mapping.windowsPrefix.toLowerCase() === possibleWinPrefix) {
          matchedMapping = mapping;
          break;
        }
      }

      if (matchedMapping) {
        windowsPath = collapseWindowsSlashes(`${matchedMapping.windowsPrefix}\\${subPathWin}`);
        macLocalPath = `${matchedMapping.macPrefix}/${subPathMac}`.replace(/\/+/g, '/');
      } else {
        windowsPath = collapseWindowsSlashes(`\\\\${host}\\${share}\\${subPathWin}`);
        macLocalPath = `/Volumes/${host.toLowerCase()}/${subPathMac}`.replace(/\/+/g, '/');
      }
      macSmbPath = cleanInput;
    } else {
      // Raw backup
      const striped = cleanInput.replace(/^smb:\/\//, '');
      const subPathWin = normalizeSlashes(striped, 'win');
      windowsPath = collapseWindowsSlashes(`\\\\${subPathWin}`);
      macLocalPath = `/Volumes/${normalizeSlashes(striped, 'mac')}`.replace(/\/+/g, '/');
      macSmbPath = cleanInput;
    }
  } else {
    // Unknown or simple string, treat it as general folder subpath
    const subPathWin = normalizeSlashes(cleanInput, 'win');
    const subPathMac = normalizeSlashes(cleanInput, 'mac');
    windowsPath = collapseWindowsSlashes(`\\\\server\\share\\${subPathWin}`);
    macLocalPath = `/Volumes/share/${subPathMac}`.replace(/\/+/g, '/');
    macSmbPath = `smb://server/share/${subPathMac}`.replace(/\/+/g, '/').replace('smb:/', 'smb://');
  }

  // Final trim and cleaning to prevent trailing slashes unless original has them
  const hasTrailingSlash = cleanInput.endsWith('/') || cleanInput.endsWith('\\');
  if (!hasTrailingSlash) {
    if (windowsPath.endsWith('\\')) windowsPath = windowsPath.slice(0, -1);
    if (macLocalPath.endsWith('/')) macLocalPath = macLocalPath.slice(0, -1);
    if (macSmbPath.endsWith('/')) macSmbPath = macSmbPath.slice(0, -1);
  }

  return {
    detectedType,
    windowsPath,
    macLocalPath,
    macSmbPath
  };
}

/**
 * Scan a block of text, detect LAN paths, and replace them with converted formats.
 * Highly useful for multi-link text messages or emails shared in office channels!
 */
export function convertTextBlob(
  text: string,
  mappings: PresetMapping[],
  targetFormat: 'windows' | 'mac_local' | 'mac_smb'
): string {
  if (!text) return '';
  
  // Regex to extract Windows LAN shares (matches lines starting with \\ or containing backslash paths)
  // or macOS mounting paths starting with /Volumes/
  // or SMB URIs smb://
  
  let resultText = text;

  // Let's execute replacement line-by-line or by grabbing links
  // A link pattern could be:
  // 1. Windows: \\\\[A-Za-z0-9_-]+\\[^\n\r]+
  // 2. Mac: /Volumes/[A-Za-z0-9_-]+/[^\n\r]+
  // 3. SMB: smb://[A-Za-z0-9_-]+/[^\n\r]+
  
  // We can split the text into lines and check if the entire line looks like a path,
  // or we can search for matches inside quotes/spaces.
  // To avoid breaking layout, let's process word-by-word or use regex.
  // A really nice way is parsing lines, or finding substrings that match.
  // Let's do a reliable line-by-line conversion if a line is a full link,
  // and also standard regex replacement for inline paths.

  const lines = text.split(/\r?\n/);
  const convertedLines = lines.map(line => {
    // If the line itself is purely a LAN link (or has minor wrapping quotes/brackets):
    const stripped = line.trim().replace(/^['"\(\[]|['"\)\]]$/g, '');
    const isWin = stripped.startsWith('\\\\');
    const isMacVol = stripped.startsWith('/Volumes/');
    const isSmb = stripped.startsWith('smb://');
    
    if (isWin || isMacVol || isSmb) {
      const conv = convertLanPath(stripped, mappings);
      let targetPath = '';
      if (targetFormat === 'windows') targetPath = conv.windowsPath;
      else if (targetFormat === 'mac_local') targetPath = conv.macLocalPath;
      else targetPath = conv.macSmbPath;

      // Re-wrap in quotes/brackets if they were there
      const leadChar = line.trim().match(/^['"\(\[]/)?.[0] || '';
      const trailChar = line.trim().match(/['"\)\]]$/)?.[0] || '';
      
      const indent = line.substring(0, line.indexOf(line.trim()));
      return `${indent}${leadChar}${targetPath}${trailChar}`;
    }
    
    // Otherwise, do an inline regex replacement of links in the line!
    // Regex for Windows paths, matches up to space or end of string, allowing spaces in folders if quoted
    // Let's start with general Windows path finder (non-space, or space with quotes)
    // Quick approximation:
    return line;
  });

  return convertedLines.join('\n');
}
