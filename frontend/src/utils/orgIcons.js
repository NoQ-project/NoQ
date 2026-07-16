import { Building2, HeartPulse, FileText, Landmark } from 'lucide-react';

export const ORG_ICONS = {
  Building2,
  HeartPulse,
  FileText,
  Landmark,
};

export function getOrgIcon(name) {
  return ORG_ICONS[name] || Building2;
}
