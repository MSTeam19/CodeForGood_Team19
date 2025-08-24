export interface KnowledgeEntry {
  content: string;
  metadata?: {
    topic: string;
    [key: string]: any;
  };
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
}

export const staticKnowledgeBase: Record<string, KnowledgeEntry> = {
  how_to_donate: {
    content: "You can make a secure donation on our <a href='/leaderboard' target='_blank' rel='noopener noreferrer' class='donation-link'>Donation Page</a>. All contributions are processed securely and are greatly appreciated.",
    metadata: {
      topic: "donations"
    }
  },
  donation_tiers: {
    content: "We offer several donation tiers. A $50 donation can provide a student with textbooks for a year. A $100 donation can fund a desk and chair. A $500 donation can contribute to classroom refurbishment. Any amount you can give makes a huge difference.",
    metadata: {
      topic: "donations"
    }
  },
  mission_statement: {
    content: "Our mission is to empower communities and create opportunities through education and outreach. You can <a href='#mission-section' class='donation-link'>read more about our approach</a> on the homepage.",
    metadata: { topic: "mission" }
  },
  contact_info: {
    content: "You can find all our contact details on our official website: <a href='https://reachhk.squarespace.com' target='_blank' rel='noopener noreferrer' class='donation-link'>reachhk.squarespace.com</a>.",
    metadata: { topic: "contact" }
  },
  impact_stories: {
    content: "We're proud to share the stories of students whose lives have been transformed. You can read them in the <a href='#impact-stories-section' class='donation-link'>Stories of Change section</a> on our homepage.",
    metadata: { topic: "impact" }
  }
};