import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration script to assign serial numbers to existing prescriptions
 * Run this once after adding the serialNumber field to Prescription model
 */
async function assignSerialNumbers() {
  console.log('🔄 Starting serial number assignment...');

  try {
    // Get all doctors with their prescriptions
    const doctors = await prisma.doctor.findMany({
      include: {
        prescriptions: {
          orderBy: { createdAt: 'asc' }, // Oldest first
        },
      },
    });

    console.log(`📋 Found ${doctors.length} doctors`);

    for (const doctor of doctors) {
      if (doctor.prescriptions.length === 0) {
        console.log(`⏭️  Skipping doctor ${doctor.fullName} (${doctor.email}) - no prescriptions`);
        continue;
      }

      console.log(`\n👨‍⚕️ Processing doctor: ${doctor.fullName} (${doctor.email})`);
      console.log(`   Found ${doctor.prescriptions.length} prescriptions`);

      // Assign serial numbers in order of creation
      for (let i = 0; i < doctor.prescriptions.length; i++) {
        const prescription = doctor.prescriptions[i];
        const serialNumber = i + 1;

        await prisma.prescription.update({
          where: { id: prescription.id },
          data: { serialNumber },
        });

        console.log(`   ✅ Prescription ${prescription.id.substring(0, 8)}... assigned serial #${serialNumber}`);
      }

      // Update doctor's lastPrescriptionSerial
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { lastPrescriptionSerial: doctor.prescriptions.length },
      });

      console.log(`   📊 Updated doctor's lastPrescriptionSerial to ${doctor.prescriptions.length}`);
    }

    console.log('\n✅ Serial number assignment completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   Total doctors processed: ${doctors.length}`);
    console.log(`   Total prescriptions updated: ${doctors.reduce((sum, d) => sum + d.prescriptions.length, 0)}`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
assignSerialNumbers()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
