export interface Resource {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  featured?: boolean;
}

export const resourceCategories = ['SQL Tips', 'PL/SQL', 'Performance', 'Career', 'News', 'Tutorials'];

export const resources: Resource[] = [
  {
    id: '1',
    title: '10 Advanced SQL Window Functions Every Oracle Developer Should Know',
    excerpt: 'Window functions are the most powerful feature in Oracle SQL. Learn how to use ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, and more for real-world analytics.',
    content: 'Window functions allow you to perform calculations across a set of rows related to the current row. Unlike aggregate functions, they do not collapse rows. Use the OVER() clause to define the window. ROW_NUMBER() assigns a unique number to each row. RANK() and DENSE_RANK() handle ties differently. LEAD() and LAG() let you access data from other rows without self-joins. FIRST_VALUE and LAST_VALUE return the first and last values in a window. PERCENT_RANK and CUME_DIST calculate distribution percentages. These functions are essential for time-series analysis, running totals, and cohort analysis.',
    category: 'SQL Tips',
    author: 'Dr. Maria Chen',
    readTime: '8 min',
    publishedAt: '2025-05-15',
    tags: ['Window Functions', 'SQL', 'Analytics'],
    featured: true,
  },
  {
    id: '2',
    title: 'PL/SQL Package Design: Best Practices from Oracle Architects',
    excerpt: 'Learn how to structure PL/SQL packages for maintainability, performance, and security from engineers who have built Oracle Cloud infrastructure.',
    content: 'PL/SQL packages are the cornerstone of modular Oracle development. Group related procedures and functions together. Use the package specification for the public interface and the body for implementation. Initialize packages with a dedicated procedure. Handle exceptions consistently using a centralized error logging table. Use cursor variables for flexible data retrieval. Implement pipelined functions for large datasets. These practices ensure your code scales from development to production.',
    category: 'PL/SQL',
    author: "James O'Connell",
    readTime: '12 min',
    publishedAt: '2025-05-10',
    tags: ['PL/SQL', 'Packages', 'Architecture'],
  },
  {
    id: '3',
    title: 'Execution Plan Deep Dive: How the Oracle Optimizer Works',
    excerpt: 'Understanding execution plans is the key to SQL performance tuning. This article explains every operation you will see in an EXPLAIN PLAN output.',
    content: 'The Oracle optimizer evaluates multiple execution plans and chooses the one with the lowest estimated cost. An execution plan shows operations like TABLE ACCESS FULL, INDEX RANGE SCAN, NESTED LOOPS, HASH JOIN, SORT, and FILTER. Each operation has a cost calculated from I/O, CPU, and network estimates. Cardinality estimates are critical. Wrong estimates lead to suboptimal plans. Use DBMS_XPLAN.DISPLAY_CURSOR to see the actual plan. Use SQL Monitoring for real-time insights.',
    category: 'Performance',
    author: 'Rajesh Patel',
    readTime: '15 min',
    publishedAt: '2025-05-05',
    tags: ['Performance', 'Tuning', 'Execution Plans'],
    featured: true,
  },
  {
    id: '4',
    title: 'From Bootcamp to Oracle DBA: A Career Roadmap',
    excerpt: 'A step-by-step guide for transitioning into Oracle database administration, including certifications, skills, and salary expectations.',
    content: 'The path to becoming an Oracle DBA starts with mastering SQL and PL/SQL fundamentals. Get hands-on with Oracle XE or Docker containers. Pursue Oracle certifications starting with 1Z0-071. Learn Linux administration basics. Practice backup and recovery scenarios. Understand RAC and Data Guard architecture. Network at Oracle conferences and user groups. Entry-level DBAs earn $70K-$90K. Senior DBAs with cloud expertise earn $150K+.',
    category: 'Career',
    author: 'Ahmed Hassan',
    readTime: '10 min',
    publishedAt: '2025-04-28',
    tags: ['Career', 'DBA', 'Certification'],
  },
  {
    id: '5',
    title: 'Oracle Autonomous Database: What Developers Need to Know',
    excerpt: 'Oracle\'s cloud-native autonomous database is changing how developers work. Here is what you need to know to stay relevant.',
    content: 'Oracle Autonomous Database handles tuning, patching, backup, and scaling automatically. Developers can focus on application logic. It supports both OLTP and data warehouse workloads. Integration with Oracle Cloud Infrastructure is seamless. Use REST APIs for database access. Machine learning capabilities are built-in. The Always Free tier lets developers experiment without cost.',
    category: 'News',
    author: 'Lisa Zhang',
    readTime: '7 min',
    publishedAt: '2025-04-20',
    tags: ['Autonomous DB', 'Cloud', 'Oracle'],
  },
  {
    id: '6',
    title: 'Building a Real-Time Analytics Dashboard with Oracle SQL and APEX',
    excerpt: 'Step-by-step tutorial for creating a live analytics dashboard using Oracle analytic SQL and Oracle APEX low-code platform.',
    content: 'Combine Oracle SQL analytic functions with APEX interactive grids to build powerful dashboards. Start with a data model optimized for analytics. Use materialized views for pre-aggregated data. Create APEX pages with dynamic SQL regions. Use AJAX for real-time updates. Add charts using Oracle JET or AnyChart. The result is a production-ready dashboard with zero JavaScript coding.',
    category: 'Tutorials',
    author: 'Dr. Maria Chen',
    readTime: '20 min',
    publishedAt: '2025-04-15',
    tags: ['APEX', 'Analytics', 'Tutorial'],
  },
];
