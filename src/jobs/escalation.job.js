const cron = require("node-cron");
const prisma = require("../config/db");

cron.schedule("*/5 * * * *", async () => {
  const pending = await prisma.booking.findMany({
    where: { status: "REQUESTED" }
  });

  if (pending.length) {
    console.log("Pending bookings:", pending.length);
  }
});
