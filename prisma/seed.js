// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');

// const prisma = new PrismaClient();

// async function main() {
//   // Create Tenants
//   const tenantA = await prisma.tenant.create({
//     data: {
//       name: "Flight School A"
//     }
//   });

//   const tenantB = await prisma.tenant.create({
//     data: {
//       name: "Flight School B"
//     }
//   });

//   // Hash password
//   const passwordHash = await bcrypt.hash("admin123", 10);

//   // Create Admin user in Tenant A
//   await prisma.user.create({
//     data: {
//       name: "Super Admin",
//       email: "admin@gmail.com",
//       passwordHash,
//       role: "ADMIN",
//       approved: true,
//       tenantId: tenantA.id
//     }
//   });

//   console.log("Seed completed");
// }

// main()
//   .catch(e => console.error(e))
//   .finally(() => prisma.$disconnect());


// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');

// const prisma = new PrismaClient();

// async function main() {

//   const tenantA = await prisma.tenant.create({
//     data: { name: "Flight School A" }
//   });

//   const passwordHash = await bcrypt.hash("12345678", 10);

//   await prisma.user.upsert({
//     where: { email: "admin@gmail.com" },
//     update: {},
//     create: {
//       name: "Super Admin",
//       email: "admin@gmail.com",
//       passwordHash,
//       role: "ADMIN",
//       approved: true,
//       tenantId: tenantA.id
//     }
//   });

//   await prisma.user.upsert({
//     where: { email: "instructor@gmail.com" },
//     update: {},
//     create: {
//       name: "Instructor One",
//       email: "instructor@gmail.com",
//       passwordHash,
//       role: "INSTRUCTOR",
//       approved: true,
//       tenantId: tenantA.id
//     }
//   });

//   await prisma.user.upsert({
//     where: { email: "student@gmail.com" },
//     update: {},
//     create: {
//       name: "Student One",
//       email: "student@gmail.com",
//       passwordHash,
//       role: "STUDENT",
//       approved: true,
//       tenantId: tenantA.id
//     }
//   });

//   console.log("Seed completed");
// }

// main()
//   .catch(e => console.error(e))
//   .finally(() => prisma.$disconnect());


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {

  // ---------- TENANT A ----------
  const tenantA = await prisma.tenant.upsert({
    where: { name: "Flight School A" },
    update: {},
    create: { name: "Flight School A" }
  });

  // ---------- TENANT B ----------
  const tenantB = await prisma.tenant.upsert({
    where: { name: "Flight School B" },
    update: {},
    create: { name: "Flight School B" }
  });

  const passwordHash = await bcrypt.hash("12345678", 10);

  // ---------- TENANT A USERS ----------
  await prisma.user.upsert({
    where: { email: "admina@gmail.com" },
    update: {},
    create: {
      name: "Admin A",
      email: "admina@gmail.com",
      passwordHash,
      role: "ADMIN",
      approved: true,
      tenantId: tenantA.id
    }
  });

  await prisma.user.upsert({
    where: { email: "instructora@gmail.com" },
    update: {},
    create: {
      name: "Instructor A",
      email: "instructora@gmail.com",
      passwordHash,
      role: "INSTRUCTOR",
      approved: true,
      tenantId: tenantA.id
    }
  });

  await prisma.user.upsert({
    where: { email: "studenta@gmail.com" },
    update: {},
    create: {
      name: "Student A",
      email: "studenta@gmail.com",
      passwordHash,
      role: "STUDENT",
      approved: true,
      tenantId: tenantA.id
    }
  });

  // ---------- TENANT B USERS ----------
  await prisma.user.upsert({
    where: { email: "adminb@gmail.com" },
    update: {},
    create: {
      name: "Admin B",
      email: "adminb@gmail.com",
      passwordHash,
      role: "ADMIN",
      approved: true,
      tenantId: tenantB.id
    }
  });

  await prisma.user.upsert({
    where: { email: "instructorb@gmail.com" },
    update: {},
    create: {
      name: "Instructor B",
      email: "instructorb@gmail.com",
      passwordHash,
      role: "INSTRUCTOR",
      approved: true,
      tenantId: tenantB.id
    }
  });

  await prisma.user.upsert({
    where: { email: "studentb@gmail.com" },
    update: {},
    create: {
      name: "Student B",
      email: "studentb@gmail.com",
      passwordHash,
      role: "STUDENT",
      approved: true,
      tenantId: tenantB.id
    }
  });

  console.log("Seed completed properly with two tenants");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
