const mongoose = require("mongoose");
const Junction = require("../models/Junction");
const Signal = require("../models/Signal");
require("dotenv").config();

const junctions = [
  { name: "DB Mall Crossing",        lat: 23.2332, lon: 77.4272, x: 300, y: 150 },
  { name: "Roshanpura Square",       lat: 23.2291, lon: 77.4017, x: 150, y: 250 },
  { name: "MP Nagar Zone-1",         lat: 23.2189, lon: 77.4320, x: 300, y: 280 },
  { name: "Bittan Market Crossing",  lat: 23.2367, lon: 77.4598, x: 480, y: 180 },
  { name: "Habibganj Crossing",      lat: 23.2304, lon: 77.4384, x: 380, y: 320 },
  { name: "10 No. Market Square",    lat: 23.2501, lon: 77.4012, x: 150, y: 120 },
  { name: "Jehangirabad Crossing",   lat: 23.2648, lon: 77.4104, x: 180, y: 80  },
  { name: "Arera Colony T-Point",    lat: 23.2143, lon: 77.4456, x: 430, y: 380 },
];

const directions = ["north", "south", "east", "west"];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear old data
  await Junction.deleteMany({});
  await Signal.deleteMany({});
  console.log("🗑️  Cleared old data");

  // Insert junctions + signals
  for (const j of junctions) {
    const junction = await Junction.create({
      name: j.name,
      location: { latitude: j.lat, longitude: j.lon },
      x_pos: j.x,
      y_pos: j.y,
    });

    for (const dir of directions) {
      await Signal.create({
        junction: junction._id,
        direction: dir,
        phase: "red",
        greenDuration: 30,
        redDuration: 60,
      });
    }

    console.log(`✅ Created: ${j.name}`);
  }

  console.log("\n🚦 Seed complete — 6 junctions, 24 signals");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});