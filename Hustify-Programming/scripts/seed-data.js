// Using CommonJS module syntax instead of ES modules
const admin = require("firebase-admin");
const serviceAccount = require("../service-account.json"); // Path to your service account file

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function seedDatabase() {
  try {
    // Add companies
    const companies = [
      {
        name: "FPT Software",
        logo: "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/companies%2Ffpt.png?alt=media",
        description:
          "On Upwork you'll find a range of top freelancers and agencies, from developers and development agencies to designers and creative agencies, copywriters.",
        followers: 3636,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: "Google LLC",
        logo: "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/companies%2Fgoogle.png?alt=media",
        description:
          "Google is a multinational technology company specializing in Internet-related services and products.",
        followers: 12500000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: "Microsoft Corporation",
        logo: "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/companies%2Fmicrosoft.png?alt=media",
        description:
          "Microsoft Corporation is an American multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, and related services.",
        followers: 11000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log("Adding companies...");

    const companyRefs = [];
    const companyIds = [];

    for (const company of companies) {
      const companyRef = db.collection("companies").doc();
      companyRefs.push({ ref: companyRef, data: company });
      companyIds.push(companyRef.id);
    }

    // Write all companies
    await Promise.all(companyRefs.map((item) => item.ref.set(item.data)));
    console.log("Companies added successfully!");

    // Add jobs with references to the companies
    const jobs = [
      {
        title: "UX/UI Designer",
        location: "Ha Noi, Viet Nam",
        companyId: companyIds[0], // FPT Software
        description:
          "We are looking for a UX/UI Designer to turn our software into easy-to-use products for our clients. The ideal candidate should have experience designing highly-responsive and elegant user experiences for enterprise applications.",
        responsibilities: [
          "Manage and monitor TDRM to ensure technology and digital risks are managed and mitigated within risk limit",
          "Implement and monitor TDRM programs and activities to manage technology and digital risks",
          "Develop TDRM policies, standards, regulations, procedures and methodologies, risk taxonomies and respective mitigation controls",
          "Support and participate in Technology via Digital innovation and implementation",
          "Improve bankwide TDRM awareness and culture",
        ],
        requirements: [
          "3+ years of experience in UX/UI design",
          "Strong portfolio demonstrating UX thinking and UI skills",
          "Proficiency with Figma, Adobe XD, or similar tools",
          "Experience working in agile development environments",
          "Excellent communication and collaboration skills",
        ],
        benefits: ["Medical insurance", "High salary", "Vacation per year"],
        recruitmentUrl: "https://www.linkedin.com/jobs/view/3782845123",
        postedDate: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day ago
        applicantCount: 36,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Senior Frontend Developer",
        location: "San Francisco, CA",
        companyId: companyIds[1], // Google
        description:
          "We're looking for a Senior Frontend Developer who is passionate about building great user experiences. You'll be responsible for developing and maintaining web applications that are used by millions of people worldwide.",
        responsibilities: [
          "Develop and maintain front-end web applications using React and TypeScript",
          "Collaborate with UX designers to implement intuitive user interfaces",
          "Optimize applications for maximum speed and scalability",
          "Participate in code reviews and mentor junior developers",
        ],
        requirements: [
          "5+ years of experience with JavaScript/TypeScript",
          "Expert knowledge of React, Redux, and modern frontend frameworks",
          "Experience with responsive design and cross-browser compatibility",
          "Strong problem-solving skills and attention to detail",
        ],
        benefits: [
          "Competitive salary and stock options",
          "Comprehensive health insurance",
          "Flexible work arrangements",
          "Generous vacation policy",
          "401(k) matching",
        ],
        recruitmentUrl: "https://www.linkedin.com/jobs/view/3782845123/",
        postedDate: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(), // 3 days ago
        applicantCount: 142,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Backend Engineer",
        location: "New York, NY",
        companyId: companyIds[2], // Microsoft
        description:
          "Join our team to build scalable backend services that power our cloud products. You'll work on designing and implementing APIs, optimizing database performance, and ensuring high availability of our services.",
        responsibilities: [
          "Design, develop, and maintain backend services in Node.js/C#",
          "Create and optimize database schemas and queries",
          "Implement security and data protection measures",
          "Collaborate with frontend engineers to integrate user-facing elements",
        ],
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          "4+ years of experience in backend development",
          "Strong knowledge of Node.js, C#, or similar technologies",
          "Experience with SQL and NoSQL databases",
          "Understanding of cloud services (Azure preferred)",
        ],
        benefits: [
          "Excellent health benefits",
          "Competitive compensation package",
          "Generous parental leave",
          "Continuous learning opportunities",
          "Modern office with amenities",
        ],
        // No recruitmentUrl for this job - will use internal application
        postedDate: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(), // 5 days ago
        applicantCount: 87,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Machine Learning Engineer",
        location: "Remote",
        companyId: companyIds[1], // Google
        description:
          "Join our AI team to develop cutting-edge machine learning models that power next-generation products. You'll work with large datasets and state-of-the-art ML frameworks to solve complex problems.",
        responsibilities: [
          "Design and implement machine learning algorithms",
          "Train and fine-tune models for specific applications",
          "Collaborate with product teams to integrate ML solutions",
          "Stay current with latest ML research and techniques",
        ],
        requirements: [
          "MS or PhD in Computer Science, Machine Learning, or related field",
          "3+ years experience building ML models",
          "Proficiency with TensorFlow, PyTorch, or similar frameworks",
          "Strong programming skills in Python",
          "Experience with large-scale data processing",
        ],
        benefits: [
          "Competitive salary and equity package",
          "Premium healthcare coverage",
          "Flexible remote work policy",
          "Learning and development budget",
          "Generous vacation and parental leave",
        ],
        recruitmentUrl: "https://www.linkedin.com/jobs/view/3782845123/",
        postedDate: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
        applicantCount: 103,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Product Manager",
        location: "Seattle, WA",
        companyId: companyIds[2], // Microsoft
        description:
          "We're looking for a product manager to help define and execute our product vision. You'll work closely with engineering, design, and marketing teams to deliver features that delight our users.",
        responsibilities: [
          "Define product strategy and roadmap",
          "Gather and prioritize product requirements",
          "Work with UX/UI teams to create intuitive user experiences",
          "Analyze market trends and competitive landscape",
        ],
        requirements: [
          "5+ years of product management experience",
          "Strong understanding of technology products",
          "Excellent communication and leadership skills",
          "Data-driven decision making experience",
          "Bachelor's degree in relevant field",
        ],
        benefits: [
          "Competitive base salary plus bonus",
          "Comprehensive benefits package",
          "Stock options",
          "Professional development opportunities",
          "Work-life balance focus",
        ],
        recruitmentUrl:
          "https://jobs.careers.microsoft.com/global/en/job/1827424/Applied-Scientist-II",
        postedDate: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days ago
        applicantCount: 78,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Cyber Security Penatration tester",
        location: "Ha Noi, Viet Nam",
        companyId: companyIds[0], // FPT Software
        description: "As a Cyber Security Intern, you will assist the Information Security team in monitoring, analyzing, and responding to cybersecurity incidents. You'll gain hands-on experience with security tools, vulnerability assessment, and participate in real-world threat detection and prevention activities.",
        responsibilities: [
          "A Junior Penetration Tester is expected to have a solid understanding of networking fundamentals, operating systems (especially Linux and Windows), and web technologies such as HTTP, HTML, and APIs. They should be familiar with common vulnerabilities like those listed in the OWASP Top 10, as well as basic exploitation techniques and misconfigurations. Hands-on experience with tools such as Nmap, Burp Suite, Metasploit, and Wireshark is essential, often gained through labs, CTFs, or platforms like TryHackMe and HackTheBox. Junior testers should be able to document and report their findings clearly, including technical details and remediation recommendations. While certifications like eJPT, Security+, or CEH are not always required, they are valuable for demonstrating foundational knowledge. Strong analytical thinking, attention to detail, and a curious, ethical mindset are crucial. Communication skills are also important for explaining security issues to technical and non-technical audiences. A willingness to learn and adapt is key, as the cybersecurity landscape evolves rapidly."
        ],
        requirements: [
"A Junior Penetration Tester is expected to have a solid understanding of networking fundamentals, operating systems (especially Linux and Windows), and web technologies such as HTTP, HTML, and APIs. They should be familiar with common vulnerabilities like those listed in the OWASP Top 10, as well as basic exploitation techniques and misconfigurations. Hands-on experience with tools such as Nmap, Burp Suite, Metasploit, and Wireshark is essential, often gained through labs, CTFs, or platforms like TryHackMe and HackTheBox. Junior testers should be able to document and report their findings clearly, including technical details and remediation recommendations. While certifications like eJPT, Security+, or CEH are not always required, they are valuable for demonstrating foundational knowledge. Strong analytical thinking, attention to detail, and a curious, ethical mindset are crucial. Communication skills are also important for explaining security issues to technical and non-technical audiences. A willingness to learn and adapt is key, as the cybersecurity landscape evolves rapidly."

        ],
        benefits: [
          "Cơ hội học hỏi và phát triển trong lĩnh vực an ninh mạng",
          "Được đào tạo chuyên sâu về bảo mật",
          "Môi trường làm việc chuyên nghiệp",
          "Mentor hỗ trợ trực tiếp",
          "Cơ hội được nhận vào làm chính thức sau thực tập"
        ],
        postedDate: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day ago
        applicantCount: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log("Adding jobs...");

    const jobRefs = [];

    for (const job of jobs) {
      const jobRef = db.collection("jobs").doc();
      jobRefs.push({ ref: jobRef, data: job });
    }

    // Write all jobs
    await Promise.all(jobRefs.map((item) => item.ref.set(item.data)));
    console.log("Jobs added successfully!");

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
