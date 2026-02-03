import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db('aonetarget');
    
    console.log('Clearing existing collections...');
    await db.collection('courses').deleteMany({});
    await db.collection('instructors').deleteMany({});
    await db.collection('curriculum').deleteMany({});
    
    console.log('Adding courses...');
    const coursesResult = await db.collection('courses').insertMany([
      {
        id: 'neet-2025-physics',
        title: 'NEET 2025: Complete Physics Foundation Batch',
        subtitle: 'By Er. Deepak Sir (दीपक सर द्वारा)',
        instructor: 'Er. Deepak Sir',
        price: 1499,
        mrp: 9999,
        discount: '85% OFF',
        category: 'Physics',
        tag: 'सबसे लोकप्रिय (Most Popular)',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvEF3LEG2DdZAavjfiW4-5NnKj3S2dD5vrrboH_bmDA1qIrhBHbfLxk9BZGqH_sAn6FrgePVVNCT_YK-4QylqIH30re0Dmv5uUVlNANr3BU4W6MBX0FjaRqhmtN0aIJYnjEGxyMByL4aYCiub5-7wlmt7zdKDoGSvhQB99k1uTlSE7bm26Wp__dcFlyPD1CGHjCRGcuJNna55m-271luAeKynKNKINxKqLx0L7iUD0PHHr6aaoRH47TTxzHxp_uwzxOfAP_4JMeRY-',
        startDate: '15 Aug',
        type: 'live'
      },
      {
        id: 'neet-2025-zoology',
        title: 'Target NEET 2025: Zoology & Botany Crash Course',
        subtitle: "By Dr. Rina Ma'am (रीना मैम द्वारा)",
        instructor: "Dr. Rina Ma'am",
        price: 1999,
        mrp: 11999,
        discount: '83% OFF',
        category: 'Biology',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2vaGmmPDYHmy1Nf_Z7zGRXtncU1hTd065mGLX7YQeHlI2lSFhDze9_PCQ9Pct26eNOFvDvd2vvLSBs2elxHNHx5AJsrx9Of9f_X8FKL6MvVUrAuC9blkR--uBY_J1qaJQ1VjP34rPlPzziQt5JXLSMuwdk7Jw38sC678jtGP81tGa6koQw_3iaKH49gEDovxbxi9DLt-oPHz6n3BX1lu4-o1JUdj5DuiKZvge6EzBm1Gf1fUgP5i5TGHyDLacjrqKcMeYM8J3MTUe',
        type: 'live'
      },
      {
        id: 'organic-chem-masterclass',
        title: 'Organic Chemistry Masterclass for JEE & NEET',
        subtitle: 'By Er. Deepak Sir (दीपक सर द्वारा)',
        instructor: 'Er. Deepak Sir',
        price: 999,
        mrp: 4999,
        discount: '80% OFF',
        category: 'Chemistry',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwXdfd1qJOFtAaJgWnG4tNeCGiLq7fhqaA619xxEHCSGMCl2hIboM02jm-9T_p137Mpf2hDXbo2kmIyrVr984FmbLGBqSsfSvuqkImE6asRemUgnrRIeDkDY0hx9SfAqAPKQvEaZhe4ZqpGf9F95nwJBo1q7cwyl3IH_89pl2MpSzp8Kn4eSM-szTXXAFkNDBmETRcMawMLqO1mgY4pU0R-kwS-FDbQoRLR29_9kBYDlEN5shQ17Lkb1pdUyKIgsBFqnAJGqEOiRHE',
        type: 'recorded'
      }
    ]);
    console.log(`✓ Added ${coursesResult.insertedIds ? Object.keys(coursesResult.insertedIds).length : 3} courses`);
    
    console.log('Adding instructors...');
    const instructorsResult = await db.collection('instructors').insertMany([
      {
        name: 'Dr. A. Sharma',
        role: 'Biology Expert',
        experience: '12+ Yrs Exp',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAba5LdulUqG3WjzQrkobi6ov9MVqLaKJettkUJdb2nQuF6CiRpWrGIR1jg1-_xqepExFbw8hoMoA5lNYXtYnD_49s6BnQ3ZDFap64TmwDDi8pjDbBLWOtTTRspzxG5RLX88Eedh72H3EgvuxcCu26i1n07x-bc60FQzAb0EjHr62NpQ_Lvh4HBhuJPLwQRd_rm-VpOY2RdFhh7z2t1XcSTUCqNNYYdbBkMxPbfBVuxuGpibNU4dDWpR3bFPUhLughb9WhuHLwwTi1X'
      },
      {
        name: 'Mrs. P. Verma',
        role: 'Chemistry Lead',
        experience: '10+ Yrs Exp',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEGaOl5wta1EPwPCtOZi_ezMwpjDIQisRrTXQC7pmYJFtv_enxCLlO_7MJ7EAUpZXD2XTcW8xwCi4EZiH37K2GU-DxGkPi2rhbOb752phs67v1jssbg5Dc3Z1IOOyv5uFsceOYEeWcSup1petxUP-wyU5lLijNxPfsyoUQ6zDaIzcDf2xDJueAgJnBTx7WK0KJ3yio42oKJve7UyelKjs3PSnxdfgNueKQJI5dhc4x73Q9wJMg1ZbMHF7tDBO-qGKr1mcFEqvXzhxm'
      },
      {
        name: 'Mr. R. Gupta',
        role: 'Physics Guru',
        experience: '15+ Yrs Exp',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTau7KTgcND_BHDK4bbRzKODQBgsTInJwKpIW2BXzAPohDkV6jFwZrVPTwZy8z_iZZaWz5PWh9YCVaTqq4sQFo__fdVJ9GfQIIFAA1asfD776HbvzsTL-bF_KJSBCUBUGPKMDBm3sSOuw1vZepzqZYxLd8FhxZTBCcPOtfCbVcPF_kaovXc78h0Wq_kevFj3BsG13inVqJF5ClxaTO47o4qdk0r_9zIA1VfsZpBNN4qpPN-wmTpA3S4RfOJDiri0xs2_4SABou4WOh'
      }
    ]);
    console.log(`✓ Added ${instructorsResult.insertedIds ? Object.keys(instructorsResult.insertedIds).length : 3} instructors`);
    
    console.log('Adding curriculum items...');
    const curriculumResult = await db.collection('curriculum').insertMany([
      { id: '1', title: 'Physics - Mechanics', lessons: 12, duration: '2h 40m', courseId: 'neet-2025-physics', completed: 0, total: 8 },
      { id: '2', title: 'Organic Chemistry', lessons: 18, duration: '4h 15m', courseId: 'organic-chem-masterclass' },
      { id: '3', title: 'Zoology Foundation', lessons: 15, duration: '3h 30m', courseId: 'neet-2025-zoology' },
      { id: '4', title: 'Botany Advanced', lessons: 10, duration: '2h 10m', courseId: 'neet-2025-zoology', locked: true }
    ]);
    console.log(`✓ Added ${curriculumResult.insertedIds ? Object.keys(curriculumResult.insertedIds).length : 4} curriculum items`);
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\nYour MongoDB collections now have sample data:');
    console.log('- courses');
    console.log('- instructors');
    console.log('- curriculum');
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
