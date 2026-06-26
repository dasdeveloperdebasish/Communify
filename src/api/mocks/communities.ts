import { Community } from '@/types/community';

export const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'React Native Dev',
    description:
      'A community for React Native developers to share tips, tricks, and discuss the latest in mobile development.',
    memberCount: 48200,
    postCount: 3410,
    isJoined: false,
    category: 'Technology',
    createdAt: '2021-03-15T10:00:00Z',
    rules: [
      'Be respectful to all members',
      'No spam or self-promotion without permission',
      'Share only React Native related content',
      'Use code formatting when sharing snippets',
    ],
  },
  {
    id: '2',
    name: 'TypeScript Wizards',
    description:
      'Deep dives into TypeScript — advanced types, patterns, and real-world usage in large codebases.',
    memberCount: 31500,
    postCount: 2180,
    isJoined: false,
    category: 'Technology',
    createdAt: '2020-08-22T10:00:00Z',
    rules: [
      'Stay on topic — TypeScript only',
      'Provide minimal reproducible examples',
      'No beginner shaming',
    ],
  },
  {
    id: '3',
    name: 'UI/UX Designers',
    description:
      'A space for designers to share work, get feedback, and discuss design systems, tools and trends.',
    memberCount: 62800,
    postCount: 5920,
    isJoined: false,
    category: 'Design',
    createdAt: '2019-11-05T10:00:00Z',
    rules: ['Constructive feedback only', 'Credit original sources', 'No low-effort posts'],
  },
  {
    id: '4',
    name: 'Indie Hackers',
    description:
      'Build in public, share your journey, find co-founders and get advice on growing your indie business.',
    memberCount: 89300,
    postCount: 11240,
    isJoined: false,
    category: 'Business',
    createdAt: '2019-04-01T10:00:00Z',
    rules: [
      'Share real numbers when possible',
      'No affiliate links without disclosure',
      'Support each other',
    ],
  },
  {
    id: '5',
    name: 'Open Source Hub',
    description:
      'Discover open source projects, find contributors, and celebrate the culture of open collaboration.',
    memberCount: 27100,
    postCount: 1870,
    isJoined: false,
    category: 'Technology',
    createdAt: '2021-07-19T10:00:00Z',
    rules: [
      'Only link to open source projects',
      'Include license info when sharing projects',
      'Be welcoming to newcomers',
    ],
  },
  {
    id: '6',
    name: 'AI & Machine Learning',
    description:
      'Research papers, tutorials, tools and discussions around artificial intelligence and ML engineering.',
    memberCount: 114000,
    postCount: 9630,
    isJoined: false,
    category: 'Technology',
    createdAt: '2018-09-30T10:00:00Z',
    rules: [
      'Cite your sources',
      'No hype without substance',
      'Respect differing technical opinions',
    ],
  },
  {
    id: '7',
    name: 'Startup Stories',
    description:
      'Founders sharing honest stories — the wins, the failures, the pivots and the lessons learned.',
    memberCount: 43600,
    postCount: 4250,
    isJoined: false,
    category: 'Business',
    createdAt: '2020-02-14T10:00:00Z',
    rules: [
      'Be honest about your experience',
      'No promotional content disguised as stories',
      'Respect confidentiality',
    ],
  },
  {
    id: '8',
    name: 'Mobile Gaming',
    description:
      'Reviews, news, recommendations and discussions about mobile games across iOS and Android.',
    memberCount: 156000,
    postCount: 18900,
    isJoined: false,
    category: 'Gaming',
    createdAt: '2018-05-10T10:00:00Z',
    rules: ['No spoilers without warning', 'Keep discussions civil', 'No piracy links'],
  },
  {
    id: '9',
    name: 'Freelance Dev',
    description:
      'Tips, resources and community support for freelance developers navigating clients, contracts and rates.',
    memberCount: 19800,
    postCount: 2340,
    isJoined: false,
    category: 'Business',
    createdAt: '2021-01-08T10:00:00Z',
    rules: [
      'No rate shaming',
      'Share templates and resources freely',
      'Respect client confidentiality',
    ],
  },
  {
    id: '10',
    name: 'CSS Crafters',
    description:
      'All things CSS — animations, layouts, tricks, and the ongoing debate about utility-first vs semantic.',
    memberCount: 35400,
    postCount: 4780,
    isJoined: false,
    category: 'Design',
    createdAt: '2020-06-17T10:00:00Z',
    rules: [
      'Include browser compatibility info',
      'CodePen or equivalent for demos preferred',
      'No framework wars',
    ],
  },
  {
    id: '11',
    name: 'DevOps & Cloud',
    description:
      'Kubernetes, Docker, CI/CD, AWS, GCP and everything in between. Infrastructure as code and beyond.',
    memberCount: 52700,
    postCount: 6310,
    isJoined: false,
    category: 'Technology',
    createdAt: '2019-08-21T10:00:00Z',
    rules: [
      'No vendor bashing',
      'Include cost considerations where relevant',
      'Security best practices always',
    ],
  },
  {
    id: '12',
    name: 'Book Club',
    description:
      'Monthly reads, reviews, recommendations and thoughtful discussions around tech, business and fiction.',
    memberCount: 14200,
    postCount: 890,
    isJoined: false,
    category: 'Lifestyle',
    createdAt: '2022-01-03T10:00:00Z',
    rules: ['One book per month focus', 'Spoiler tags required', 'Respectful disagreement welcome'],
  },
];
