import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Contractor from '../models/Contractor.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Contractor dataset from the provided table
const contractorsData = [
  { name: 'Shree Balaji Civil Works', rating: 4.6, availability: true, experience: 12, workDone: 260 },
  { name: 'Ramaiah Road & Drainage Contractors', rating: 4.2, availability: true, experience: 8, workDone: 180 },
  { name: 'Karnataka Clean City Services', rating: 3.9, availability: false, experience: 6, workDone: 120 },
  { name: 'Laxmi Infra & Constructions', rating: 4.5, availability: true, experience: 14, workDone: 280 },
  { name: 'Sai Ganesh Garbage Management', rating: 4.1, availability: true, experience: 7, workDone: 150 },
  { name: 'Durga Engineering & Municipal Service', rating: 4.3, availability: true, experience: 10, workDone: 220 },
  { name: 'Om Shakti Waste Solutions', rating: 3.8, availability: false, experience: 5, workDone: 90 },
  { name: 'Belgaum Metro Developers', rating: 4.8, availability: true, experience: 16, workDone: 315 },
  { name: 'Nandini Civil & PWD Contractors', rating: 4.4, availability: true, experience: 11, workDone: 240 },
  { name: 'Sriram Urban Cleaners', rating: 3.7, availability: true, experience: 4, workDone: 75 },
  { name: 'Gokak Smart City Works', rating: 4.0, availability: true, experience: 9, workDone: 200 },
  { name: 'Veerabhadra Municipal Services', rating: 3.6, availability: true, experience: 2, workDone: 60 },
  { name: 'Maruthi Road Repairs & Constructions', rating: 4.3, availability: true, experience: 13, workDone: 270 },
  { name: 'Kittur Waste Collection Agency', rating: 3.9, availability: false, experience: 6, workDone: 110 },
  { name: 'Sri Basaveshwar Infrastructure', rating: 4.5, availability: true, experience: 15, workDone: 290 },
  { name: 'Vinayaka Public Works Company', rating: 4.2, availability: true, experience: 9, workDone: 190 },
  { name: 'Udaygiri Clean Zone Services', rating: 3.8, availability: true, experience: 5, workDone: 100 },
  { name: 'Shree Renuka Devi Contractors', rating: 4.1, availability: true, experience: 8, workDone: 170 },
  { name: 'Vishwakarma Road & Bridge Works', rating: 4.4, availability: true, experience: 12, workDone: 250 },
  { name: 'Sri Mallikarjun Cleaning Agency', rating: 3.7, availability: false, experience: 4, workDone: 80 },
  { name: 'Ashoka Municipal Services Pvt Ltd', rating: 4.6, availability: true, experience: 14, workDone: 300 },
  { name: 'Pooja Urban Development Works', rating: 4.0, availability: true, experience: 7, workDone: 160 },
  { name: 'Sharda Infrastructure & Repairs', rating: 4.3, availability: true, experience: 11, workDone: 230 },
  { name: 'Bharath Municipal Waste Solutions', rating: 3.9, availability: true, experience: 6, workDone: 130 },
  { name: 'Shivshakti Engineering Constructions', rating: 4.5, availability: true, experience: 13, workDone: 280 },
  { name: 'New Belagavi Clean Works', rating: 3.8, availability: false, experience: 5, workDone: 95 },
  { name: 'Hanumantha Urban Developers', rating: 4.2, availability: true, experience: 10, workDone: 210 },
  { name: 'Rajarajeshwari Road Contractors', rating: 4.4, availability: true, experience: 12, workDone: 260 },
  { name: 'Amba Bhavani Public Works', rating: 4.1, availability: true, experience: 8, workDone: 180 },
  { name: 'Krishna Smart City Contractors', rating: 4.7, availability: true, experience: 15, workDone: 330 },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedContractors = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding contractors...\n');

    let created = 0;
    let updated = 0;

    for (const contractorData of contractorsData) {
      // Generate email and phone from company name
      const email = `${contractorData.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')}@contractor.com`;
      const phone = `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const licenseNumber = `LIC-${Math.floor(Math.random() * 90000) + 10000}`;
      
      // Determine specialties based on company name
      const specialties = [];
      const nameLower = contractorData.name.toLowerCase();
      if (nameLower.includes('road') || nameLower.includes('civil') || nameLower.includes('infra')) {
        specialties.push('road');
      }
      if (nameLower.includes('drainage') || nameLower.includes('civil')) {
        specialties.push('drainage');
      }
      if (nameLower.includes('garbage') || nameLower.includes('waste') || nameLower.includes('clean')) {
        specialties.push('garbage');
      }
      if (nameLower.includes('water') || nameLower.includes('municipal')) {
        specialties.push('water');
      }
      if (specialties.length === 0) {
        specialties.push('other');
      }

      // Check if user already exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create user account
        const hashedPassword = await bcrypt.hash('contractor123', 12);
        user = await User.create({
          name: contractorData.name,
          email,
          phone,
          password: hashedPassword,
          role: 'contractor',
          contractorInfo: {
            companyName: contractorData.name,
            licenseNumber,
            rating: contractorData.rating,
            totalJobs: contractorData.workDone + Math.floor(Math.random() * 50),
            completedJobs: contractorData.workDone,
          },
          isActive: contractorData.availability,
        });
        created++;
      } else {
        // Update existing user
        user.contractorInfo = {
          companyName: contractorData.name,
          licenseNumber: user.contractorInfo?.licenseNumber || licenseNumber,
          rating: contractorData.rating,
          totalJobs: contractorData.workDone + Math.floor(Math.random() * 50),
          completedJobs: contractorData.workDone,
        };
        user.isActive = contractorData.availability;
        await user.save();
        updated++;
      }

      // Create or update Contractor document
      let contractor = await Contractor.findOne({ user: user._id });

      if (!contractor) {
        await Contractor.create({
          user: user._id,
          companyName: contractorData.name,
          licenseNumber,
          phone,
          email,
          rating: contractorData.rating,
          availability: contractorData.availability,
          experience: contractorData.experience,
          workDone: contractorData.workDone,
          completedJobs: contractorData.workDone,
          totalJobs: contractorData.workDone + Math.floor(Math.random() * 50),
          specialties,
          isVerified: true,
          isActive: contractorData.availability,
        });
      } else {
        contractor.rating = contractorData.rating;
        contractor.availability = contractorData.availability;
        contractor.experience = contractorData.experience;
        contractor.workDone = contractorData.workDone;
        contractor.completedJobs = contractorData.workDone;
        contractor.totalJobs = contractorData.workDone + Math.floor(Math.random() * 50);
        contractor.specialties = specialties;
        contractor.isActive = contractorData.availability;
        await contractor.save();
      }

      console.log(`✅ ${contractorData.name} - Rating: ${contractorData.rating} | Experience: ${contractorData.experience} years | Work Done: ${contractorData.workDone}`);
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Created: ${created} contractors`);
    console.log(`   Updated: ${updated} contractors`);
    console.log(`   Total: ${contractorsData.length} contractors\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding contractors:', error);
    process.exit(1);
  }
};

seedContractors();

