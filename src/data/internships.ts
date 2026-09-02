export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  duration: string;
  stipend: string;
  description: string;
  requirements: string[];
  skills: string[];
  openings: number;
  deadline: string;
  featured?: boolean;
  logo?: string;
}

export const internships: Internship[] = [
  {
    id: "db-dev-intern-1",
    title: "Oracle Database Developer Intern",
    company: "DataFlow Solutions",
    location: "Remote",
    type: "Remote",
    duration: "3 months",
    stipend: "$2,500/month",
    description: "Work on real enterprise database projects, developing stored procedures, functions, and optimizing queries for a fintech platform serving 2M+ users.",
    requirements: [
      "Strong SQL & PL/SQL knowledge",
      "Basic understanding of database design",
      "Problem-solving mindset",
      "Available 20+ hours/week"
    ],
    skills: ["SQL", "PL/SQL", "Oracle 19c", "Git"],
    openings: 4,
    deadline: "July 15, 2025",
    featured: true
  },
  {
    id: "plsql-eng-intern-2",
    title: "PL/SQL Engineer Intern",
    company: "Oracle Systems Inc.",
    location: "Austin, TX",
    type: "Hybrid",
    duration: "6 months",
    stipend: "$3,200/month",
    description: "Join the core database team at Oracle. Contribute to package development, API design, and performance optimization for Oracle Cloud Infrastructure services.",
    requirements: [
      "Completed PL/SQL coursework or equivalent",
      "Understanding of Oracle architecture",
      "Familiarity with Linux environments",
      "Pursuing CS/IT/related degree"
    ],
    skills: ["PL/SQL", "Oracle Cloud", "Linux", "Performance Tuning"],
    openings: 2,
    deadline: "June 30, 2025",
    featured: true
  },
  {
    id: "apex-dev-intern-3",
    title: "Oracle APEX Developer Intern",
    company: "AppNexus Technologies",
    location: "Remote",
    type: "Remote",
    duration: "4 months",
    stipend: "$2,200/month",
    description: "Build low-code enterprise applications for healthcare clients. Work on dashboards, reporting modules, and interactive data entry forms using Oracle APEX.",
    requirements: [
      "Knowledge of Oracle APEX or similar low-code platforms",
      "HTML/CSS/JavaScript basics",
      "SQL proficiency required",
      "Portfolio or project examples preferred"
    ],
    skills: ["Oracle APEX", "SQL", "JavaScript", "REST APIs"],
    openings: 3,
    deadline: "August 1, 2025"
  },
  {
    id: "dba-intern-4",
    title: "Junior Oracle DBA Intern",
    company: "GlobalBank Financial",
    location: "New York, NY",
    type: "On-site",
    duration: "6 months",
    stipend: "$3,500/month",
    description: "Learn enterprise database administration from senior DBAs. Monitor production databases, assist with backup procedures, and contribute to migration projects.",
    requirements: [
      "Oracle SQL/PL-SQL certification or equivalent experience",
      "Basic Linux command-line knowledge",
      "Strong attention to detail",
      "Willingness to work on-call rotations"
    ],
    skills: ["Oracle DBA", "Linux", "Backup/Recovery", "Shell Scripting"],
    openings: 2,
    deadline: "July 20, 2025"
  },
  {
    id: "data-analyst-intern-5",
    title: "SQL Data Analyst Intern",
    company: "RetailMax Analytics",
    location: "Chicago, IL",
    type: "Hybrid",
    duration: "3 months",
    stipend: "$2,800/month",
    description: "Analyze retail sales data using advanced SQL techniques. Create reports, dashboards, and predictive models to support business decision-making across 500+ stores.",
    requirements: [
      "Advanced SQL & window functions knowledge",
      "Data visualization interest",
      "Statistical thinking",
      "Business acumen"
    ],
    skills: ["SQL", "Analytics", "Oracle BI", "Excel/Python"],
    openings: 5,
    deadline: "August 15, 2025"
  },
  {
    id: "etl-dev-intern-6",
    title: "ETL/Database Integration Intern",
    company: "CloudSync Data",
    location: "Remote",
    type: "Remote",
    duration: "4 months",
    stipend: "$2,600/month",
    description: "Design and implement data pipelines between Oracle databases and cloud data warehouses. Work with Oracle Data Integrator and modern cloud ETL tools.",
    requirements: [
      "SQL & PL/SQL strong foundation",
      "Interest in data engineering",
      "Cloud concepts (AWS/Azure/GCP)",
      "Python or Java basics"
    ],
    skills: ["SQL", "PL/SQL", "ETL", "Oracle Data Integrator", "Python"],
    openings: 3,
    deadline: "September 1, 2025"
  }
];

export const featuredInternships = internships.filter(i => i.featured);
