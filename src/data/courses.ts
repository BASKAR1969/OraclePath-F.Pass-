export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  price: number;
  originalPrice?: number;
  tags: string[];
  topics: string[];
  instructor: string;
  instructorRole: string;
  featured?: boolean;
}

export const courses: Course[] = [
  {
    id: "oracle-sql-fundamentals",
    title: "Oracle SQL Fundamentals",
    subtitle: "From Zero to Hero in Database Querying",
    description: "Master the art of querying Oracle databases with hands-on projects. Learn SELECT, JOIN, subqueries, aggregation, and more through real-world scenarios used by Fortune 500 companies.",
    level: "Beginner",
    duration: "8 weeks",
    lessons: 64,
    rating: 4.9,
    students: 3840,
    price: 199,
    originalPrice: 349,
    tags: ["SQL", "Database", "Querying"],
    topics: [
      "SELECT statements & filtering",
      "JOINs and set operations",
      "Aggregate functions & GROUP BY",
      "Subqueries & correlated queries",
      "Data manipulation (DML)",
      "DDL & schema design"
    ],
    instructor: "Dr. Maria Chen",
    instructorRole: "Oracle ACE Director, 20+ years experience",
    featured: true
  },
  {
    id: "plsql-programming",
    title: "PL/SQL Programming Masterclass",
    subtitle: "Build Powerful Database Applications",
    description: "Unlock the full power of Oracle's procedural language. Create stored procedures, functions, triggers, and packages that automate complex business logic directly in the database.",
    level: "Intermediate",
    duration: "10 weeks",
    lessons: 80,
    rating: 4.8,
    students: 2150,
    price: 249,
    originalPrice: 399,
    tags: ["PL/SQL", "Procedural", "Development"],
    topics: [
      "PL/SQL block structure & variables",
      "Control structures & loops",
      "Cursors & cursor variables",
      "Stored procedures & functions",
      "Database triggers",
      "Packages & modular design",
      "Exception handling & debugging"
    ],
    instructor: "James O'Connell",
    instructorRole: "Senior Oracle Architect at Oracle Corp",
    featured: true
  },
  {
    id: "advanced-sql-tuning",
    title: "Advanced SQL Tuning & Optimization",
    subtitle: "Make Your Queries Lightning Fast",
    description: "Stop slow queries from killing your application performance. Learn execution plans, indexing strategies, hints, partitioning, and the optimizer from an Oracle performance specialist.",
    level: "Advanced",
    duration: "6 weeks",
    lessons: 48,
    rating: 4.9,
    students: 1280,
    price: 299,
    originalPrice: 449,
    tags: ["Performance", "Optimization", "Tuning"],
    topics: [
      "Execution plan analysis",
      "Index design & optimization",
      "Query rewrite techniques",
      "Partitioning strategies",
      "Optimizer statistics & hints",
      "Real-world case studies"
    ],
    instructor: "Rajesh Patel",
    instructorRole: "Oracle Performance Tuning Expert"
  },
  {
    id: "oracle-apex-development",
    title: "Oracle APEX Low-Code Development",
    subtitle: "Build Web Apps Without Traditional Coding",
    description: "Create enterprise web applications in record time using Oracle APEX. Learn to build interactive reports, forms, charts, and dashboards with minimal code and maximum impact.",
    level: "Intermediate",
    duration: "8 weeks",
    lessons: 56,
    rating: 4.7,
    students: 1650,
    price: 229,
    originalPrice: 379,
    tags: ["APEX", "Low-Code", "Web Apps"],
    topics: [
      "APEX architecture & setup",
      "Interactive grids & reports",
      "Dynamic actions & validations",
      "REST APIs & integration",
      "Authentication & authorization",
      "Deployment & production"
    ],
    instructor: "Lisa Zhang",
    instructorRole: "Oracle APEX Product Champion"
  },
  {
    id: "database-administration",
    title: "Oracle DBA Essentials",
    subtitle: "Master Database Administration",
    description: "Learn to install, configure, secure, and maintain Oracle databases. Covers backup/recovery, user management, RAC, Data Guard, and cloud deployment strategies.",
    level: "Intermediate",
    duration: "12 weeks",
    lessons: 96,
    rating: 4.8,
    students: 980,
    price: 349,
    originalPrice: 499,
    tags: ["DBA", "Administration", "Infrastructure"],
    topics: [
      "Database installation & configuration",
      "User & privilege management",
      "Backup & recovery strategies",
      "RAC & Data Guard",
      "Performance monitoring",
      "Cloud & Autonomous Database"
    ],
    instructor: "Ahmed Hassan",
    instructorRole: "Principal Oracle DBA, AWS Certified"
  },
  {
    id: "sql-for-data-analytics",
    title: "SQL for Data Analytics",
    subtitle: "Transform Data into Insights",
    description: "Leverage Oracle's powerful analytic functions to solve complex business problems. Learn window functions, pattern matching, pivoting, and time-series analysis with practical datasets.",
    level: "Intermediate",
    duration: "6 weeks",
    lessons: 42,
    rating: 4.8,
    students: 1890,
    price: 189,
    originalPrice: 299,
    tags: ["Analytics", "Window Functions", "BI"],
    topics: [
      "Window functions & OVER clause",
      "Running totals & moving averages",
      "Rank, dense_rank, & ntile",
      "Pivot & unpivot operations",
      "Pattern matching (MATCH_RECOGNIZE)",
      "Time-series & trend analysis"
    ],
    instructor: "Dr. Maria Chen",
    instructorRole: "Oracle ACE Director, 20+ years experience"
  }
];

export const featuredCourses = courses.filter(c => c.featured);
