import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('aonetarget');

  const missingSubs = [
    { id: 'neet_class-12_crash-course', categoryId: 'neet', title: 'Crash Course', parentPath: 'Class 12th', icon: 'bolt', color: 'bg-red-500', order: 3, isActive: true, createdAt: new Date().toISOString() },
    { id: 'neet_class-12_mock-test', categoryId: 'neet', title: 'Mock Test', parentPath: 'Class 12th', icon: 'quiz', color: 'bg-purple-500', order: 4, isActive: true, createdAt: new Date().toISOString() },
  ];

  for (const sub of missingSubs) {
    const existing = await db.collection('subcategories').findOne({ id: sub.id });
    if (!existing) {
      await db.collection('subcategories').insertOne(sub);
      console.log('Added subcategory:', sub.id);
    } else {
      console.log('Already exists:', sub.id);
    }
  }

  await db.collection('courses').updateOne({ id: 'neet-12-crash-course' }, { $set: { subcategoryId: 'neet_class-12_crash-course' } });

  const newCourses = [
    {
      id: 'neet-11-mock-test',
      name: 'NEET Class 11 - Mock Test Series',
      description: '<p>Complete Mock Test Series for NEET Class 11th.</p><ul><li>Chapter-wise Mock Tests</li><li>Full Length Practice Tests</li><li>Detailed Solutions</li></ul>',
      categoryId: 'neet',
      subcategoryId: 'neet_class-11_mock-test',
      price: 999,
      type: 'recorded',
      instructor: 'Aone Target Faculty',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'neet-11-crash-course',
      name: 'NEET Class 11 - Crash Course',
      description: '<p>Intensive Crash Course covering all NEET Class 11th topics.</p><ul><li>Fast-track syllabus</li><li>Important topics focus</li><li>Quick revision notes</li></ul>',
      categoryId: 'neet',
      subcategoryId: 'neet_class-11_crash-course',
      price: 2999,
      type: 'recorded',
      instructor: 'Aone Target Faculty',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  for (const course of newCourses) {
    const existing = await db.collection('courses').findOne({ id: course.id });
    if (!existing) {
      await db.collection('courses').insertOne(course);
      console.log('Added course:', course.id);
    }
  }

  const videosToAdd = [
    { id: 'vid_neet11_phys_1', title: 'Physics - Units & Measurements', courseId: 'neet-11-recorded-batch', isFree: true, duration: '45:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_phys_2', title: 'Physics - Motion in a Straight Line', courseId: 'neet-11-recorded-batch', isFree: true, duration: '52:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 2, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_phys_3', title: 'Physics - Laws of Motion', courseId: 'neet-11-recorded-batch', isFree: false, duration: '58:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 3, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_chem_1', title: 'Chemistry - Some Basic Concepts', courseId: 'neet-11-recorded-batch', isFree: true, duration: '40:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 4, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_chem_2', title: 'Chemistry - Structure of Atom', courseId: 'neet-11-recorded-batch', isFree: false, duration: '55:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 5, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_bio_1', title: 'Biology - The Living World', courseId: 'neet-11-recorded-batch', isFree: false, duration: '48:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 6, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_bio_2', title: 'Biology - Biological Classification', courseId: 'neet-11-recorded-batch', isFree: false, duration: '50:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 7, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_live_1', title: 'Live: Physics Doubt Session', courseId: 'neet-11-live-classroom', isFree: true, duration: '60:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_live_2', title: 'Live: Chemistry Problem Solving', courseId: 'neet-11-live-classroom', isFree: false, duration: '55:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 2, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_live_3', title: 'Live: Biology NCERT Discussion', courseId: 'neet-11-live-classroom', isFree: false, duration: '50:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 3, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_crash_1', title: 'Crash: Physics Full Revision', courseId: 'neet-11-crash-course', isFree: true, duration: '90:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet11_crash_2', title: 'Crash: Chemistry Full Revision', courseId: 'neet-11-crash-course', isFree: false, duration: '85:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 2, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet12_phys_1', title: 'Physics - Electric Charges & Fields', courseId: 'neet-12-recorded-batch', isFree: true, duration: '50:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet12_phys_2', title: 'Physics - Electrostatic Potential', courseId: 'neet-12-recorded-batch', isFree: false, duration: '55:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 2, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet12_chem_1', title: 'Chemistry - Solutions', courseId: 'neet-12-recorded-batch', isFree: true, duration: '45:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 3, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet12_bio_1', title: 'Biology - Reproduction in Organisms', courseId: 'neet-12-recorded-batch', isFree: false, duration: '52:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 4, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet12_crash_1', title: 'Crash: Class 12 Physics Revision', courseId: 'neet-12-crash-course', isFree: true, duration: '80:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'vid_neet12_crash_2', title: 'Crash: Class 12 Chemistry Revision', courseId: 'neet-12-crash-course', isFree: false, duration: '75:00', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', order: 2, status: 'active', createdAt: new Date().toISOString() },
  ];

  for (const vid of videosToAdd) {
    const existing = await db.collection('videos').findOne({ id: vid.id });
    if (!existing) await db.collection('videos').insertOne(vid);
  }
  console.log('Added videos:', videosToAdd.length);

  const testsToAdd = [
    { id: 'test_neet11_phys_unit1', name: 'Physics Unit Test - Mechanics', courseId: 'neet-11-recorded-batch', isFree: true, duration: 30, totalMarks: 40, passingMarks: 16, numberOfQuestions: 10, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet11_chem_unit1', name: 'Chemistry Unit Test - Basic Concepts', courseId: 'neet-11-recorded-batch', isFree: true, duration: 30, totalMarks: 40, passingMarks: 16, numberOfQuestions: 10, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet11_bio_unit1', name: 'Biology Unit Test - Living World', courseId: 'neet-11-recorded-batch', isFree: false, duration: 30, totalMarks: 40, passingMarks: 16, numberOfQuestions: 10, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet11_fullmock_1', name: 'NEET Class 11 Full Mock Test 1', courseId: 'neet-11-mock-test', isFree: true, duration: 60, totalMarks: 80, passingMarks: 32, numberOfQuestions: 20, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet11_fullmock_2', name: 'NEET Class 11 Full Mock Test 2', courseId: 'neet-11-mock-test', isFree: false, duration: 60, totalMarks: 80, passingMarks: 32, numberOfQuestions: 20, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet11_fullmock_3', name: 'NEET Class 11 Full Mock Test 3', courseId: 'neet-11-mock-test', isFree: false, duration: 60, totalMarks: 80, passingMarks: 32, numberOfQuestions: 20, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet12_phys_unit1', name: 'Physics Unit Test - Electrostatics', courseId: 'neet-12-recorded-batch', isFree: true, duration: 30, totalMarks: 40, passingMarks: 16, numberOfQuestions: 10, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet12_crash_1', name: 'Crash Course Final Test', courseId: 'neet-12-crash-course', isFree: false, duration: 45, totalMarks: 60, passingMarks: 24, numberOfQuestions: 15, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'test_neet11_crash_1', name: 'Crash Course Quick Test', courseId: 'neet-11-crash-course', isFree: true, duration: 20, totalMarks: 20, passingMarks: 8, numberOfQuestions: 5, marksPerQuestion: 4, negativeMarking: 1, status: 'active', createdAt: new Date().toISOString() },
  ];

  for (const test of testsToAdd) {
    const existing = await db.collection('tests').findOne({ id: test.id });
    if (!existing) await db.collection('tests').insertOne(test);
  }
  console.log('Added tests:', testsToAdd.length);

  const questionsToAdd = [
    { id: 'q_phys_mech_1', testId: 'test_neet11_phys_unit1', question: 'A body moves with uniform velocity. What is the acceleration?', optionA: '0 m/s²', optionB: '9.8 m/s²', optionC: '1 m/s²', optionD: 'Cannot be determined', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 1 },
    { id: 'q_phys_mech_2', testId: 'test_neet11_phys_unit1', question: "Newton's first law of motion is also known as:", optionA: 'Law of Acceleration', optionB: 'Law of Inertia', optionC: 'Law of Reaction', optionD: 'Law of Gravitation', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 2 },
    { id: 'q_phys_mech_3', testId: 'test_neet11_phys_unit1', question: 'The SI unit of force is:', optionA: 'Dyne', optionB: 'Joule', optionC: 'Newton', optionD: 'Watt', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 3 },
    { id: 'q_phys_mech_4', testId: 'test_neet11_phys_unit1', question: "What is the acceleration due to gravity on Earth's surface?", optionA: '9.8 m/s²', optionB: '10.8 m/s²', optionC: '8.9 m/s²', optionD: '11.2 m/s²', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 4 },
    { id: 'q_phys_mech_5', testId: 'test_neet11_phys_unit1', question: 'A stone is thrown vertically upward. At the highest point:', optionA: 'Velocity is maximum', optionB: 'Acceleration is zero', optionC: 'Velocity is zero', optionD: 'Both are zero', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 5 },
    { id: 'q_phys_mech_6', testId: 'test_neet11_phys_unit1', question: 'Work done by a force is zero when angle between force and displacement is:', optionA: '0°', optionB: '45°', optionC: '60°', optionD: '90°', correctAnswer: 'D', marks: 4, negativeMarks: 1, order: 6 },
    { id: 'q_phys_mech_7', testId: 'test_neet11_phys_unit1', question: 'The dimensional formula of momentum is:', optionA: '[MLT⁻¹]', optionB: '[MLT⁻²]', optionC: '[ML²T⁻¹]', optionD: '[ML⁻¹T⁻¹]', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 7 },
    { id: 'q_phys_mech_8', testId: 'test_neet11_phys_unit1', question: 'If two objects have equal kinetic energy, which has more momentum?', optionA: 'Lighter object', optionB: 'Heavier object', optionC: 'Equal momentum', optionD: 'Cannot be determined', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 8 },
    { id: 'q_phys_mech_9', testId: 'test_neet11_phys_unit1', question: 'The angle of projection for maximum range is:', optionA: '30°', optionB: '45°', optionC: '60°', optionD: '90°', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 9 },
    { id: 'q_phys_mech_10', testId: 'test_neet11_phys_unit1', question: 'Power is defined as:', optionA: 'Force × Distance', optionB: 'Work / Time', optionC: 'Force × Time', optionD: 'Energy × Time', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 10 },
    { id: 'q_chem_basic_1', testId: 'test_neet11_chem_unit1', question: 'The number of moles in 36g of water is:', optionA: '1 mol', optionB: '2 mol', optionC: '0.5 mol', optionD: '3 mol', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 1 },
    { id: 'q_chem_basic_2', testId: 'test_neet11_chem_unit1', question: "Avogadro's number is:", optionA: '6.022 × 10²³', optionB: '6.022 × 10²²', optionC: '6.022 × 10²⁴', optionD: '6.022 × 10²⁰', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 2 },
    { id: 'q_chem_basic_3', testId: 'test_neet11_chem_unit1', question: 'The atomic number of Carbon is:', optionA: '4', optionB: '6', optionC: '8', optionD: '12', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 3 },
    { id: 'q_chem_basic_4', testId: 'test_neet11_chem_unit1', question: 'Which of the following is a noble gas?', optionA: 'Nitrogen', optionB: 'Oxygen', optionC: 'Neon', optionD: 'Chlorine', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 4 },
    { id: 'q_chem_basic_5', testId: 'test_neet11_chem_unit1', question: 'pH of pure water at 25°C is:', optionA: '0', optionB: '7', optionC: '14', optionD: '1', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 5 },
    { id: 'q_chem_basic_6', testId: 'test_neet11_chem_unit1', question: 'The molecular formula of glucose is:', optionA: 'C₆H₁₂O₆', optionB: 'C₁₂H₂₂O₁₁', optionC: 'CH₃COOH', optionD: 'C₂H₅OH', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 6 },
    { id: 'q_chem_basic_7', testId: 'test_neet11_chem_unit1', question: 'Which element has the highest electronegativity?', optionA: 'Oxygen', optionB: 'Chlorine', optionC: 'Fluorine', optionD: 'Nitrogen', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 7 },
    { id: 'q_chem_basic_8', testId: 'test_neet11_chem_unit1', question: '1 mole of any gas at STP occupies:', optionA: '11.2 L', optionB: '22.4 L', optionC: '44.8 L', optionD: '5.6 L', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 8 },
    { id: 'q_chem_basic_9', testId: 'test_neet11_chem_unit1', question: 'The law of conservation of mass was given by:', optionA: 'Dalton', optionB: 'Lavoisier', optionC: 'Proust', optionD: 'Avogadro', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 9 },
    { id: 'q_chem_basic_10', testId: 'test_neet11_chem_unit1', question: 'Isotopes differ in the number of:', optionA: 'Protons', optionB: 'Electrons', optionC: 'Neutrons', optionD: 'Positrons', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 10 },
    { id: 'q_mock1_1', testId: 'test_neet11_fullmock_1', question: 'A car accelerates from rest to 20 m/s in 10 seconds. The acceleration is:', optionA: '1 m/s²', optionB: '2 m/s²', optionC: '5 m/s²', optionD: '10 m/s²', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 1 },
    { id: 'q_mock1_2', testId: 'test_neet11_fullmock_1', question: 'The SI unit of electric current is:', optionA: 'Volt', optionB: 'Ohm', optionC: 'Ampere', optionD: 'Watt', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 2 },
    { id: 'q_mock1_3', testId: 'test_neet11_fullmock_1', question: 'Photosynthesis takes place in:', optionA: 'Mitochondria', optionB: 'Chloroplast', optionC: 'Ribosome', optionD: 'Nucleus', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 3 },
    { id: 'q_mock1_4', testId: 'test_neet11_fullmock_1', question: 'Which vitamin is produced in human skin by sunlight?', optionA: 'Vitamin A', optionB: 'Vitamin B', optionC: 'Vitamin C', optionD: 'Vitamin D', correctAnswer: 'D', marks: 4, negativeMarks: 1, order: 4 },
    { id: 'q_mock1_5', testId: 'test_neet11_fullmock_1', question: 'The lightest element in the periodic table is:', optionA: 'Helium', optionB: 'Hydrogen', optionC: 'Lithium', optionD: 'Carbon', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 5 },
    { id: 'q_mock1_6', testId: 'test_neet11_fullmock_1', question: 'DNA stands for:', optionA: 'Deoxyribonucleic Acid', optionB: 'Dinitrogen Acid', optionC: 'Deoxyribose Nucleotide Acid', optionD: 'None of these', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 6 },
    { id: 'q_mock1_7', testId: 'test_neet11_fullmock_1', question: 'The formula for kinetic energy is:', optionA: 'mgh', optionB: '½mv²', optionC: 'mv', optionD: 'Fs', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 7 },
    { id: 'q_mock1_8', testId: 'test_neet11_fullmock_1', question: 'Which organelle is called the powerhouse of the cell?', optionA: 'Nucleus', optionB: 'Golgi body', optionC: 'Mitochondria', optionD: 'Ribosome', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 8 },
    { id: 'q_mock1_9', testId: 'test_neet11_fullmock_1', question: 'The chemical formula of common salt is:', optionA: 'KCl', optionB: 'NaCl', optionC: 'CaCl₂', optionD: 'MgCl₂', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 9 },
    { id: 'q_mock1_10', testId: 'test_neet11_fullmock_1', question: "Ohm's law relates:", optionA: 'Voltage, Current, Resistance', optionB: 'Force, Mass, Acceleration', optionC: 'Energy, Mass, Velocity', optionD: 'Pressure, Volume, Temperature', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 10 },
    { id: 'q_mock1_11', testId: 'test_neet11_fullmock_1', question: 'The process of cell division where chromosome number is halved:', optionA: 'Mitosis', optionB: 'Meiosis', optionC: 'Amitosis', optionD: 'Binary fission', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 11 },
    { id: 'q_mock1_12', testId: 'test_neet11_fullmock_1', question: 'What is the valency of Carbon?', optionA: '2', optionB: '3', optionC: '4', optionD: '1', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 12 },
    { id: 'q_mock1_13', testId: 'test_neet11_fullmock_1', question: 'Speed of light in vacuum is approximately:', optionA: '3 × 10⁶ m/s', optionB: '3 × 10⁸ m/s', optionC: '3 × 10¹⁰ m/s', optionD: '3 × 10⁴ m/s', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 13 },
    { id: 'q_mock1_14', testId: 'test_neet11_fullmock_1', question: 'The largest organ in the human body is:', optionA: 'Liver', optionB: 'Heart', optionC: 'Skin', optionD: 'Brain', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 14 },
    { id: 'q_mock1_15', testId: 'test_neet11_fullmock_1', question: 'Which acid is present in the stomach?', optionA: 'Sulfuric acid', optionB: 'Nitric acid', optionC: 'Hydrochloric acid', optionD: 'Acetic acid', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 15 },
    { id: 'q_mock1_16', testId: 'test_neet11_fullmock_1', question: 'Momentum is conserved in:', optionA: 'Elastic only', optionB: 'Inelastic only', optionC: 'Both elastic and inelastic', optionD: 'Neither', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 16 },
    { id: 'q_mock1_17', testId: 'test_neet11_fullmock_1', question: 'The number of chromosomes in a human cell is:', optionA: '23', optionB: '46', optionC: '44', optionD: '48', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 17 },
    { id: 'q_mock1_18', testId: 'test_neet11_fullmock_1', question: 'Covalent bond is formed by:', optionA: 'Transfer of electrons', optionB: 'Sharing of electrons', optionC: 'Donation of electrons', optionD: 'None', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 18 },
    { id: 'q_mock1_19', testId: 'test_neet11_fullmock_1', question: 'The unit of frequency is:', optionA: 'Meter', optionB: 'Second', optionC: 'Hertz', optionD: 'Joule', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 19 },
    { id: 'q_mock1_20', testId: 'test_neet11_fullmock_1', question: 'RBC stands for:', optionA: 'Red Blood Cells', optionB: 'Red Bone Cells', optionC: 'Rapid Blood Count', optionD: 'None', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 20 },
    { id: 'q_crash1_1', testId: 'test_neet11_crash_1', question: 'Force is a vector quantity because it has:', optionA: 'Only magnitude', optionB: 'Only direction', optionC: 'Both magnitude and direction', optionD: 'Neither', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 1 },
    { id: 'q_crash1_2', testId: 'test_neet11_crash_1', question: 'Which is an endothermic reaction?', optionA: 'Burning of coal', optionB: 'Photosynthesis', optionC: 'Respiration', optionD: 'Rusting of iron', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 2 },
    { id: 'q_crash1_3', testId: 'test_neet11_crash_1', question: 'The basic unit of life is:', optionA: 'Tissue', optionB: 'Organ', optionC: 'Cell', optionD: 'Atom', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 3 },
    { id: 'q_crash1_4', testId: 'test_neet11_crash_1', question: 'Displacement is measured in:', optionA: 'Kilogram', optionB: 'Meter', optionC: 'Second', optionD: 'Ampere', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 4 },
    { id: 'q_crash1_5', testId: 'test_neet11_crash_1', question: 'The chemical symbol for Gold is:', optionA: 'Go', optionB: 'Gd', optionC: 'Au', optionD: 'Ag', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 5 },
    { id: 'q_phys12_1', testId: 'test_neet12_phys_unit1', question: "Coulomb's law is analogous to:", optionA: "Newton's second law", optionB: "Newton's law of gravitation", optionC: "Ohm's law", optionD: "Faraday's law", correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 1 },
    { id: 'q_phys12_2', testId: 'test_neet12_phys_unit1', question: 'The unit of electric field is:', optionA: 'N/C', optionB: 'C/N', optionC: 'J/C', optionD: 'V/m²', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 2 },
    { id: 'q_phys12_3', testId: 'test_neet12_phys_unit1', question: 'Electric potential is a:', optionA: 'Vector quantity', optionB: 'Scalar quantity', optionC: 'Tensor', optionD: 'None', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 3 },
    { id: 'q_phys12_4', testId: 'test_neet12_phys_unit1', question: 'The dielectric constant of vacuum is:', optionA: '0', optionB: '1', optionC: 'Infinity', optionD: '-1', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 4 },
    { id: 'q_phys12_5', testId: 'test_neet12_phys_unit1', question: 'Inside a conductor, electric field is:', optionA: 'Maximum', optionB: 'Minimum', optionC: 'Zero', optionD: 'Infinite', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 5 },
    { id: 'q_phys12_6', testId: 'test_neet12_phys_unit1', question: 'A capacitor stores energy in the form of:', optionA: 'Kinetic energy', optionB: 'Electric field energy', optionC: 'Magnetic energy', optionD: 'Heat energy', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 6 },
    { id: 'q_phys12_7', testId: 'test_neet12_phys_unit1', question: 'The unit of capacitance is:', optionA: 'Coulomb', optionB: 'Volt', optionC: 'Farad', optionD: 'Ohm', correctAnswer: 'C', marks: 4, negativeMarks: 1, order: 7 },
    { id: 'q_phys12_8', testId: 'test_neet12_phys_unit1', question: 'Electric flux is measured in:', optionA: 'N·m²/C', optionB: 'V/m', optionC: 'C/m²', optionD: 'J/C', correctAnswer: 'A', marks: 4, negativeMarks: 1, order: 8 },
    { id: 'q_phys12_9', testId: 'test_neet12_phys_unit1', question: "Gauss's law is applicable for:", optionA: 'Open surfaces only', optionB: 'Closed surfaces only', optionC: 'Both', optionD: 'None', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 9 },
    { id: 'q_phys12_10', testId: 'test_neet12_phys_unit1', question: 'Two charges of equal magnitude and same sign will:', optionA: 'Attract', optionB: 'Repel', optionC: 'No effect', optionD: 'First attract then repel', correctAnswer: 'B', marks: 4, negativeMarks: 1, order: 10 },
  ];

  for (const q of questionsToAdd) {
    const existing = await db.collection('questions').findOne({ id: q.id });
    if (!existing) await db.collection('questions').insertOne(q);
  }
  console.log('Added questions:', questionsToAdd.length);

  await db.collection('courses').deleteOne({ id: 'neet-exam-recorded' });
  await db.collection('courses').deleteOne({ id: 'neet-mock-test-series' });
  console.log('Removed orphan courses');

  await db.collection('courses').updateOne({ id: 'neet-11-recorded-batch' }, { $set: {
    description: '<p>Complete NEET Class 11 Recorded Batch with Physics, Chemistry and Biology.</p><ul><li>HD Video Lectures</li><li>Chapter-wise Tests</li><li>Study Notes</li><li>Doubt Support</li></ul>',
    instructor: 'Aone Target Faculty', status: 'active'
  }});
  await db.collection('courses').updateOne({ id: 'neet-12-recorded-batch' }, { $set: {
    description: '<p>Complete NEET Class 12 Recorded Batch covering all subjects.</p><ul><li>HD Video Lectures</li><li>Chapter-wise Tests</li><li>Previous Year Questions</li></ul>',
    instructor: 'Aone Target Faculty', status: 'active'
  }});
  await db.collection('courses').updateOne({ id: 'neet-11-live-classroom' }, { $set: {
    description: '<p>Live Interactive Classroom for NEET Class 11.</p><ul><li>Live Classes</li><li>Q&A Sessions</li><li>Recordings Available</li></ul>',
    instructor: 'Aone Target Faculty', status: 'active'
  }});
  await db.collection('courses').updateOne({ id: 'neet-12-crash-course' }, { $set: {
    description: '<p>Intensive Crash Course for NEET Class 12.</p><ul><li>Quick Revision</li><li>Important Questions</li><li>Formula Sheets</li></ul>',
    instructor: 'Aone Target Faculty', status: 'active'
  }});

  console.log('Done! All NEET data seeded successfully.');
  await client.close();
}

seed().catch(console.error);
