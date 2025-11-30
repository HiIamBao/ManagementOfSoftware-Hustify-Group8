// Using CommonJS module syntax instead of ES modules
const admin = require("firebase-admin");
const serviceAccount = require("../service-account.json"); // Path to your service account file

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function seedRoadmap() {
  try {
    const roadmaps = [
      {
        name: "Frontend",
        tips: ["Design thinking enhances UI/UX."],
        nodes: [
          {
            name: "HTML",
            content: "HTML structures the content of web pages.",
            links: "https://udemy.com",
          },
          {
            name: "CSS",
            content: "CSS styles the visual layout and design.",
            links: "https://udemy.com",
          },
          {
            name: "JavaScript",
            content: "JavaScript adds interactivity to the page.",
            links: "https://udemy.com",
          },
          {
            name: "React",
            content: "React is a popular library for building UI components.",
            links: "https://udemy.com",
          },
          {
            name: "Responsive Design",
            content: "Ensure your app works on all screen sizes.",
            links: "https://udemy.com",
          },
          {
            name: "Version Control (Git)",
            content: "Use Git to manage code changes effectively.",
            links: "https://udemy.com",
          },
        ],
      },
      {
        name: "Backend",
        tips: ["Focus on clean and secure API design."],
        nodes: [
          {
            name: "Databases",
            content: "Learn relational (PostgreSQL) and NoSQL (MongoDB).",
            links: "https://udemy.com",
          },
          {
            name: "Node.js",
            content:
              "Use Node.js for building scalable server-side applications.",
            links: "https://udemy.com",
          },
          {
            name: "REST APIs",
            content:
              "Design stateless endpoints for client-server interaction.",
            links: "https://udemy.com",
          },
          {
            name: "Authentication",
            content: "Secure APIs with JWT, OAuth, etc.",
            links: "https://udemy.com",
          },
          {
            name: "Docker",
            content:
              "Containerize applications for consistency and deployment.",
            links: "https://udemy.com",
          },
          {
            name: "Testing",
            content: "Write unit and integration tests for your backend.",
            links: "https://udemy.com",
          },
        ],
      },
      {
        name: "DevOps",
        tips: ["Automate everything, especially testing and deployments."],
        nodes: [
          {
            name: "Linux Basics",
            content: "Know shell scripting and file system operations.",
            links: "https://udemy.com",
          },
          {
            name: "CI/CD",
            content:
              "Automate builds, tests, and deployments (e.g., GitHub Actions).",
            links: "https://udemy.com",
          },
          {
            name: "Docker",
            content: "Package applications in containers for portability.",
            links: "https://udemy.com",
          },
          {
            name: "Kubernetes",
            content: "Orchestrate containers at scale with Kubernetes.",
            links: "https://udemy.com",
          },
          {
            name: "Monitoring",
            content: "Use Prometheus/Grafana for visibility into systems.",
            links: "https://udemy.com",
          },
          {
            name: "Cloud Platforms",
            content: "Work with AWS, GCP, or Azure for hosting services.",
            links: "https://udemy.com",
          },
        ],
      },
      {
        name: "AI Engineer",
        tips: ["Understand the math behind the models, not just the code."],
        nodes: [
          {
            name: "Python",
            content: "Primary language for data science and machine learning.",
            links: "https://udemy.com",
          },
          {
            name: "Linear Algebra",
            content: "Key to understanding ML algorithms.",
            links: "https://udemy.com",
          },
          {
            name: "Scikit-learn",
            content: "Use for classic ML models like SVM and Random Forest.",
            links: "https://udemy.com",
          },
          {
            name: "Deep Learning",
            content: "Work with frameworks like TensorFlow or PyTorch.",
            links: "https://udemy.com",
          },
          {
            name: "Data Engineering",
            content: "Prepare and process large datasets efficiently.",
            links: "https://udemy.com",
          },
          {
            name: "Model Deployment",
            content: "Serve models using REST APIs or cloud platforms.",
            links: "https://udemy.com",
          },
        ],
      },
      {
        name: "IoT Engineer",
        tips: ["Design with power efficiency and reliability in mind."],
        nodes: [
          {
            name: "Microcontrollers",
            content: "Work with devices like Arduino or ESP32.",
            links: "https://udemy.com",
          },
          {
            name: "Sensors",
            content: "Integrate temperature, motion, and other sensors.",
            links: "https://udemy.com",
          },
          {
            name: "Embedded C/C++",
            content: "Program firmware for low-level device control.",
            links: "https://udemy.com",
          },
          {
            name: "Communication Protocols",
            content: "Understand MQTT, BLE, Zigbee, etc.",
            links: "https://udemy.com",
          },
          {
            name: "IoT Cloud Platforms",
            content: "Use AWS IoT, Azure IoT, or Google IoT Core.",
            links: "https://udemy.com",
          },
          {
            name: "Security",
            content: "Implement encryption and authentication for devices.",
            links: "https://udemy.com",
          },
        ],
      },
      {
        name: "Blockchain Developer",
        tips: ["Focus on security and consensus algorithms."],
        nodes: [
          {
            name: "Solidity",
            content: "Primary language for Ethereum smart contracts.",
            links: "https://udemy.com",
          },
          {
            name: "Smart Contracts",
            content: "Understand how to write and deploy contracts.",
            links: "https://udemy.com",
          },
          {
            name: "Ethereum",
            content: "Learn about the Ethereum blockchain and its ecosystem.",
            links: "https://udemy.com",
          },
          {
            name: "Decentralized Applications (dApps)",
            content: "Build applications that run on the blockchain.",
            links: "https://udemy.com",
          },
          {
            name: "Consensus Algorithms",
            content: "Understand Proof of Work, Proof of Stake, etc.",
            links: "https://udemy.com",
          },
          {
            name: "Blockchain Security",
            content: "Learn about vulnerabilities and secure coding practices.",
            links: "https://udemy.com",
          },
        ],
      },
    ];

    const roadmapRefs = [];

    for (const roadmap of roadmaps) {
      const roadmapRef = admin.firestore().collection("roadmap").doc();
      roadmapRefs.push({ ref: roadmapRef, data: roadmap });
    }

    await Promise.all(roadmapRefs.map((item) => item.ref.set(item.data)));
    console.log("Roadmaps added successfully!");
  } catch (error) {
    console.error("Error adding roadmap document:", error);
  }
}

seedRoadmap()
  .then(() => {
    console.log("Roadmap seeding completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding roadmap:", error);
    process.exit(1);
  });
