import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MunicipalOffice from '../models/MunicipalOffice.js';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Sample municipal office data based on the image provided
const municipalOffices = [
  {
    name: 'Belagavi City Corporation (BCC)',
    type: 'City Corporation',
    address: 'CTS No 4821/27A RSNO 1005, Subhash Nagar, Belagavi - 590016',
    contact: {
      phone: '0831-2405316 / 24',
      email: 'bcc@belagavi.gov.in',
    },
    latitude: 15.85,
    longitude: 74.5,
    location: {
      type: 'Point',
      coordinates: [74.5, 15.85], // [longitude, latitude] - GeoJSON format
    },
    jurisdictionRadius: 20, // 20km radius
  },
  {
    name: 'Athani Town Municipal Council (TMC Athani)',
    type: 'Municipal Council',
    address: 'Near Dr B R Ambedkar circle, Busstand Road, Athani - 591304',
    contact: {
      phone: '08289-251137',
      email: 'tmc@athani.gov.in',
    },
    latitude: 16.7241,
    longitude: 75.0638,
    location: {
      type: 'Point',
      coordinates: [75.0638, 16.7241], // [longitude, latitude] - GeoJSON format
    },
    jurisdictionRadius: 15, // 15km radius
  },
  {
    name: 'Nippani City Municipal Council (CMC Nippani)',
    type: 'Municipal Council',
    address: 'Old PB Road, Nippani, Belagavi Dist. - 591237',
    contact: {
      phone: '08338-220053',
      email: 'cmc@nippani.gov.in',
    },
    latitude: 16.4,
    longitude: 74.3833,
    location: {
      type: 'Point',
      coordinates: [74.3833, 16.4], // [longitude, latitude] - GeoJSON format
    },
    jurisdictionRadius: 12, // 12km radius
  },
];

// Sample municipal officers
const municipalOfficers = [
  {
    name: 'Rajesh Kumar',
    email: 'officer.bcc@belagavi.gov.in',
    phone: '9876543210',
    password: 'officer123',
    role: 'MUNICIPAL_OFFICER',
    municipalOfficeName: 'Belagavi City Corporation (BCC)',
  },
  {
    name: 'Priya Sharma',
    email: 'officer.athani@athani.gov.in',
    phone: '9876543211',
    password: 'officer123',
    role: 'MUNICIPAL_OFFICER',
    municipalOfficeName: 'Athani Town Municipal Council (TMC Athani)',
  },
  {
    name: 'Amit Patel',
    email: 'officer.nippani@nippani.gov.in',
    phone: '9876543212',
    password: 'officer123',
    role: 'MUNICIPAL_OFFICER',
    municipalOfficeName: 'Nippani City Municipal Council (CMC Nippani)',
  },
];

// Sample contractors
const contractors = [
  {
    name: 'ABC Construction Co.',
    email: 'contractor1@example.com',
    phone: '9876543220',
    password: 'contractor123',
    role: 'contractor',
    contractorInfo: {
      companyName: 'ABC Construction Co.',
      licenseNumber: 'LIC-001',
      rating: 4.5,
      totalJobs: 50,
      completedJobs: 45,
    },
  },
  {
    name: 'XYZ Infrastructure',
    email: 'contractor2@example.com',
    phone: '9876543221',
    password: 'contractor123',
    role: 'contractor',
    contractorInfo: {
      companyName: 'XYZ Infrastructure',
      licenseNumber: 'LIC-002',
      rating: 4.2,
      totalJobs: 35,
      completedJobs: 32,
    },
  },
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicfix';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await MunicipalOffice.deleteMany({});
    // await User.deleteMany({ role: 'MUNICIPAL_OFFICER' });
    // await User.deleteMany({ role: 'contractor' });

    // Create Municipal Offices
    console.log('📝 Creating municipal offices...');
    const createdOffices = [];
    for (const officeData of municipalOffices) {
      const existingOffice = await MunicipalOffice.findOne({ name: officeData.name });
      if (existingOffice) {
        console.log(`   ⚠️  Office "${officeData.name}" already exists, skipping...`);
        createdOffices.push(existingOffice);
      } else {
        const office = await MunicipalOffice.create(officeData);
        console.log(`   ✅ Created: ${office.name}`);
        createdOffices.push(office);
      }
    }

    // Create Municipal Officers
    console.log('\n👤 Creating municipal officers...');
    for (const officerData of municipalOfficers) {
      const office = createdOffices.find(
        (o) => o.name === officerData.municipalOfficeName
      );
      if (!office) {
        console.log(`   ⚠️  Office "${officerData.municipalOfficeName}" not found, skipping officer...`);
        continue;
      }

      const existingOfficer = await User.findOne({ email: officerData.email });
      if (existingOfficer) {
        console.log(`   ⚠️  Officer "${officerData.email}" already exists, skipping...`);
      } else {
        const officer = await User.create({
          ...officerData,
          municipalOffice: office._id,
        });
        console.log(`   ✅ Created: ${officer.name} (${officer.email})`);
        console.log(`      Password: ${officerData.password}`);
      }
    }

    // Create Contractors
    console.log('\n🔧 Creating contractors...');
    for (const contractorData of contractors) {
      const existingContractor = await User.findOne({ email: contractorData.email });
      if (existingContractor) {
        console.log(`   ⚠️  Contractor "${contractorData.email}" already exists, skipping...`);
      } else {
        const contractor = await User.create(contractorData);
        console.log(`   ✅ Created: ${contractor.name} (${contractor.email})`);
        console.log(`      Password: ${contractorData.password}`);
      }
    }

    console.log('\n✅ Sample data seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Municipal Officers:');
    municipalOfficers.forEach((o) => {
      console.log(`      ${o.email} / ${o.password}`);
    });
    console.log('   Contractors:');
    contractors.forEach((c) => {
      console.log(`      ${c.email} / ${c.password}`);
    });
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedData();
