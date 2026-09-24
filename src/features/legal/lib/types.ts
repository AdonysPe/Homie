export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  id: string;
  title: string;
  body: LegalBlock[];
}

export interface LegalDocumentContent {
  title: string;
  description: string;
  updatedAt: { iso: string; label: string };
  summary: string[];
  sections: LegalSection[];
  contactEmail: string;
  related: { prefix: string; label: string; href: string };
}
