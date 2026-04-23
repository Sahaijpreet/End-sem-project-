import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Book from '../models/Book.js';
import PYQ from '../models/PYQ.js';
import DoubtPost from '../models/DoubtPost.js';
import StudyGroup from '../models/StudyGroup.js';

dotenv.config();

const SUBJECTS = ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Economics', 'History', 'Biology'];

const USERS = [
  { Name: 'Arjun Sharma',   Email: 'arjun@college.edu',   Password: 'password123', Branch: 'Computer Science', Year: 3, Bio: 'CS enthusiast, loves algorithms' },
  { Name: 'Priya Patel',    Email: 'priya@college.edu',   Password: 'password123', Branch: 'Electronics',      Year: 2, Bio: 'Electronics & IoT hobbyist' },
  { Name: 'Rahul Verma',    Email: 'rahul@college.edu',   Password: 'password123', Branch: 'Mechanical',       Year: 4, Bio: 'Final year, placement prep mode' },
  { Name: 'Sneha Gupta',    Email: 'sneha@college.edu',   Password: 'password123', Branch: 'Computer Science', Year: 1, Bio: 'Freshman, excited to learn!' },
  { Name: 'Vikram Singh',   Email: 'vikram@college.edu',  Password: 'password123', Branch: 'Civil',            Year: 3, Bio: 'Building the future, literally' },
  { Name: 'Ananya Reddy',   Email: 'ananya@college.edu',  Password: 'password123', Branch: 'Computer Science', Year: 2, Bio: 'Full-stack dev in the making' },
  { Name: 'Karan Mehta',    Email: 'karan@college.edu',   Password: 'password123', Branch: 'Electrical',       Year: 4, Bio: 'Power systems & renewables' },
  { Name: 'Divya Nair',     Email: 'divya@college.edu',   Password: 'password123', Branch: 'Computer Science', Year: 3, Bio: 'AI/ML researcher wannabe' },
];

