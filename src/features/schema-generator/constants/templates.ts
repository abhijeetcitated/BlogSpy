// Schema Templates - Quick start templates for each schema type

export const SCHEMA_TEMPLATES: Record<string, Array<{
  id: string
  name: string
  description: string
  data: Record<string, unknown>
}>> = {
  article: [
    {
      id: "blog-post",
      name: "Blog Post",
      description: "Standard blog article template",
      data: {
        headline: "How to Improve Your SEO Rankings",
        description: "A comprehensive guide to improving your website's SEO rankings with proven strategies.",
        image: "https://example.com/blog-image.jpg",
        author: "Jane Smith",
        authorUrl: "https://example.com/authors/jane-smith",
        publisher: "Example Blog",
        publisherLogo: "https://example.com/logo.png",
        datePublished: new Date().toISOString().split('T')[0],
        articleType: "BlogPosting"
      }
    },
    {
      id: "news-article",
      name: "News Article",
      description: "Breaking news or press release",
      data: {
        headline: "Company Announces New Product Launch",
        description: "Breaking news about the latest product announcement from our company.",
        image: "https://example.com/news-image.jpg",
        author: "Press Team",
        publisher: "News Corp",
        publisherLogo: "https://example.com/news-logo.png",
        datePublished: new Date().toISOString().split('T')[0],
        articleType: "NewsArticle"
      }
    }
  ],
  faq: [
    {
      id: "product-faq",
      name: "Product FAQ",
      description: "Common product questions",
      data: {
        items: [
          { question: "What is your return policy?", answer: "We offer a 30-day money-back guarantee on all products." },
          { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within the US." },
          { question: "Do you offer international shipping?", answer: "Yes, we ship to over 100 countries worldwide." }
        ]
      }
    },
    {
      id: "service-faq",
      name: "Service FAQ",
      description: "Service-related questions",
      data: {
        items: [
          { question: "How do I cancel my subscription?", answer: "You can cancel anytime from your account settings page." },
          { question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial with no credit card required." },
          { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and bank transfers." }
        ]
      }
    }
  ],
  product: [
    {
      id: "physical-product",
      name: "Physical Product",
      description: "E-commerce product template",
      data: {
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation.",
        image: "https://example.com/headphones.jpg",
        brand: "AudioTech",
        sku: "WH-1000",
        price: 249.99,
        priceCurrency: "USD",
        availability: "InStock",
        ratingValue: 4.5,
        reviewCount: 1250
      }
    },
    {
      id: "software-product",
      name: "Software Product",
      description: "SaaS or software template",
      data: {
        name: "Pro Analytics Suite",
        description: "Enterprise analytics software for data-driven insights.",
        image: "https://example.com/software.jpg",
        brand: "TechCorp",
        sku: "PAS-ENT",
        price: 99,
        priceCurrency: "USD",
        availability: "InStock",
        ratingValue: 4.8,
        reviewCount: 850
      }
    }
  ],
  localbusiness: [
    {
      id: "restaurant",
      name: "Restaurant",
      description: "Restaurant or cafe template",
      data: {
        name: "The Golden Fork Restaurant",
        description: "Fine dining restaurant serving international cuisine in downtown.",
        image: "https://example.com/restaurant.jpg",
        streetAddress: "123 Main Street",
        addressLocality: "New York",
        addressRegion: "NY",
        postalCode: "10001",
        addressCountry: "US",
        telephone: "+1-212-555-1234",
        priceRange: "$$$",
        openingHours: "Mo-Fr 11:00-22:00, Sa-Su 10:00-23:00"
      }
    },
    {
      id: "retail-store",
      name: "Retail Store",
      description: "Shop or boutique template",
      data: {
        name: "Fashion Forward Boutique",
        description: "Trendy fashion boutique with the latest styles.",
        image: "https://example.com/store.jpg",
        streetAddress: "456 Fashion Ave",
        addressLocality: "Los Angeles",
        addressRegion: "CA",
        postalCode: "90001",
        addressCountry: "US",
        telephone: "+1-310-555-6789",
        priceRange: "$$",
        openingHours: "Mo-Sa 10:00-20:00, Su 12:00-18:00"
      }
    }
  ],
  event: [
    {
      id: "conference",
      name: "Conference",
      description: "Business conference template",
      data: {
        name: "Tech Summit 2025",
        description: "The biggest technology conference of the year featuring industry leaders.",
        image: "https://example.com/conference.jpg",
        startDate: "2025-06-15T09:00",
        endDate: "2025-06-17T18:00",
        locationName: "Convention Center",
        locationAddress: "789 Event Blvd, San Francisco, CA",
        performer: "Industry Experts",
        eventStatus: "EventScheduled",
        eventAttendanceMode: "MixedEventAttendanceMode",
        offerPrice: 299,
        offerCurrency: "USD",
        offerUrl: "https://example.com/tickets"
      }
    },
    {
      id: "webinar",
      name: "Online Webinar",
      description: "Virtual event template",
      data: {
        name: "SEO Masterclass Webinar",
        description: "Learn advanced SEO techniques in this free online webinar.",
        startDate: "2025-03-20T14:00",
        endDate: "2025-03-20T16:00",
        locationName: "Online",
        locationAddress: "Virtual Event",
        eventStatus: "EventScheduled",
        eventAttendanceMode: "OnlineEventAttendanceMode",
        offerPrice: 0,
        offerCurrency: "USD"
      }
    }
  ],
  jobposting: [
    {
      id: "tech-job",
      name: "Tech Position",
      description: "Software developer job template",
      data: {
        title: "Senior Full Stack Developer",
        description: "Join our team as a Senior Full Stack Developer. You will work on cutting-edge web applications using React, Node.js, and cloud technologies. 5+ years experience required.",
        hiringOrganization: "TechStartup Inc",
        companyLogo: "https://example.com/company-logo.png",
        companyUrl: "https://techstartup.com",
        datePosted: new Date().toISOString().split('T')[0],
        employmentType: "FULL_TIME",
        workLocationType: "TELECOMMUTE",
        jobLocationCity: "San Francisco",
        jobLocationRegion: "CA",
        jobLocationCountry: "US",
        salaryMin: 120000,
        salaryMax: 180000,
        salaryCurrency: "USD",
        salaryUnit: "YEAR"
      }
    },
    {
      id: "marketing-job",
      name: "Marketing Position",
      description: "Marketing manager job template",
      data: {
        title: "Digital Marketing Manager",
        description: "Lead our digital marketing efforts including SEO, PPC, and social media campaigns. 3+ years experience in digital marketing required.",
        hiringOrganization: "Marketing Agency",
        datePosted: new Date().toISOString().split('T')[0],
        employmentType: "FULL_TIME",
        workLocationType: "",
        jobLocationCity: "Chicago",
        jobLocationRegion: "IL",
        jobLocationCountry: "US",
        salaryMin: 70000,
        salaryMax: 95000,
        salaryCurrency: "USD",
        salaryUnit: "YEAR"
      }
    }
  ],
  course: [
    {
      id: "online-course",
      name: "Online Course",
      description: "E-learning course template",
      data: {
        name: "Complete SEO Mastery Course",
        description: "Learn everything about SEO from beginner to advanced level with practical projects.",
        provider: "SEO Academy",
        providerUrl: "https://seoacademy.com",
        instructor: "John Expert",
        courseUrl: "https://seoacademy.com/courses/seo-mastery",
        image: "https://example.com/course-thumb.jpg",
        language: "English",
        duration: "PT40H",
        price: 199,
        priceCurrency: "USD",
        ratingValue: 4.9,
        reviewCount: 2500
      }
    }
  ],
  organization: [
    {
      id: "company",
      name: "Company",
      description: "Business organization template",
      data: {
        name: "Acme Corporation",
        description: "Leading provider of innovative technology solutions for businesses worldwide.",
        url: "https://acmecorp.com",
        logo: "https://acmecorp.com/logo.png",
        email: "contact@acmecorp.com",
        telephone: "+1-800-555-1234",
        streetAddress: "100 Tech Way",
        addressLocality: "Silicon Valley",
        addressRegion: "CA",
        postalCode: "94000",
        addressCountry: "US",
        foundingDate: "2010-01-15",
        sameAs: ["https://linkedin.com/company/acme", "https://twitter.com/acme"]
      }
    }
  ],
  person: [
    {
      id: "author",
      name: "Author Profile",
      description: "Writer or blogger template",
      data: {
        name: "Jane Smith",
        description: "Award-winning tech writer with 10+ years of experience covering SEO and digital marketing.",
        image: "https://example.com/jane-profile.jpg",
        url: "https://janesmith.com",
        email: "jane@janesmith.com",
        jobTitle: "Senior Tech Writer",
        worksFor: "Tech Media Inc",
        alumniOf: "Stanford University",
        sameAs: ["https://twitter.com/janesmith", "https://linkedin.com/in/janesmith"]
      }
    }
  ]
}
