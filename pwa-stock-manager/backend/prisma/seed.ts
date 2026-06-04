import { PrismaClient, Role } from '@prisma/client';
import { HashUtil } from '../src/utils/hash.util';
import config from '../src/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - be careful in production!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.item.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create default admin user
  console.log('👤 Creating default admin user...');
  const adminPassword = await HashUtil.hashPassword(config.DEFAULT_ADMIN_PASSWORD);
  
  const adminUser = await prisma.user.upsert({
    where: { email: config.DEFAULT_ADMIN_EMAIL },
    update: {},
    create: {
      fullName: config.DEFAULT_ADMIN_NAME,
      email: config.DEFAULT_ADMIN_EMAIL,
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Create test normal user
  console.log('👥 Creating test normal user...');
  const normalUserPassword = await HashUtil.hashPassword('User@123');
  
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@stock.com' },
    update: {},
    create: {
      fullName: 'Test User',
      email: 'user@stock.com',
      password: normalUserPassword,
      role: Role.NORMAL_USER,
      isActive: true,
    },
  });

  // Create categories
  console.log('📁 Creating categories...');
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and components' },
    { name: 'Office Supplies', description: 'Office stationery and supplies' },
    { name: 'Furniture', description: 'Office furniture and equipment' },
    { name: 'IT Equipment', description: 'Computers, servers, and networking gear' },
    { name: 'Consumables', description: 'Disposable supplies and materials' },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: {
        ...categoryData,
        createdBy: adminUser.id,
      },
    });
  }

  // Get all categories
  const allCategories = await prisma.category.findMany();

  // Create sample items
  console.log('📦 Creating sample items...');
  const items = [
    {
      sku: 'LAPTOP-001',
      name: 'Dell XPS 13 Laptop',
      description: '13-inch business laptop with 16GB RAM, 512GB SSD',
      categoryId: allCategories.find(c => c.name === 'IT Equipment')?.id || '',
      quantity: 15,
      minimumStock: 5,
      unitPrice: 1299.99,
      location: 'Warehouse A, Shelf 3',
    },
    {
      sku: 'MON-002',
      name: 'LG 27-inch Monitor',
      description: '27-inch 4K Ultra HD monitor with IPS panel',
      categoryId: allCategories.find(c => c.name === 'IT Equipment')?.id || '',
      quantity: 25,
      minimumStock: 10,
      unitPrice: 299.99,
      location: 'Warehouse A, Shelf 5',
    },
    {
      sku: 'DESK-003',
      name: 'Ergonomic Office Desk',
      description: 'Adjustable height standing desk',
      categoryId: allCategories.find(c => c.name === 'Furniture')?.id || '',
      quantity: 8,
      minimumStock: 3,
      unitPrice: 499.99,
      location: 'Warehouse B, Area 2',
    },
    {
      sku: 'PEN-004',
      name: 'Premium Ballpoint Pens',
      description: 'Pack of 12 blue ink ballpoint pens',
      categoryId: allCategories.find(c => c.name === 'Office Supplies')?.id || '',
      quantity: 120,
      minimumStock: 50,
      unitPrice: 9.99,
      location: 'Warehouse C, Bin 7',
    },
    {
      sku: 'PHONE-005',
      name: 'Cisco IP Phone',
      description: 'Business VoIP desk phone',
      categoryId: allCategories.find(c => c.name === 'IT Equipment')?.id || '',
      quantity: 2,
      minimumStock: 5,
      unitPrice: 199.99,
      location: 'Warehouse A, Shelf 1',
    },
    {
      sku: 'PAPER-006',
      name: 'A4 Printer Paper',
      description: 'Ream of 500 sheets, 80gsm',
      categoryId: allCategories.find(c => c.name === 'Office Supplies')?.id || '',
      quantity: 45,
      minimumStock: 20,
      unitPrice: 4.99,
      location: 'Warehouse C, Bin 12',
    },
    {
      sku: 'ROUTER-007',
      name: 'TP-Link WiFi Router',
      description: 'Dual-band WiFi 6 router',
      categoryId: allCategories.find(c => c.name === 'IT Equipment')?.id || '',
      quantity: 12,
      minimumStock: 5,
      unitPrice: 89.99,
      location: 'Warehouse A, Shelf 4',
    },
    {
      sku: 'CHAIR-008',
      name: 'Ergonomic Office Chair',
      description: 'Adjustable office chair with lumbar support',
      categoryId: allCategories.find(c => c.name === 'Furniture')?.id || '',
      quantity: 6,
      minimumStock: 4,
      unitPrice: 349.99,
      location: 'Warehouse B, Area 3',
    },
  ];

  for (const itemData of items) {
    await prisma.item.upsert({
      where: { sku: itemData.sku },
      update: {},
      create: {
        ...itemData,
        createdBy: adminUser.id,
      },
    });
  }

  // Get all items
  const allItems = await prisma.item.findMany();

  // Create sample stock movements
  console.log('📊 Creating sample stock movements...');
  const movements = [
    {
      itemId: allItems.find(i => i.sku === 'LAPTOP-001')?.id || '',
      type: 'IN' as const,
      quantity: 10,
      reason: 'Initial stock purchase',
      createdBy: adminUser.id,
    },
    {
      itemId: allItems.find(i => i.sku === 'LAPTOP-001')?.id || '',
      type: 'IN' as const,
      quantity: 5,
      reason: 'Additional stock',
      createdBy: adminUser.id,
    },
    {
      itemId: allItems.find(i => i.sku === 'LAPTOP-001')?.id || '',
      type: 'OUT' as const,
      quantity: 3,
      reason: 'Issued to sales department',
      createdBy: normalUser.id,
    },
    {
      itemId: allItems.find(i => i.sku === 'MON-002')?.id || '',
      type: 'IN' as const,
      quantity: 20,
      reason: 'Bulk purchase for new office',
      createdBy: adminUser.id,
    },
    {
      itemId: allItems.find(i => i.sku === 'MON-002')?.id || '',
      type: 'IN' as const,
      quantity: 5,
      reason: 'Replacement stock',
      createdBy: adminUser.id,
    },
    {
      itemId: allItems.find(i => i.sku === 'MON-002')?.id || '',
      type: 'OUT' as const,
      quantity: 2,
      reason: 'Issued to IT department',
      createdBy: normalUser.id,
    },
    {
      itemId: allItems.find(i => i.sku === 'PHONE-005')?.id || '',
      type: 'ADJUSTMENT' as const,
      quantity: 2,
      reason: 'Corrected inventory count',
      createdBy: adminUser.id,
    },
  ];

  for (const movementData of movements) {
    await prisma.stockMovement.create({
      data: movementData,
    });
  }

  // Create audit log entries
  console.log('📝 Creating audit log entries...');
  await prisma.auditLog.create({
    data: {
      action: 'SEED_DATABASE',
      entityType: 'SYSTEM',
      userId: adminUser.id,
      details: { message: 'Database seeded with initial data' },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('🔑 Admin credentials:');
  console.log(`   Email: ${config.DEFAULT_ADMIN_EMAIL}`);
  console.log(`   Password: ${config.DEFAULT_ADMIN_PASSWORD}`);
  console.log('\n🔑 Normal user credentials:');
  console.log('   Email: user@stock.com');
  console.log('   Password: User@123');
  console.log('\n📊 Seed statistics:');
  console.log(`   Users: 2`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Items: ${items.length}`);
  console.log(`   Stock Movements: ${movements.length}`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });