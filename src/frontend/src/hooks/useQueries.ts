import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EmergencyContact,
  EvidenceRecord,
  LegalArticle,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Static Legal Content ─────────────────────────────────────────────────────
// Hardcoded fallback — displayed immediately without backend call

const STATIC_LEGAL_ARTICLES: LegalArticle[] = [
  {
    id: 1n,
    title: "Right to Remain Silent (Section 161 CrPC)",
    category: "citizens_rights",
    content:
      "You have the right to remain silent when questioned by police under Section 161 CrPC. You are NOT obligated to be a witness against yourself (Article 20(3), Constitution of India).\n\nKey points:\n• You cannot be forced to confess or incriminate yourself\n• Any confession made to police is NOT admissible as evidence\n• You can choose to give a written statement rather than oral\n• Police cannot detain you for questioning beyond 24 hours without producing you before a magistrate\n• If arrested, you must be informed of the grounds of arrest immediately",
  },
  {
    id: 2n,
    title: "Right to Legal Representation",
    category: "citizens_rights",
    content:
      "Every arrested person has the right to consult and be represented by a lawyer of their choice (Article 22(1), Constitution of India).\n\nKey points:\n• You can demand to speak to a lawyer before answering any questions\n• If you cannot afford a lawyer, the state must provide one (Section 304 CrPC)\n• Police cannot deny you access to your lawyer once arrested\n• Legal Aid Services are free — contact your District Legal Services Authority (DLSA)\n• Toll-free Legal Aid helpline: 15100",
  },
  {
    id: 3n,
    title: "Right Against Illegal Detention",
    category: "citizens_rights",
    content:
      "Under Article 22 of the Constitution and Section 57 CrPC, police cannot detain you for more than 24 hours without producing you before a magistrate.\n\nKey points:\n• If detained, demand to know the reason for detention\n• Police must inform a family member or friend of your arrest\n• File a Habeas Corpus petition (Article 32/226) if illegally detained\n• Wrongful detention is punishable under IPC Section 340-342\n• Keep note of the arresting officer's name, badge number, and police station",
  },
  {
    id: 4n,
    title: "How to File an FIR",
    category: "fir_process",
    content:
      "A First Information Report (FIR) is a written document prepared by police when they receive information about a cognizable offence.\n\nStep-by-step process:\n1. Go to the nearest police station (any station, not just the one in the crime area)\n2. Give a written or oral complaint to the Station House Officer (SHO)\n3. Describe the incident clearly — who, what, when, where\n4. Police MUST register the FIR for cognizable offences — they cannot refuse\n5. Get a free copy of the FIR (Section 154 CrPC)\n6. If police refuse, send complaint to SP/DSP by post or file complaint before a magistrate (Section 156(3) CrPC)\n\nZero FIR: You can file an FIR at any police station regardless of jurisdiction. It will be transferred to the correct station.",
  },
  {
    id: 5n,
    title: "Complaint Against Police Misconduct",
    category: "fir_process",
    content:
      "If police refuse to register your FIR or harass you, you have multiple options.\n\nEscalation steps:\n1. File a written complaint with the Superintendent of Police (SP)\n2. Approach the State Police Complaints Authority\n3. File a complaint with the State Human Rights Commission\n4. Approach the National Human Rights Commission (NHRC) — nhrc.nic.in\n5. File a Writ Petition before the High Court\n\nPolice accountability:\n• Police are bound by the Supreme Court guidelines in Prakash Singh case (2006)\n• Custodial torture is a violation of Article 21 (Right to Life)\n• File complaint under Section 166 IPC for public servant disobeying law",
  },
  {
    id: 6n,
    title: "Protection of Women from Harassment",
    category: "womens_safety",
    content:
      "Indian law provides strong protections against harassment of women.\n\nKey laws:\n• Sexual Harassment at Workplace (POSH Act 2013): Employer must have an Internal Complaints Committee. File complaint within 3 months of incident.\n• IPC Section 354: Assault or criminal force against a woman — 1-5 years imprisonment\n• IPC Section 354A: Sexual harassment including unwanted physical contact or demands for sexual favors\n• IPC Section 354D: Stalking — up to 3 years for first offence\n• IPC Section 509: Words/gestures insulting modesty of a woman\n\nEmergency contacts:\n• Women's Helpline: 1091\n• Police Emergency: 100\n• National Commission for Women: 7827170170",
  },
  {
    id: 7n,
    title: "Domestic Violence Protection",
    category: "womens_safety",
    content:
      "The Protection of Women from Domestic Violence Act 2005 protects women from physical, emotional, sexual, verbal, and economic abuse.\n\nWho is protected:\n• Wife or live-in partner\n• Women in same household (sisters, mothers, daughters)\n\nRelief available:\n• Protection orders to stop the abuser\n• Residence orders to keep you in your home\n• Monetary relief for losses and expenses\n• Custody orders for children\n• Compensation orders\n\nHow to seek help:\n1. Contact Protection Officer in your district\n2. Approach any magistrate directly\n3. Contact NGOs registered under the Act\n• National Domestic Violence Helpline: 181\n• NCW Helpline: 7827170170",
  },
  {
    id: 8n,
    title: "Rights of Women in Rape Cases",
    category: "womens_safety",
    content:
      "Under the Criminal Law (Amendment) Act 2013 and Supreme Court guidelines:\n\nKey rights of survivors:\n• FIR must be registered at zero FIR at any police station\n• Medical examination must be conducted by a female doctor\n• Statement must be recorded by a female officer\n• No two-finger test — it is illegal and violates dignity\n• Identity cannot be disclosed publicly (Section 228A IPC)\n• Trial must be conducted in camera (in private)\n• Free legal aid must be provided\n• Compensation from State Victim Compensation Fund\n\nPunishment for rape: 7 years to life imprisonment (Section 376 IPC).\nGang rape: Minimum 20 years, can extend to life (Section 376D IPC).",
  },
  {
    id: 9n,
    title: "Self-Defense Rights (Section 96-106 IPC)",
    category: "citizens_rights",
    content:
      "Every person has the right to defend their body and property under Sections 96-106 of the Indian Penal Code.\n\nRight of private defense:\n• You can use force to protect yourself or others from attack\n• No duty to retreat — you can stand your ground\n• Force must be proportionate to the threat\n• Cannot exceed what is necessary to prevent the assault\n\nExtending to causing death:\nYou can cause death in self-defense if there is reasonable apprehension of:\n• Death or grievous hurt\n• Rape or kidnapping\n• Wrongful confinement in circumstances preventing recourse to public authorities\n\nLimitations:\n• Self-defense cannot be claimed if you provoked the attack\n• Excessive force beyond necessity is punishable",
  },
  {
    id: 10n,
    title: "Rights During Police Interrogation",
    category: "police_procedures",
    content:
      "If police want to question you, know your rights.\n\nBefore arrest:\n• You can refuse to answer questions\n• You do not have to go to the police station unless legally arrested\n• Police cannot summon you as a witness against yourself\n\nAfter arrest:\n• Must be informed of the reason for arrest\n• Must be produced before magistrate within 24 hours\n• Have the right to medical examination\n• Cannot be subjected to third-degree methods or torture\n• Confession to police officer is NOT admissible (Section 25, Indian Evidence Act)\n• Confession must be made to a magistrate voluntarily to be valid\n\nIf you believe you are being tortured:\n• Make a complaint to the magistrate when produced\n• Request medical examination\n• Contact the State Human Rights Commission",
  },
  {
    id: 11n,
    title: "Cognizable vs Non-Cognizable Offence",
    category: "police_procedures",
    content:
      "Understanding the type of offence determines how police can act.\n\nCognizable Offence:\n• Police can arrest WITHOUT a warrant\n• FIR must be registered\n• Examples: murder, rape, robbery, kidnapping, dacoity, assault\n• Police must investigate without court's permission\n\nNon-Cognizable Offence:\n• Police CANNOT arrest without a warrant\n• Police must take a court order before investigation\n• Examples: assault without grievous hurt, cheating under small amounts, defamation\n• Complaint (not FIR) is filed\n\nBailable vs Non-Bailable:\n• Bailable: You have a right to bail — police must release you\n• Non-Bailable: Only a court can grant bail\n• All serious crimes (murder, rape, etc.) are non-bailable",
  },
  {
    id: 12n,
    title: "Right to Bail",
    category: "police_procedures",
    content:
      "Bail is the release of an arrested person on conditions to ensure appearance at trial.\n\nTypes of bail:\n1. Regular Bail (Section 437/439 CrPC): For non-bailable offences — applied to Sessions Court or High Court\n2. Anticipatory Bail (Section 438 CrPC): Pre-arrest bail when you fear arrest — apply to Sessions Court or High Court\n3. Default Bail (Section 167(2) CrPC): Automatic right to bail if chargesheet not filed within 60-90 days\n\nBail in bailable offences:\n• You have an absolute right to bail\n• Police station can grant bail directly — no court needed\n\nFactors courts consider:\n• Nature and gravity of accusation\n• Antecedents of the accused\n• Possibility of fleeing justice\n• Danger to witnesses or evidence",
  },
];

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDisplayName() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["displayName"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getDisplayName();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateDisplayName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDisplayName(displayName);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["displayName"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useUpsertSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: {
      displayName: string;
      pinEnabled: boolean;
      pinHash: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.upsertSettings(updates);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── SOS ──────────────────────────────────────────────────────────────────────

export function useSOSState() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["sosState"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getCurrentSOSState();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTriggerSOS() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.triggerSOS();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sosState"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useCancelSOS() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelSOS();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sosState"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export function useContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<EmergencyContact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUserContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      phoneNumber,
    }: {
      name: string;
      phoneNumber: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addContact(name, phoneNumber);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useRemoveContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contactID: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeContact(contactID);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export function useEvidenceRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<EvidenceRecord[]>({
    queryKey: ["evidence"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUserEvidenceRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      incidentType,
      description,
      notes,
    }: {
      incidentType: string;
      description: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addEvidenceRecord(incidentType, description, notes);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
}

export function useDeleteEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evidenceID: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEvidenceRecord(evidenceID);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["evidence"] });
    },
  });
}

// ─── Legal Articles ───────────────────────────────────────────────────────────
// Returns hardcoded static articles immediately — no backend call needed.
// This ensures instant display and avoids permission errors.

export function useLegalArticles() {
  return useQuery<LegalArticle[]>({
    queryKey: ["legalArticles"],
    queryFn: async () => STATIC_LEGAL_ARTICLES,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
