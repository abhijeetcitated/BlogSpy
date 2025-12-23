// JobPosting Schema Generator

/**
 * Generate JSON-LD for JobPosting schema
 */
export function generateJobPostingSchema(data: Record<string, unknown>): object {
  const hiringOrganization: Record<string, unknown> = {
    "@type": "Organization",
    "name": data.hiringOrganization,
  }
  if (data.companyLogo) hiringOrganization["logo"] = data.companyLogo
  if (data.companyUrl) hiringOrganization["sameAs"] = data.companyUrl
  
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": data.title,
    "description": data.description,
    "datePosted": data.datePosted,
    "hiringOrganization": hiringOrganization,
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": data.jobLocationCity,
        "addressRegion": data.jobLocationRegion,
        "addressCountry": data.jobLocationCountry
      }
    },
    "employmentType": data.employmentType
  }

  if (data.validThrough) schema.validThrough = data.validThrough
  if (data.workLocationType === "TELECOMMUTE") {
    schema.jobLocationType = "TELECOMMUTE"
  }

  if (data.salaryMin || data.salaryMax) {
    const salaryValue: Record<string, unknown> = {
      "@type": "QuantitativeValue",
      "unitText": data.salaryUnit || "YEAR"
    }
    if (data.salaryMin) salaryValue["minValue"] = data.salaryMin
    if (data.salaryMax) salaryValue["maxValue"] = data.salaryMax
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": data.salaryCurrency || "USD",
      "value": salaryValue
    }
  }

  return schema
}
