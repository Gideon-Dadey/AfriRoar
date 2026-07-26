/** Curated fields of study for scholarship applications (industry-standard taxonomy). */

export const INTENDED_DEGREE_LEVELS = [
  { value: 'bachelors', label: "Bachelor's (BSc / BA / BEng)" },
  { value: 'masters', label: "Master's (MSc / MA / MEng / MBA)" },
  { value: 'phd', label: 'Doctoral (PhD / DPhil)' },
  { value: 'postdoc', label: 'Postdoctoral research' },
  { value: 'high-school', label: 'High school / pre-university' },
] as const;

export type StudyFieldCategory = {
  category: string;
  fields: string[];
};

export const STUDY_FIELD_CATEGORIES: StudyFieldCategory[] = [
  {
    category: 'Computing & Technology',
    fields: [
      'Computer Science',
      'Information Technology',
      'Software Engineering',
      'Data Science',
      'Artificial Intelligence',
      'Cybersecurity',
      'Information Systems',
      'Computer Engineering',
    ],
  },
  {
    category: 'Engineering',
    fields: [
      'Civil Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Electronic Engineering',
      'Chemical Engineering',
      'Biomedical Engineering',
      'Environmental Engineering',
      'Industrial Engineering',
      'Petroleum Engineering',
      'Aerospace Engineering',
    ],
  },
  {
    category: 'Natural & Physical Sciences',
    fields: [
      'Biology',
      'Biotechnology',
      'Chemistry',
      'Physics',
      'Mathematics',
      'Statistics',
      'Environmental Science',
      'Geology',
      'Astronomy',
    ],
  },
  {
    category: 'Health & Medicine',
    fields: [
      'Medicine',
      'Nursing',
      'Public Health',
      'Pharmacy',
      'Dentistry',
      'Physiotherapy',
      'Nutrition & Dietetics',
      'Veterinary Science',
    ],
  },
  {
    category: 'Business & Economics',
    fields: [
      'Business Administration',
      'Economics',
      'Finance',
      'Accounting',
      'Marketing',
      'International Business',
      'Entrepreneurship',
      'Supply Chain Management',
      'Human Resource Management',
    ],
  },
  {
    category: 'Social Sciences',
    fields: [
      'Political Science',
      'International Relations',
      'Sociology',
      'Psychology',
      'Anthropology',
      'Development Studies',
      'Geography',
      'Social Work',
    ],
  },
  {
    category: 'Law & Governance',
    fields: ['Law', 'Human Rights', 'Public Policy', 'Public Administration', 'Criminology'],
  },
  {
    category: 'Education',
    fields: [
      'Education',
      'Educational Leadership',
      'Curriculum & Instruction',
      'Special Education',
      'TESOL / Applied Linguistics',
    ],
  },
  {
    category: 'Arts, Humanities & Media',
    fields: [
      'English / Literature',
      'History',
      'Philosophy',
      'Linguistics',
      'Journalism',
      'Media & Communications',
      'Fine Arts',
      'Design',
      'Architecture',
      'Music',
    ],
  },
  {
    category: 'Agriculture & Environment',
    fields: [
      'Agriculture',
      'Agronomy',
      'Forestry',
      'Food Science',
      'Climate Change / Sustainability',
      'Water Resources',
    ],
  },
];

export const STUDY_FIELD_OTHER = 'Other (specify)';

export function allStudyFields(): string[] {
  return STUDY_FIELD_CATEGORIES.flatMap((c) => c.fields);
}

export function isListedStudyField(field: string): boolean {
  return allStudyFields().includes(field);
}
