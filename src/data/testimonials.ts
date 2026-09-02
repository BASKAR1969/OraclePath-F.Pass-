export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  course?: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Database Developer",
    company: "JPMorgan Chase",
    content: "The Oracle SQL Fundamentals course completely transformed my career. I went from struggling with basic queries to writing complex analytical SQL that powers our trading dashboards. The real-world projects were game-changers.",
    rating: 5,
    course: "Oracle SQL Fundamentals"
  },
  {
    id: "2",
    name: "David Park",
    role: "Senior PL/SQL Developer",
    company: "Wells Fargo",
    content: "I thought I knew PL/SQL until I took the Masterclass. The instructor's deep dive into packages, performance optimization, and advanced cursor techniques gave me skills I use daily. Worth every penny.",
    rating: 5,
    course: "PL/SQL Programming Masterclass"
  },
  {
    id: "3",
    name: "Priya Sharma",
    role: "Data Analyst",
    company: "Amazon",
    content: "The SQL Analytics course helped me land my dream job at Amazon. The window functions and pattern matching sections were incredibly practical. I now lead analytics projects that drive million-dollar decisions.",
    rating: 5,
    course: "SQL for Data Analytics"
  },
  {
    id: "4",
    name: "Michael Torres",
    role: "Oracle DBA",
    company: "Verizon",
    content: "The DBA Essentials course covered everything I needed and more. From RAC configuration to Data Guard setup, the hands-on labs prepared me for real enterprise environments. Got certified within 2 months.",
    rating: 5,
    course: "Oracle DBA Essentials"
  },
  {
    id: "5",
    name: "Emily Chen",
    role: "APEX Developer",
    company: "Oracle",
    content: "OraclePath's APEX course is the best I've found. I built a full HR management system as my capstone project and it directly led to my internship offer at Oracle. The low-code approach is powerful when taught right.",
    rating: 5,
    course: "Oracle APEX Development"
  },
  {
    id: "6",
    name: "James Wilson",
    role: "Performance Engineer",
    company: "Goldman Sachs",
    content: "The SQL Tuning course saved my team hours of query optimization work. The systematic approach to analyzing execution plans and applying hints is something I now teach to junior developers.",
    rating: 5,
    course: "Advanced SQL Tuning"
  }
];
