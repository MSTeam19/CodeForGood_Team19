// mock data to simulate a backend response

export const mockKnowledgeBase = [
  {
    content: "To make a donation, please visit our official website and click the 'Donate Now' button in the header. All contributions are processed securely and are greatly appreciated.",
    embedding: [0.1, 0.2, 0.3]
  },
  {
    content: "Our mission at REACH is to provide underprivileged children with access to quality education and learning materials. We believe every child deserves a chance to succeed.",
    embedding: [0.4, 0.5, 0.6]
  },
  {
    content: "For general inquiries, you can email our team at contact@reach.org. For media-related questions, please contact our communications team at press@reach.org.",
    embedding: [0.7, 0.8, 0.9]
  },
  {
    content: "Donations to REACH are fully tax-deductible in Singapore and Hong Kong. You will receive an official receipt via email within 24 hours of your donation.",
    embedding: [0.1, 0.5, 0.8]
  }
];


export const mockProjects = [
  {
    id: 'proj-001',
    name: "Project Sunshine - School Refurbishment",
    description: "We are currently fundraising to refurbish the Wan Chai Elementary school, providing new desks, books, and a safe learning environment.",
    is_active: true,
  },
  {
    id: 'proj-002',
    name: "Digital Future Initiative",
    description: "This campaign aims to provide 100 laptops to students at KL Central School in Malaysia, bridging the digital divide.",
    is_active: true,
  },
  {
    id: 'proj-003',
    name: "Annual Gala Dinner 2023",
    description: "Our yearly fundraising gala that was held last December. Thank you to all who contributed!",
    is_active: false,
  }
];