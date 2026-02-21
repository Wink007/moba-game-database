/**
 * Parse a flat item description string into structured sections:
 * - tagline: short phrase describing the item's purpose
 * - attributes: stat bonuses like "+1800 HP", "+40 Magic Defense"
 * - abilities: unique passives, actives, and attributes with their descriptions
 */

export interface ParsedAbility {
  type: string;   // "Унікальний пасив" / "Unique Passive" etc.
  name: string;   // "Відновлення" / "Recovery" etc.
  description: string;
}

export interface ParsedItemDescription {
  tagline?: string;
  attributes: string[];
  abilities: ParsedAbility[];
}

export const parseItemDescription = (
  description: string,
  itemName: string
): ParsedItemDescription => {
  if (!description) {
    return { attributes: [], abilities: [] };
  }

  let text = description.trim();

  // 1. Remove item name from the beginning
  // Try exact match first, then try removing first word-match
  if (text.startsWith(itemName)) {
    text = text.slice(itemName.length).trim();
  } else {
    // Some descriptions start with a different name variant (e.g., "Winter Crown" vs "Winter Truncheon")
    // Try to find where attributes/abilities start
    const firstPlus = text.indexOf('+');
    const firstUnique = findFirstAbility(text);

    if (firstPlus > 0 && (firstUnique === -1 || firstPlus < firstUnique)) {
      // Check if there's a name-like prefix before the first +
      const prefix = text.slice(0, firstPlus).trim();
      // If prefix has lowercase words (not all caps/numbers), it likely contains name + tagline
      if (prefix.length > 0) {
        text = prefix + ' ' + text.slice(firstPlus);
        // Try to strip what looks like an item name (first few capitalized words)
        const nameMatch = text.match(/^[A-Z][a-zA-Z'-]*(?:\s+(?:of|the|for|and|in|to)\s+[A-Z][a-zA-Z'-]*|\s+[A-Z][a-zA-Z'-]*)*/);
        if (nameMatch && nameMatch[0].length > 3) {
          text = text.slice(nameMatch[0].length).trim();
        }
      }
    } else if (firstUnique > 0) {
      text = text.slice(0, firstUnique).trim() + ' ' + text.slice(firstUnique);
    }
  }

  // 2. Split abilities (Unique Passive/Active/Attribute sections)
  const abilityRegex = /(Унікальний\s+(?:пасив|актив|атрибут)|Unique\s+(?:Passive|Active|Attribute))\s*[—–-]\s*/gi;
  const abilities: ParsedAbility[] = [];
  
  let mainText = text;
  const abilityMatches = Array.from(text.matchAll(abilityRegex));
  
  if (abilityMatches.length > 0) {
    mainText = text.slice(0, abilityMatches[0].index!).trim();
    
    for (let i = 0; i < abilityMatches.length; i++) {
      const match = abilityMatches[i];
      const type = match[1];
      const startAfterType = match.index! + match[0].length;
      const endPos = i + 1 < abilityMatches.length 
        ? abilityMatches[i + 1].index! 
        : text.length;
      
      const content = text.slice(startAfterType, endPos).trim();
      
      // Split "Name: description" 
      const colonIndex = content.indexOf(':');
      let name = '';
      let desc = content;
      
      if (colonIndex > 0 && colonIndex < 60) {
        name = content.slice(0, colonIndex).trim();
        desc = content.slice(colonIndex + 1).trim();
      }
      
      // Remove trailing period
      desc = desc.replace(/\.\s*$/, '');
      
      abilities.push({ type, name, description: desc });
    }
  }

  // 3. Split mainText into tagline and attributes
  // Attributes start with + followed by a number
  const attrRegex = /\+\d+/;
  const firstAttrMatch = mainText.match(attrRegex);
  
  let tagline: string | undefined;
  let attrText = '';
  
  if (firstAttrMatch && firstAttrMatch.index !== undefined) {
    tagline = mainText.slice(0, firstAttrMatch.index).trim() || undefined;
    attrText = mainText.slice(firstAttrMatch.index).trim();
  } else {
    // No attributes found, everything is tagline
    tagline = mainText.trim() || undefined;
  }

  // 4. Parse individual attributes from attrText
  // Pattern: "+NUMBER[%] description text" repeated
  const attributes: string[] = [];
  if (attrText) {
    // Split on each +number pattern, keeping the delimiter
    const parts = attrText.split(/(?=\+\d)/);
    for (const part of parts) {
      const cleaned = part.trim();
      if (cleaned) {
        attributes.push(cleaned);
      }
    }
  }

  return { tagline, attributes, abilities };
};

function findFirstAbility(text: string): number {
  const patterns = [
    /Унікальний\s+(?:пасив|актив|атрибут)/i,
    /Unique\s+(?:Passive|Active|Attribute)/i,
  ];
  
  let minIndex = -1;
  for (const pat of patterns) {
    const match = text.match(pat);
    if (match && match.index !== undefined) {
      if (minIndex === -1 || match.index < minIndex) {
        minIndex = match.index;
      }
    }
  }
  
  return minIndex;
}
