// Default label mappings for divisions
export const DEFAULT_LABELS = {
  'Brillstein': {
    agent: 'Manager',
    agents: 'Managers',
    deal: 'Slip',
    deals: 'Slips'
  },
  'Talent': {
    agent: 'Agent',
    agents: 'Agents',
    deal: 'Deal',
    deals: 'Deals'
  },
  'Marketing': {
    agent: 'Agent',
    agents: 'Agents',
    deal: 'Deal',
    deals: 'Deals'
  },
  'Properties': {
    agent: 'Agent',
    agents: 'Agents',
    deal: 'Deal',
    deals: 'Deals'
  },
  'Consulting': {
    agent: 'Agent',
    agents: 'Agents',
    deal: 'Deal',
    deals: 'Deals'
  },
  'Brand Partnerships': {
    agent: 'Agent',
    agents: 'Agents',
    deal: 'Deal',
    deals: 'Deals'
  },
  'default': {
    agent: 'Agent',
    agents: 'Agents',
    deal: 'Deal',
    deals: 'Deals'
  }
} as const

export type LabelKey = 'agent' | 'agents' | 'deal' | 'deals'

export type DivisionLabels = Record<LabelKey, string>

export function getDefaultLabelsForDivision(division: string | null): DivisionLabels {
  if (!division) {
    return DEFAULT_LABELS.default
  }

  return DEFAULT_LABELS[division as keyof typeof DEFAULT_LABELS] || DEFAULT_LABELS.default
}