const NOTES = [
  { Title: 'Data Structures & Algorithms - Complete Notes', Subject: 'Computer Science', Semester: 3, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80' },
  { Title: 'Operating Systems - Process Management', Subject: 'Computer Science', Semester: 4, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
  { Title: 'Database Management Systems', Subject: 'Computer Science', Semester: 5, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80' },
  { Title: 'Computer Networks - OSI Model', Subject: 'Computer Science', Semester: 5, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80' },
  { Title: 'Mechanics of Solids', Subject: 'Physics', Semester: 2, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80' },
  { Title: 'Thermodynamics - Laws & Applications', Subject: 'Physics', Semester: 3, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=400&q=80' },
  { Title: 'Organic Chemistry - Reaction Mechanisms', Subject: 'Chemistry', Semester: 2, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80' },
  { Title: 'Linear Algebra & Matrices', Subject: 'Mathematics', Semester: 2, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80' },
  { Title: 'Calculus - Differential & Integral', Subject: 'Mathematics', Semester: 1, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80' },
  { Title: 'Microeconomics - Supply & Demand', Subject: 'Economics', Semester: 4, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80' },
  { Title: 'Machine Learning Fundamentals', Subject: 'Computer Science', Semester: 6, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80' },
  { Title: 'Software Engineering - SDLC Models', Subject: 'Computer Science', Semester: 5, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80' },
  { Title: 'Digital Electronics & Logic Gates', Subject: 'Computer Science', Semester: 3, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=400&q=80' },
  { Title: 'Discrete Mathematics', Subject: 'Mathematics', Semester: 3, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&q=80' },
  { Title: 'Modern History of India', Subject: 'History', Semester: 2, FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&q=80' },
];

const BOOKS = [
  { Title: 'Introduction to Algorithms (CLRS)', Author: 'Cormen et al.', Subject: 'Computer Science', CoverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80' },
  { Title: 'Operating System Concepts', Author: 'Silberschatz', Subject: 'Computer Science', CoverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
  { Title: 'Database System Concepts', Author: 'Korth', Subject: 'Computer Science', CoverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80' },
  { Title: 'Engineering Physics', Author: 'R.K. Gaur', Subject: 'Physics', CoverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80' },
  { Title: 'Organic Chemistry', Author: 'Morrison & Boyd', Subject: 'Chemistry', CoverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80' },
  { Title: 'Higher Engineering Mathematics', Author: 'B.S. Grewal', Subject: 'Mathematics', CoverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80' },
  { Title: 'Principles of Economics', Author: 'N. Gregory Mankiw', Subject: 'Economics', CoverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80' },
  { Title: 'Computer Networks', Author: 'Andrew Tanenbaum', Subject: 'Computer Science', CoverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80' },
  { Title: 'Artificial Intelligence: A Modern Approach', Author: 'Russell & Norvig', Subject: 'Computer Science', CoverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80' },
  { Title: 'Strength of Materials', Author: 'R.K. Bansal', Subject: 'Physics', CoverImage: 'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=400&q=80' },
];

const PYQS = [
  { Title: 'Data Structures End Sem 2023', Subject: 'Computer Science', Semester: 3, Year: 2023, ExamType: 'End Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80' },
  { Title: 'OS Mid Sem 2023', Subject: 'Computer Science', Semester: 4, Year: 2023, ExamType: 'Mid Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80' },
  { Title: 'DBMS End Sem 2022', Subject: 'Computer Science', Semester: 5, Year: 2022, ExamType: 'End Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&q=80' },
  { Title: 'Mathematics End Sem 2023', Subject: 'Mathematics', Semester: 2, Year: 2023, ExamType: 'End Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80' },
  { Title: 'Physics Mid Sem 2022', Subject: 'Physics', Semester: 2, Year: 2022, ExamType: 'Mid Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80' },
  { Title: 'Chemistry End Sem 2023', Subject: 'Chemistry', Semester: 2, Year: 2023, ExamType: 'End Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80' },
  { Title: 'Computer Networks Quiz 2023', Subject: 'Computer Science', Semester: 5, Year: 2023, ExamType: 'Quiz', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80' },
  { Title: 'Economics End Sem 2022', Subject: 'Economics', Semester: 4, Year: 2022, ExamType: 'End Semester', FileURL: '/uploads/dummy.pdf', CoverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80' },
];

const DOUBTS = [
  { Title: 'What is the difference between BFS and DFS?', Body: 'I understand both traverse graphs but when should I use BFS vs DFS? Can someone explain with examples?', Subject: 'Computer Science', Semester: 3, Tags: ['graphs', 'algorithms'] },
  { Title: 'How to solve recurrence relations using Master Theorem?', Body: 'I keep getting confused with the three cases of Master Theorem. Can someone explain with examples?', Subject: 'Mathematics', Semester: 3, Tags: ['recurrence', 'complexity'] },
  { Title: 'Difference between process and thread?', Body: 'My professor explained this but I am still confused. What exactly is the difference and when do we use threads?', Subject: 'Computer Science', Semester: 4, Tags: ['OS', 'processes'] },
  { Title: 'How does normalization work in DBMS?', Body: 'Can someone explain 1NF, 2NF, 3NF with a simple example? The textbook explanation is too complex.', Subject: 'Computer Science', Semester: 5, Tags: ['DBMS', 'normalization'] },
  { Title: 'What is the physical significance of curl?', Body: 'I know the mathematical definition but what does curl actually represent physically?', Subject: 'Physics', Semester: 2, Tags: ['electromagnetism', 'vectors'] },
];

const GROUPS = [
  { Name: 'CS Sem 5 Study Group', Subject: 'Computer Science', Semester: 5, Description: 'For all CS 5th semester students. Discuss DBMS, CN, OS together!' },
  { Name: 'Math Warriors', Subject: 'Mathematics', Semester: 3, Description: 'Solving tough math problems together. All branches welcome.' },
  { Name: 'Physics Nerds', Subject: 'Physics', Semester: 2, Description: 'Understanding physics concepts and solving numericals.' },
  { Name: 'Placement Prep 2024', Subject: 'Computer Science', Semester: 7, Description: 'DSA, system design, and interview prep for final year students.' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saar_db');
  console.log('Connected to MongoDB');

  // Clear existing dummy data (keep admin)
  await Promise.all([
    Note.deleteMany({}),
    Book.deleteMany({}),
    PYQ.deleteMany({}),
    DoubtPost.deleteMany({}),
    StudyGroup.deleteMany({}),
    User.deleteMany({ Role: 'Student' }),
  ]);
  console.log('Cleared existing data');

  // Create a dummy PDF placeholder in uploads if not exists
  import('fs').then(({ default: fs }) => {
    import('path').then(({ default: path }) => {
      import('url').then(({ fileURLToPath }) => {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const dummyPath = path.join(__dirname, '../uploads/dummy.pdf');
        if (!fs.existsSync(dummyPath)) {
          fs.writeFileSync(dummyPath, '%PDF-1.4 dummy file for seeding');
        }
      });
    });
  });

  // Create users
  const salt = await bcrypt.genSalt(10);
  const createdUsers = [];
  for (const u of USERS) {
    const PasswordHash = await bcrypt.hash(u.Password, salt);
    const user = await User.create({ Name: u.Name, Email: u.Email, PasswordHash, Role: 'Student', Branch: u.Branch, Year: u.Year, Bio: u.Bio });
    createdUsers.push(user);
    console.log(`Created user: ${u.Name}`);
  }

  // Create notes — distribute among users
  for (let i = 0; i < NOTES.length; i++) {
    const uploader = createdUsers[i % createdUsers.length];
    const downloads = Math.floor(Math.random() * 80);
    await Note.create({ ...NOTES[i], UploaderID: uploader._id, Downloads: downloads });
  }
  console.log(`Created ${NOTES.length} notes`);

  // Create books
  for (let i = 0; i < BOOKS.length; i++) {
    const owner = createdUsers[i % createdUsers.length];
    const statuses = ['Available', 'Available', 'Available', 'Requested'];
    await Book.create({ ...BOOKS[i], OwnerID: owner._id, Status: statuses[i % statuses.length] });
  }
  console.log(`Created ${BOOKS.length} books`);

  // Create PYQs
  for (let i = 0; i < PYQS.length; i++) {
    const uploader = createdUsers[i % createdUsers.length];
    await PYQ.create({ ...PYQS[i], UploaderID: uploader._id, Downloads: Math.floor(Math.random() * 120) });
  }
  console.log(`Created ${PYQS.length} PYQs`);

  // Create doubts with answers
  for (let i = 0; i < DOUBTS.length; i++) {
    const author = createdUsers[i % createdUsers.length];
    const answerer = createdUsers[(i + 1) % createdUsers.length];
    const post = await DoubtPost.create({
      ...DOUBTS[i],
      AuthorID: author._id,
      Views: Math.floor(Math.random() * 50) + 5,
      Answers: [{
        AuthorID: answerer._id,
        Text: `Great question! Here is my explanation: The key concept here is to understand the fundamentals. I would recommend checking the notes on ${DOUBTS[i].Subject} and practicing problems step by step.`,
        Upvotes: [createdUsers[(i + 2) % createdUsers.length]._id],
        IsAccepted: i % 2 === 0,
      }],
      Solved: i % 2 === 0,
    });
  }
  console.log(`Created ${DOUBTS.length} doubt posts`);

  // Create study groups
  for (let i = 0; i < GROUPS.length; i++) {
    const creator = createdUsers[i % createdUsers.length];
    const members = [creator._id, createdUsers[(i + 1) % createdUsers.length]._id, createdUsers[(i + 2) % createdUsers.length]._id];
    await StudyGroup.create({ ...GROUPS[i], CreatedBy: creator._id, Members: members });
  }
  console.log(`Created ${GROUPS.length} study groups`);

  console.log('\n✅ Seed complete!');
  console.log('Sample login credentials:');
  USERS.slice(0, 3).forEach((u) => console.log(`  ${u.Email} / ${u.Password}`));

  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
