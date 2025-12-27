// src/config/parentRoles.ts

export type ParentRoleOption = {
  id: ParentRole;
  icon: string;
  labelKey: string;
};

export type ParentRole =
  | 'mother'
  | 'father'
  | 'grandparent'
  | 'guardian'
  | 'sibling'
  | 'other';

export const parentRoles: ParentRoleOption[] = [
  { id: 'mother', icon: '👩‍🍼', labelKey: 'onboarding.chooseRole.roles.mother' },
  { id: 'father', icon: '👨‍🍼', labelKey: 'onboarding.chooseRole.roles.father' },
  {
    id: 'grandparent',
    icon: '🧓',
    labelKey: 'onboarding.chooseRole.roles.grandparent',
  },
  {
    id: 'guardian',
    icon: '🛡️',
    labelKey: 'onboarding.chooseRole.roles.guardian',
  },
  {
    id: 'sibling',
    icon: '👧',
    labelKey: 'onboarding.chooseRole.roles.sibling',
  },
  { id: 'other', icon: '🙂', labelKey: 'onboarding.chooseRole.roles.other' },
];
