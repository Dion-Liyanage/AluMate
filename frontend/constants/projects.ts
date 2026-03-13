export interface Feedback {
  name: string;
  comment: string;
  rating: number;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  desc: string;
  img: string;
  rating: number;
  reviewCount: number;
  feedbacks: Feedback[];
  createdAt: string;
}

export const PROJECTS: Project[] = [
  { 
    id: 1,
    title: "Modern Residential Windows", 
    category: "Windows",
    desc: "Minimalist black aluminium frames for a contemporary home", 
    img: "/projects/project_1.png",
    rating: 4.8,
    reviewCount: 24,
    feedbacks: [
      { name: "John Doe", comment: "Excellent work, very professional.", rating: 5 },
      { name: "Sarah Smith", comment: "High quality materials used.", rating: 4 }
    ],
    createdAt: "2024-06-15T10:00:00Z"
  },
  { 
    id: 2,
    title: "Modern Ceiling",
    category: "Ceiling",
    desc: "Sleek suspended aluminium ceiling grid featuring integrated lighting, providing a clean, contemporary aesthetic for corporate and commercial spaces.", 
    img: "/projects/project_2.png",
    rating: 4.9,
    reviewCount: 18,
    feedbacks: [
      { name: "Michael Chen", comment: "Transformed our office space completely.", rating: 5 },
      { name: "Emma Wilson", comment: "The lighting integration is genius.", rating: 5 }
    ],
    createdAt: "2024-06-10T10:00:00Z"
  },
  { 
    id: 3,
    title: "Luxury Patio Sliding Doors", 
    category: "Doors",
    desc: "Premium grey finish sliding doors connecting indoor & outdoor", 
    img: "/projects/project_3.png",
    rating: 4.7,
    reviewCount: 32,
    feedbacks: [
      { name: "David Brown", comment: "Smooth operation and looks amazing.", rating: 5 },
      { name: "Lisa Garcia", comment: "Best investment for our patio.", rating: 4 }
    ],
    createdAt: "2024-06-05T10:00:00Z"
  },
  { 
    id: 4,
    title: "Commercial Storefront", 
    category: "Doors",
    desc: "Sleek and inviting black aluminium frames creating a premium and contemporary retail storefront experience.", 
    img: "/projects/project_4.png",
    rating: 4.6,
    reviewCount: 15,
    feedbacks: [
      { name: "Robert Taylor", comment: "Great visibility and professional look.", rating: 5 }
    ],
    createdAt: "2024-03-20T10:00:00Z"
  },
  { 
    id: 5,
    title: "Modern Kitchen Cupboards", 
    category: "Cupboards",
    desc: "Professional and bright commercial interior featuring sleek aluminium glass partitions for a modern workspace.", 
    img: "/projects/project_5.png",
    rating: 4.5,
    reviewCount: 10,
    feedbacks: [],
    createdAt: "2024-03-02T10:00:00Z"
  },
  { 
    id: 6,
    title: "Custom Aluminium Pantries", 
    category: "Pantries",
    desc: "Elegant residential balcony featuring a frameless glass balustrade supported by a minimalist aluminium bottom track.", 
    img: "/projects/project_6.png",
    rating: 4.8,
    reviewCount: 12,
    feedbacks: [],
    createdAt: "2024-02-15T10:00:00Z"
  },
  { 
    id: 7,
    title: "Villa Double-Height Window Wall", 
    category: "Windows",
    desc: "Massive double-height aluminium window wall for a stunning modern villa, showing off superior structural capabilities.", 
    img: "/projects/project_7.png",
    rating: 5.0,
    reviewCount: 8,
    feedbacks: [],
    createdAt: "2024-01-30T10:00:00Z"
  },
  { 
    id: 8,
    title: "Suspended Suspended Ceilings", 
    category: "Ceilings",
    desc: "Stylish aluminium louvre sunshade system installed on the exterior of a contemporary building for optimal climate control.", 
    img: "/projects/project_8.png",
    rating: 4.7,
    reviewCount: 20,
    feedbacks: [],
    createdAt: "2024-01-12T10:00:00Z"
  }
];
