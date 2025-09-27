const mongoose = require('mongoose');
const ProjectMedia = require('../models/ProjectMedia');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project24');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test data
const testMediaData = [
  {
    title: 'صورة المشروع الخارجية 1',
    description: 'منظر خارجي جميل للمشروع',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: 'https://res.cloudinary.com/dvaz05tc6/image/upload/v1758706017/project24/gallery/media_1758706015748_o7wynunq4.jpg',
      publicId: 'test_image_1',
      originalName: 'project-exterior-1.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 800,
        height: 600
      }
    },
    alt: 'صورة المشروع الخارجية',
    tags: ['خارجي', 'واجهة', 'مشروع'],
    isActive: true,
    order: 1
  },
  {
    title: 'صورة المشروع الخارجية 2',
    description: 'منظر آخر للمشروع',
    mediaType: 'image',
    category: 'project-photos',
    file: {
      url: 'https://res.cloudinary.com/dvaz05tc6/image/upload/v1758706017/project24/gallery/media_1758706015748_o7wynunq4.jpg',
      publicId: 'test_image_2',
      originalName: 'project-exterior-2.jpg',
      fileSize: 1200000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 800,
        height: 600
      }
    },
    alt: 'صورة المشروع الخارجية الثانية',
    tags: ['خارجي', 'منظر', 'مشروع'],
    isActive: true,
    order: 2
  },
  {
    title: 'صورة ترويجية',
    description: 'صورة ترويجية للمشروع',
    mediaType: 'image',
    category: 'promotional',
    file: {
      url: 'https://res.cloudinary.com/dvaz05tc6/image/upload/v1758706017/project24/gallery/media_1758706015748_o7wynunq4.jpg',
      publicId: 'test_image_3',
      originalName: 'promotional-image.jpg',
      fileSize: 950000,
      mimeType: 'image/jpeg',
      dimensions: {
        width: 800,
        height: 600
      }
    },
    alt: 'صورة ترويجية',
    tags: ['ترويجي', 'إعلان'],
    isActive: true,
    order: 3
  }
];

const testMediaUpload = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing media upload system...\n');
    
    // Clear existing test data
    await ProjectMedia.deleteMany({ 
      'file.publicId': { $regex: /^test_image_/ } 
    });
    console.log('🗑️  Cleared existing test data');
    
    // Insert test data
    const insertedMedia = await ProjectMedia.insertMany(testMediaData);
    console.log(`✅ Inserted ${insertedMedia.length} test media items`);
    
    // Test fetching project images
    const projectImages = await ProjectMedia.find({
      mediaType: 'image',
      isActive: true,
      category: { $in: ['project-photos', 'promotional'] }
    }).sort({ order: 1, createdAt: -1 });
    
    console.log(`📸 Found ${projectImages.length} project images`);
    
    // Display results
    projectImages.forEach((media, index) => {
      console.log(`\n${index + 1}. ${media.title}`);
      console.log(`   Category: ${media.category}`);
      console.log(`   URL: ${media.file.url}`);
      console.log(`   Tags: ${media.tags.join(', ')}`);
    });
    
    console.log('\n🎉 Media upload system test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the admin panel: cd admin-panel && npm run dev');
    console.log('3. Login to admin panel and go to /dashboard/media/upload');
    console.log('4. Upload some real images');
    console.log('5. Check the website to see uploaded images');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testMediaUpload();
