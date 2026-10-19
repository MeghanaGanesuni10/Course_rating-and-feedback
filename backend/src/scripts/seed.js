/**
 * Idempotent seed script — safe to run multiple times.
 * Run with:  npm run seed  (from the backend directory)
 *
 * Creates fictional sample courses only — NOT real student data.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

const SAMPLE_COURSES = [
  {
    courseCode: 'CS101',
    title: 'Introduction to Computer Science',
    department: 'Computer Science',
    instructor: 'Dr. Priya Sharma',
    description: 'Foundational principles of computing, algorithms, and programming logic using Python. Covers problem decomposition, data types, control flow, and introductory data structures.',
    credits: 4,
    semester: 'Fall 2024',
  },
  {
    courseCode: 'CS201',
    title: 'Data Structures and Algorithms',
    department: 'Computer Science',
    instructor: 'Prof. Arjun Mehta',
    description: 'In-depth study of arrays, linked lists, stacks, queues, trees, graphs, and hash tables. Algorithm analysis including time and space complexity, sorting, and searching.',
    credits: 4,
    semester: 'Spring 2025',
  },
  {
    courseCode: 'CS301',
    title: 'Database Management Systems',
    department: 'Computer Science',
    instructor: 'Dr. Kavita Rao',
    description: 'Relational and NoSQL database design. ER modeling, normalization, SQL, transactions, indexing, and an introduction to MongoDB.',
    credits: 3,
    semester: 'Fall 2024',
  },
  {
    courseCode: 'CS401',
    title: 'Web Development',
    department: 'Computer Science',
    instructor: 'Prof. Ravi Kumar',
    description: 'Full-stack web development using HTML5, CSS3, JavaScript, React, Node.js, and Express. REST API design, authentication, and deployment practices.',
    credits: 4,
    semester: 'Spring 2025',
  },
  {
    courseCode: 'CS501',
    title: 'Machine Learning',
    department: 'Computer Science',
    instructor: 'Dr. Ananya Patel',
    description: 'Supervised and unsupervised learning algorithms including linear regression, decision trees, SVMs, k-means clustering, and neural networks using scikit-learn and TensorFlow.',
    credits: 4,
    semester: 'Fall 2024',
  },
  {
    courseCode: 'MATH201',
    title: 'Discrete Mathematics',
    department: 'Mathematics',
    instructor: 'Prof. Suresh Iyer',
    description: 'Logic, sets, relations, functions, combinatorics, graph theory, and introductory number theory. Essential mathematical foundations for computer science.',
    credits: 3,
    semester: 'Fall 2024',
  },
  {
    courseCode: 'MATH301',
    title: 'Linear Algebra',
    department: 'Mathematics',
    instructor: 'Dr. Meera Nair',
    description: 'Vectors, matrices, determinants, eigenvalues, eigenvectors, and linear transformations. Applications in data science, graphics, and engineering.',
    credits: 3,
    semester: 'Spring 2025',
  },
  {
    courseCode: 'ECE201',
    title: 'Digital Logic Design',
    department: 'Electronics & Communication',
    instructor: 'Prof. Vikram Singh',
    description: 'Boolean algebra, logic gates, combinational and sequential circuits, flip-flops, counters, registers, and introduction to hardware description languages.',
    credits: 4,
    semester: 'Fall 2024',
  },
  {
    courseCode: 'CS601',
    title: 'Operating Systems',
    department: 'Computer Science',
    instructor: 'Dr. Lakshmi Reddy',
    description: 'Process management, scheduling, memory management, virtual memory, file systems, I/O, and inter-process communication. Hands-on labs with Linux.',
    credits: 4,
    semester: 'Spring 2025',
  },
  {
    courseCode: 'CS701',
    title: 'Computer Networks',
    department: 'Computer Science',
    instructor: 'Prof. Gopal Krishnan',
    description: 'OSI and TCP/IP models, routing protocols, DNS, HTTP, transport layer, socket programming, and network security fundamentals.',
    credits: 3,
    semester: 'Fall 2024',
  },
];

const seed = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not set. Copy .env.example to .env and configure it first.');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: 'courserate' });
  console.log('✅  Connected to MongoDB for seeding...');

  let inserted = 0;
  let skipped = 0;

  for (const data of SAMPLE_COURSES) {
    const existing = await Course.findOne({ courseCode: data.courseCode });
    if (existing) {
      console.log(`   ⏭  Skipping ${data.courseCode} (already exists)`);
      skipped++;
    } else {
      await Course.create(data);
      console.log(`   ✅  Created ${data.courseCode}: ${data.title}`);
      inserted++;
    }
  }

  console.log(`\n🌱  Seeding complete — ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
