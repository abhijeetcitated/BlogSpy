// Schema Type Configurations

import type { SchemaTypeConfig } from "../types"
import { 
  authorField, 
  descriptionField, 
  imageField,
  CURRENCY_OPTIONS,
  PRICE_RANGE_OPTIONS
} from "./common-fields"

// Schema type configurations
export const SCHEMA_TYPES: SchemaTypeConfig[] = [
  {
    id: "article",
    name: "Article",
    description: "For blog posts, news articles, and content pages",
    icon: "FileText",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/20 dark:bg-blue-500/10",
    popularity: 95,
    fields: [
      {
        id: "headline",
        name: "Headline",
        type: "text",
        placeholder: "Your article title",
        required: true,
        description: "The headline of the article (max 110 characters)"
      },
      descriptionField,
      imageField,
      authorField,
      {
        id: "authorUrl",
        name: "Author URL",
        type: "url",
        placeholder: "https://example.com/author",
        required: false,
        description: "Link to author's page"
      },
      {
        id: "publisher",
        name: "Publisher Name",
        type: "text",
        placeholder: "Your Blog Name",
        required: true,
        description: "Name of the publishing organization"
      },
      {
        id: "publisherLogo",
        name: "Publisher Logo URL",
        type: "url",
        placeholder: "https://example.com/logo.png",
        required: true,
        description: "Logo URL (recommended: 600x60px)"
      },
      {
        id: "datePublished",
        name: "Date Published",
        type: "date",
        required: true,
        description: "Original publication date"
      },
      {
        id: "dateModified",
        name: "Date Modified",
        type: "date",
        required: false,
        description: "Last modification date"
      },
      {
        id: "articleType",
        name: "Article Type",
        type: "select",
        required: true,
        options: [
          { value: "BlogPosting", label: "Blog Post" },
          { value: "NewsArticle", label: "News Article" },
          { value: "Article", label: "General Article" }
        ],
        defaultValue: "BlogPosting"
      }
    ]
  },
  {
    id: "faq",
    name: "FAQ",
    description: "For frequently asked questions pages",
    icon: "HelpCircle",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/20 dark:bg-purple-500/10",
    popularity: 90,
    fields: [
      {
        id: "items",
        name: "FAQ Items",
        type: "array",
        required: true,
        description: "Add your questions and answers",
        arrayItemType: "object",
        arrayItemFields: [
          {
            id: "question",
            name: "Question",
            type: "text",
            placeholder: "What is your question?",
            required: true
          },
          {
            id: "answer",
            name: "Answer",
            type: "textarea",
            placeholder: "The answer to the question...",
            required: true
          }
        ]
      }
    ]
  },
  {
    id: "howto",
    name: "How-To",
    description: "For tutorials and step-by-step guides",
    icon: "ListOrdered",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/20 dark:bg-green-500/10",
    popularity: 85,
    fields: [
      {
        id: "name",
        name: "Title",
        type: "text",
        placeholder: "How to Build a Website",
        required: true
      },
      descriptionField,
      { ...imageField, required: false },
      {
        id: "totalTime",
        name: "Total Time",
        type: "text",
        placeholder: "PT30M (30 minutes)",
        required: false,
        description: "Duration in ISO 8601 format (e.g., PT1H30M for 1h 30min)"
      },
      {
        id: "estimatedCost",
        name: "Estimated Cost",
        type: "text",
        placeholder: "$50",
        required: false
      },
      {
        id: "steps",
        name: "Steps",
        type: "array",
        required: true,
        description: "Add step-by-step instructions",
        arrayItemType: "object",
        arrayItemFields: [
          {
            id: "name",
            name: "Step Title",
            type: "text",
            placeholder: "Step 1: Prepare materials",
            required: true
          },
          {
            id: "text",
            name: "Step Description",
            type: "textarea",
            placeholder: "Detailed instructions for this step...",
            required: true
          },
          {
            id: "image",
            name: "Step Image URL",
            type: "url",
            placeholder: "https://example.com/step1.jpg",
            required: false
          }
        ]
      }
    ]
  },
  {
    id: "product",
    name: "Product",
    description: "For product pages and reviews",
    icon: "ShoppingCart",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/20 dark:bg-amber-500/10",
    popularity: 88,
    fields: [
      {
        id: "name",
        name: "Product Name",
        type: "text",
        placeholder: "iPhone 15 Pro",
        required: true
      },
      descriptionField,
      imageField,
      {
        id: "brand",
        name: "Brand",
        type: "text",
        placeholder: "Apple",
        required: true
      },
      {
        id: "sku",
        name: "SKU",
        type: "text",
        placeholder: "IP15PRO-256",
        required: false
      },
      {
        id: "price",
        name: "Price",
        type: "number",
        placeholder: "999",
        required: true,
        min: 0
      },
      {
        id: "priceCurrency",
        name: "Currency",
        type: "select",
        required: true,
        options: CURRENCY_OPTIONS,
        defaultValue: "USD"
      },
      {
        id: "availability",
        name: "Availability",
        type: "select",
        required: true,
        options: [
          { value: "InStock", label: "In Stock" },
          { value: "OutOfStock", label: "Out of Stock" },
          { value: "PreOrder", label: "Pre-Order" }
        ],
        defaultValue: "InStock"
      },
      {
        id: "ratingValue",
        name: "Rating",
        type: "rating",
        required: false,
        min: 1,
        max: 5
      },
      {
        id: "reviewCount",
        name: "Review Count",
        type: "number",
        placeholder: "150",
        required: false,
        min: 0
      }
    ]
  },
  {
    id: "recipe",
    name: "Recipe",
    description: "For food recipes and cooking instructions",
    icon: "UtensilsCrossed",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/20 dark:bg-orange-500/10",
    popularity: 75,
    fields: [
      {
        id: "name",
        name: "Recipe Name",
        type: "text",
        placeholder: "Chocolate Chip Cookies",
        required: true
      },
      descriptionField,
      imageField,
      authorField,
      {
        id: "prepTime",
        name: "Prep Time",
        type: "text",
        placeholder: "PT20M",
        required: true,
        description: "In ISO 8601 format (e.g., PT20M for 20 minutes)"
      },
      {
        id: "cookTime",
        name: "Cook Time",
        type: "text",
        placeholder: "PT25M",
        required: true
      },
      {
        id: "recipeYield",
        name: "Yield",
        type: "text",
        placeholder: "24 cookies",
        required: true
      },
      {
        id: "recipeCategory",
        name: "Category",
        type: "text",
        placeholder: "Dessert",
        required: true
      },
      {
        id: "recipeCuisine",
        name: "Cuisine",
        type: "text",
        placeholder: "American",
        required: true
      },
      {
        id: "ingredients",
        name: "Ingredients",
        type: "array",
        required: true,
        arrayItemType: "text",
        description: "List all ingredients"
      },
      {
        id: "instructions",
        name: "Instructions",
        type: "array",
        required: true,
        arrayItemType: "text",
        description: "Step-by-step cooking instructions"
      }
    ]
  },
  {
    id: "review",
    name: "Review",
    description: "For product or service reviews",
    icon: "Star",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/20 dark:bg-yellow-500/10",
    popularity: 80,
    fields: [
      {
        id: "itemReviewed",
        name: "Item Reviewed",
        type: "text",
        placeholder: "Samsung Galaxy S24",
        required: true
      },
      {
        id: "itemType",
        name: "Item Type",
        type: "select",
        required: true,
        options: [
          { value: "Product", label: "Product" },
          { value: "Movie", label: "Movie" },
          { value: "Book", label: "Book" },
          { value: "Restaurant", label: "Restaurant" },
          { value: "LocalBusiness", label: "Local Business" }
        ],
        defaultValue: "Product"
      },
      {
        id: "reviewRating",
        name: "Your Rating",
        type: "rating",
        required: true,
        min: 1,
        max: 5
      },
      authorField,
      {
        id: "reviewBody",
        name: "Review Text",
        type: "textarea",
        placeholder: "Write your detailed review here...",
        required: true,
        description: "Your full review (minimum 150 characters recommended)"
      },
      {
        id: "datePublished",
        name: "Review Date",
        type: "date",
        required: true
      }
    ]
  },
  {
    id: "video",
    name: "Video",
    description: "For video content and embeds",
    icon: "Video",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/20 dark:bg-red-500/10",
    popularity: 70,
    fields: [
      {
        id: "name",
        name: "Video Title",
        type: "text",
        placeholder: "How to Make Perfect Coffee",
        required: true
      },
      descriptionField,
      {
        id: "thumbnailUrl",
        name: "Thumbnail URL",
        type: "url",
        placeholder: "https://example.com/thumbnail.jpg",
        required: true
      },
      {
        id: "uploadDate",
        name: "Upload Date",
        type: "date",
        required: true
      },
      {
        id: "duration",
        name: "Duration",
        type: "text",
        placeholder: "PT5M30S",
        required: true,
        description: "In ISO 8601 format (e.g., PT5M30S for 5min 30sec)"
      },
      {
        id: "contentUrl",
        name: "Video URL",
        type: "url",
        placeholder: "https://example.com/video.mp4",
        required: false
      },
      {
        id: "embedUrl",
        name: "Embed URL",
        type: "url",
        placeholder: "https://youtube.com/embed/xxxxx",
        required: false
      }
    ]
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    description: "For navigation breadcrumbs",
    icon: "Link2",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-500/20 dark:bg-cyan-500/10",
    popularity: 65,
    fields: [
      {
        id: "items",
        name: "Breadcrumb Items",
        type: "array",
        required: true,
        description: "Add breadcrumb navigation items in order",
        arrayItemType: "object",
        arrayItemFields: [
          {
            id: "name",
            name: "Page Name",
            type: "text",
            placeholder: "Home",
            required: true
          },
          {
            id: "url",
            name: "Page URL",
            type: "url",
            placeholder: "https://example.com/",
            required: true
          }
        ]
      }
    ]
  },
  {
    id: "localbusiness",
    name: "Local Business",
    description: "For local businesses, stores, and service providers",
    icon: "Store",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/20 dark:bg-indigo-500/10",
    popularity: 82,
    fields: [
      {
        id: "name",
        name: "Business Name",
        type: "text",
        placeholder: "My Coffee Shop",
        required: true
      },
      {
        id: "description",
        name: "Description",
        type: "textarea",
        placeholder: "A cozy coffee shop in downtown...",
        required: true,
        description: "Brief description of your business"
      },
      {
        id: "image",
        name: "Business Image URL",
        type: "url",
        placeholder: "https://example.com/storefront.jpg",
        required: true
      },
      {
        id: "streetAddress",
        name: "Street Address",
        type: "text",
        placeholder: "123 Main Street",
        required: true
      },
      {
        id: "addressLocality",
        name: "City",
        type: "text",
        placeholder: "New York",
        required: true
      },
      {
        id: "addressRegion",
        name: "State/Region",
        type: "text",
        placeholder: "NY",
        required: true
      },
      {
        id: "postalCode",
        name: "Postal Code",
        type: "text",
        placeholder: "10001",
        required: true
      },
      {
        id: "addressCountry",
        name: "Country",
        type: "text",
        placeholder: "US",
        required: true
      },
      {
        id: "telephone",
        name: "Phone Number",
        type: "text",
        placeholder: "+1-212-555-1234",
        required: true
      },
      {
        id: "priceRange",
        name: "Price Range",
        type: "select",
        required: true,
        options: PRICE_RANGE_OPTIONS,
        defaultValue: "$$"
      },
      {
        id: "openingHours",
        name: "Opening Hours",
        type: "text",
        placeholder: "Mo-Fr 09:00-17:00",
        required: false,
        description: "Format: Mo-Fr 09:00-17:00, Sa 10:00-14:00"
      }
    ]
  },
  {
    id: "event",
    name: "Event",
    description: "For concerts, conferences, workshops, and events",
    icon: "CalendarDays",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-500/20 dark:bg-pink-500/10",
    popularity: 78,
    fields: [
      {
        id: "name",
        name: "Event Name",
        type: "text",
        placeholder: "Tech Conference 2025",
        required: true
      },
      {
        id: "description",
        name: "Description",
        type: "textarea",
        placeholder: "Join us for the biggest tech conference...",
        required: true
      },
      {
        id: "image",
        name: "Event Image URL",
        type: "url",
        placeholder: "https://example.com/event.jpg",
        required: false
      },
      {
        id: "startDate",
        name: "Start Date & Time",
        type: "text",
        placeholder: "2025-03-15T09:00",
        required: true,
        description: "Format: YYYY-MM-DDTHH:MM"
      },
      {
        id: "endDate",
        name: "End Date & Time",
        type: "text",
        placeholder: "2025-03-15T18:00",
        required: false
      },
      {
        id: "locationName",
        name: "Venue Name",
        type: "text",
        placeholder: "Convention Center",
        required: true
      },
      {
        id: "locationAddress",
        name: "Venue Address",
        type: "text",
        placeholder: "123 Event Street, City, State",
        required: true
      },
      {
        id: "performer",
        name: "Performer/Speaker",
        type: "text",
        placeholder: "John Smith",
        required: false
      },
      {
        id: "eventStatus",
        name: "Event Status",
        type: "select",
        required: true,
        options: [
          { value: "EventScheduled", label: "Scheduled" },
          { value: "EventPostponed", label: "Postponed" },
          { value: "EventCancelled", label: "Cancelled" },
          { value: "EventMovedOnline", label: "Moved Online" }
        ],
        defaultValue: "EventScheduled"
      },
      {
        id: "eventAttendanceMode",
        name: "Attendance Mode",
        type: "select",
        required: true,
        options: [
          { value: "OfflineEventAttendanceMode", label: "In-Person" },
          { value: "OnlineEventAttendanceMode", label: "Online" },
          { value: "MixedEventAttendanceMode", label: "Hybrid" }
        ],
        defaultValue: "OfflineEventAttendanceMode"
      },
      {
        id: "offerPrice",
        name: "Ticket Price",
        type: "number",
        placeholder: "99",
        required: false,
        min: 0
      },
      {
        id: "offerCurrency",
        name: "Currency",
        type: "select",
        required: false,
        options: CURRENCY_OPTIONS.slice(0, 4),
        defaultValue: "USD"
      },
      {
        id: "offerUrl",
        name: "Ticket URL",
        type: "url",
        placeholder: "https://example.com/tickets",
        required: false
      }
    ]
  },
  {
    id: "organization",
    name: "Organization",
    description: "For companies, non-profits, and organizations",
    icon: "Building2",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-500/20 dark:bg-slate-500/10",
    popularity: 75,
    fields: [
      {
        id: "name",
        name: "Organization Name",
        type: "text",
        placeholder: "Acme Corporation",
        required: true
      },
      {
        id: "description",
        name: "Description",
        type: "textarea",
        placeholder: "Leading provider of innovative solutions...",
        required: true
      },
      {
        id: "url",
        name: "Website URL",
        type: "url",
        placeholder: "https://example.com",
        required: true
      },
      {
        id: "logo",
        name: "Logo URL",
        type: "url",
        placeholder: "https://example.com/logo.png",
        required: true
      },
      {
        id: "email",
        name: "Contact Email",
        type: "text",
        placeholder: "contact@example.com",
        required: false
      },
      {
        id: "telephone",
        name: "Phone Number",
        type: "text",
        placeholder: "+1-800-555-1234",
        required: false
      },
      {
        id: "streetAddress",
        name: "Street Address",
        type: "text",
        placeholder: "123 Business Ave",
        required: false
      },
      {
        id: "addressLocality",
        name: "City",
        type: "text",
        placeholder: "San Francisco",
        required: false
      },
      {
        id: "addressRegion",
        name: "State/Region",
        type: "text",
        placeholder: "CA",
        required: false
      },
      {
        id: "postalCode",
        name: "Postal Code",
        type: "text",
        placeholder: "94102",
        required: false
      },
      {
        id: "addressCountry",
        name: "Country",
        type: "text",
        placeholder: "US",
        required: false
      },
      {
        id: "foundingDate",
        name: "Founding Date",
        type: "date",
        required: false
      },
      {
        id: "sameAs",
        name: "Social Media URLs",
        type: "array",
        required: false,
        arrayItemType: "text",
        description: "Add links to social profiles (LinkedIn, Twitter, etc.)"
      }
    ]
  },
  {
    id: "person",
    name: "Person",
    description: "For author pages, profiles, and about pages",
    icon: "User",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-500/20 dark:bg-teal-500/10",
    popularity: 68,
    fields: [
      {
        id: "name",
        name: "Full Name",
        type: "text",
        placeholder: "John Doe",
        required: true
      },
      {
        id: "description",
        name: "Bio",
        type: "textarea",
        placeholder: "John is a software engineer with 10+ years of experience...",
        required: false
      },
      {
        id: "image",
        name: "Profile Image URL",
        type: "url",
        placeholder: "https://example.com/profile.jpg",
        required: false
      },
      {
        id: "url",
        name: "Profile/Website URL",
        type: "url",
        placeholder: "https://example.com/john",
        required: false
      },
      {
        id: "email",
        name: "Email",
        type: "text",
        placeholder: "john@example.com",
        required: false
      },
      {
        id: "jobTitle",
        name: "Job Title",
        type: "text",
        placeholder: "Senior Software Engineer",
        required: false
      },
      {
        id: "worksFor",
        name: "Works For (Company)",
        type: "text",
        placeholder: "Acme Corporation",
        required: false
      },
      {
        id: "alumniOf",
        name: "Education (University)",
        type: "text",
        placeholder: "MIT",
        required: false
      },
      {
        id: "sameAs",
        name: "Social Media URLs",
        type: "array",
        required: false,
        arrayItemType: "text",
        description: "Add links to social profiles (LinkedIn, Twitter, GitHub, etc.)"
      }
    ]
  },
  {
    id: "course",
    name: "Course",
    description: "For online courses, tutorials, and educational content",
    icon: "GraduationCap",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-500/20 dark:bg-violet-500/10",
    popularity: 65,
    fields: [
      {
        id: "name",
        name: "Course Name",
        type: "text",
        placeholder: "Complete Web Development Bootcamp",
        required: true
      },
      {
        id: "description",
        name: "Description",
        type: "textarea",
        placeholder: "Learn web development from scratch...",
        required: true
      },
      {
        id: "provider",
        name: "Provider/Platform",
        type: "text",
        placeholder: "Udemy",
        required: true
      },
      {
        id: "providerUrl",
        name: "Provider URL",
        type: "url",
        placeholder: "https://udemy.com",
        required: false
      },
      {
        id: "instructor",
        name: "Instructor Name",
        type: "text",
        placeholder: "Jane Smith",
        required: false
      },
      {
        id: "courseUrl",
        name: "Course URL",
        type: "url",
        placeholder: "https://example.com/course/web-dev",
        required: true
      },
      {
        id: "image",
        name: "Course Image URL",
        type: "url",
        placeholder: "https://example.com/course-thumb.jpg",
        required: false
      },
      {
        id: "language",
        name: "Language",
        type: "text",
        placeholder: "English",
        required: false
      },
      {
        id: "duration",
        name: "Duration",
        type: "text",
        placeholder: "PT40H (40 hours)",
        required: false,
        description: "In ISO 8601 format (e.g., PT40H for 40 hours)"
      },
      {
        id: "price",
        name: "Price",
        type: "number",
        placeholder: "99",
        required: false,
        min: 0
      },
      {
        id: "priceCurrency",
        name: "Currency",
        type: "select",
        required: false,
        options: CURRENCY_OPTIONS.slice(0, 4),
        defaultValue: "USD"
      },
      {
        id: "ratingValue",
        name: "Rating",
        type: "rating",
        required: false,
        min: 1,
        max: 5
      },
      {
        id: "reviewCount",
        name: "Review Count",
        type: "number",
        placeholder: "1500",
        required: false,
        min: 0
      }
    ]
  },
  {
    id: "jobposting",
    name: "Job Posting",
    description: "For job listings and career opportunities",
    icon: "Briefcase",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/20 dark:bg-emerald-500/10",
    popularity: 72,
    fields: [
      {
        id: "title",
        name: "Job Title",
        type: "text",
        placeholder: "Senior Software Engineer",
        required: true
      },
      {
        id: "description",
        name: "Job Description",
        type: "textarea",
        placeholder: "We are looking for an experienced engineer...",
        required: true
      },
      {
        id: "hiringOrganization",
        name: "Company Name",
        type: "text",
        placeholder: "Acme Corporation",
        required: true
      },
      {
        id: "companyLogo",
        name: "Company Logo URL",
        type: "url",
        placeholder: "https://example.com/logo.png",
        required: false
      },
      {
        id: "companyUrl",
        name: "Company Website",
        type: "url",
        placeholder: "https://example.com",
        required: false
      },
      {
        id: "datePosted",
        name: "Date Posted",
        type: "date",
        required: true
      },
      {
        id: "validThrough",
        name: "Application Deadline",
        type: "date",
        required: false
      },
      {
        id: "employmentType",
        name: "Employment Type",
        type: "select",
        required: true,
        options: [
          { value: "FULL_TIME", label: "Full Time" },
          { value: "PART_TIME", label: "Part Time" },
          { value: "CONTRACT", label: "Contract" },
          { value: "TEMPORARY", label: "Temporary" },
          { value: "INTERN", label: "Internship" }
        ],
        defaultValue: "FULL_TIME"
      },
      {
        id: "workLocationType",
        name: "Work Location Type",
        type: "select",
        required: true,
        options: [
          { value: "TELECOMMUTE", label: "Remote" },
          { value: "", label: "On-site" }
        ],
        defaultValue: ""
      },
      {
        id: "jobLocationCity",
        name: "Job Location (City)",
        type: "text",
        placeholder: "San Francisco",
        required: true
      },
      {
        id: "jobLocationRegion",
        name: "State/Region",
        type: "text",
        placeholder: "CA",
        required: true
      },
      {
        id: "jobLocationCountry",
        name: "Country",
        type: "text",
        placeholder: "US",
        required: true
      },
      {
        id: "salaryMin",
        name: "Salary Min",
        type: "number",
        placeholder: "80000",
        required: false,
        min: 0
      },
      {
        id: "salaryMax",
        name: "Salary Max",
        type: "number",
        placeholder: "120000",
        required: false,
        min: 0
      },
      {
        id: "salaryCurrency",
        name: "Salary Currency",
        type: "select",
        required: false,
        options: CURRENCY_OPTIONS.slice(0, 4),
        defaultValue: "USD"
      },
      {
        id: "salaryUnit",
        name: "Salary Unit",
        type: "select",
        required: false,
        options: [
          { value: "YEAR", label: "Per Year" },
          { value: "MONTH", label: "Per Month" },
          { value: "HOUR", label: "Per Hour" }
        ],
        defaultValue: "YEAR"
      }
    ]
  }
]
