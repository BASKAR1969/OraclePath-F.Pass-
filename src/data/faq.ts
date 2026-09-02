export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = ['General', 'Courses', 'Internships', 'Payments', 'Platform', 'Certificates'];

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'What is OraclePath and who owns it?',
    answer: 'OraclePath is a specialized learning platform under Ervion Technologies, dedicated exclusively to Oracle SQL and PL/SQL education. We offer expert-led courses, hands-on labs, and guaranteed internship pathways for aspiring Oracle database professionals.',
    category: 'General',
  },
  {
    id: '2',
    question: 'Why does OraclePath focus only on Oracle SQL and PL/SQL?',
    answer: 'Oracle is the world\'s most widely deployed enterprise database. Unlike general programming platforms, OraclePath specializes exclusively in Oracle technologies because we believe depth beats breadth. Our instructors are Oracle ACEs, architects, and certified experts who live and breathe Oracle databases.',
    category: 'General',
  },
  {
    id: '3',
    question: 'How do I enroll in a course?',
    answer: 'Browse our Courses page, select the course you want, click "Enroll Now," and complete the secure checkout. Once enrolled, you get immediate lifetime access to all course materials, labs, and community resources.',
    category: 'Courses',
  },
  {
    id: '4',
    question: 'Do I need prior database experience?',
    answer: 'Not for our beginner courses. "Oracle SQL Fundamentals" assumes zero prior knowledge. For intermediate and advanced courses, we recommend completing the prerequisite courses or having equivalent real-world experience.',
    category: 'Courses',
  },
  {
    id: '5',
    question: 'How do the hands-on labs work?',
    answer: 'Every course includes interactive SQL sandboxes running real Oracle 19c databases. You write, execute, and debug queries directly in your browser. No local installation required. Your progress is saved automatically.',
    category: 'Courses',
  },
  {
    id: '6',
    question: 'How does the internship program work?',
    answer: 'Top-performing students (80%+ course completion and instructor recommendation) are eligible for guaranteed internship placements with our 50+ partner companies. We match your skills to available positions. Applications open through your student dashboard.',
    category: 'Internships',
  },
  {
    id: '7',
    question: 'Are internships paid?',
    answer: 'Yes, all internships listed on OraclePath are paid positions. Stipends range from $2,200 to $3,500 per month depending on the role, company, and location. Remote and hybrid options are available.',
    category: 'Internships',
  },
  {
    id: '8',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise purchases. All payments are processed through secure, PCI-compliant payment gateways.',
    category: 'Payments',
  },
  {
    id: '9',
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 14-day no-questions-asked refund policy for all courses. If you are not satisfied, contact support within 14 days of enrollment for a full refund. Refunds are processed within 5-7 business days.',
    category: 'Payments',
  },
  {
    id: '10',
    question: 'How do I access the student dashboard?',
    answer: 'After logging in, click your profile avatar in the navigation bar and select "Dashboard." The student dashboard shows your enrolled courses, progress, internship applications, certificates, and payment history.',
    category: 'Platform',
  },
  {
    id: '11',
    question: 'Can I download course materials for offline use?',
    answer: 'Yes, all video lectures, PDF guides, and code repositories are downloadable. Labs require an internet connection since they run on our cloud Oracle instances. Course updates are included free for life.',
    category: 'Platform',
  },
  {
    id: '12',
    question: 'Do you issue certificates?',
    answer: 'Yes, upon completing a course with 100% progress, you receive a verified digital certificate with a unique certificate number. Certificates are issued by OraclePath (Ervion Technologies) and can be shared on LinkedIn and verified by employers.',
    category: 'Certificates',
  },
  {
    id: '13',
    question: 'Do you help with Oracle certification exams?',
    answer: 'Absolutely. Our courses are designed to prepare you for Oracle certification exams (1Z0-071, 1Z0-149, etc.). We provide mock exams, study guides, and instructor-led review sessions. Many students pass on their first attempt.',
    category: 'Certificates',
  },
  {
    id: '14',
    question: 'Is there a community for students?',
    answer: 'Yes, all students get access to our private community forum and Discord server. Network with peers, join study groups, get help from mentors, and find job leads. The community is moderated by OraclePath instructors.',
    category: 'Platform',
  },
  {
    id: '15',
    question: 'Can my company purchase training for a team?',
    answer: 'Yes, we offer enterprise training packages. Contact our enterprise team at enterprise@oraclepath.com or through the Contact page for custom pricing, dedicated support, and private cohort scheduling.',
    category: 'General',
  },
];
