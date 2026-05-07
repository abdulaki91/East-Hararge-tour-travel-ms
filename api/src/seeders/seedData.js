import bcrypt from "bcryptjs";
import pool from "../config/database.js";

// Helper function to generate booking reference
const generateBookingReference = () => {
  return (
    "BK" +
    Date.now().toString().slice(-8) +
    Math.random().toString(36).substr(2, 4).toUpperCase()
  );
};

// Helper function to generate transaction reference
const generateTransactionReference = () => {
  return (
    "TXN" +
    Date.now().toString() +
    Math.random().toString(36).substr(2, 6).toUpperCase()
  );
};

export const seedDatabase = async () => {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (in reverse order of dependencies)
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE notifications");
    await connection.execute("TRUNCATE TABLE reviews");
    await connection.execute("TRUNCATE TABLE payments");
    await connection.execute("TRUNCATE TABLE bookings");
    await connection.execute("TRUNCATE TABLE packages");
    await connection.execute("TRUNCATE TABLE companies");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    // Seed Users
    await seedUsers(connection);

    // Seed Companies
    await seedCompanies(connection);

    // Seed Packages
    await seedPackages(connection);

    // Seed Bookings
    await seedBookings(connection);

    // Seed Payments
    await seedPayments(connection);

    // Seed Reviews
    await seedReviews(connection);

    // Seed Notifications
    await seedNotifications(connection);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  } finally {
    connection.release();
  }
};
// Seed Users
const seedUsers = async (connection) => {
  console.log("👥 Seeding users...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    // Admin User
    {
      email: "admin@tourtravel.com",
      password: hashedPassword,
      first_name: "System",
      last_name: "Administrator",
      phone: "+1234567890",
      role_id: 3,
      is_active: true,
      email_verified: true,
    },

    // Company Users
    {
      email: "bali@adventures.com",
      password: hashedPassword,
      first_name: "Made",
      last_name: "Sutrisna",
      phone: "+62812345678",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "paris@tours.com",
      password: hashedPassword,
      first_name: "Pierre",
      last_name: "Dubois",
      phone: "+33123456789",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "safari@kenya.com",
      password: hashedPassword,
      first_name: "James",
      last_name: "Mwangi",
      phone: "+254712345678",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "tokyo@experiences.com",
      password: hashedPassword,
      first_name: "Hiroshi",
      last_name: "Tanaka",
      phone: "+81312345678",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "egypt@tours.com",
      password: hashedPassword,
      first_name: "Ahmed",
      last_name: "Hassan",
      phone: "+201234567890",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },

    // Regular Users
    {
      email: "john.doe@email.com",
      password: hashedPassword,
      first_name: "John",
      last_name: "Doe",
      phone: "+1555123456",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "sarah.wilson@email.com",
      password: hashedPassword,
      first_name: "Sarah",
      last_name: "Wilson",
      phone: "+1555234567",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "mike.johnson@email.com",
      password: hashedPassword,
      first_name: "Mike",
      last_name: "Johnson",
      phone: "+1555345678",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "emma.brown@email.com",
      password: hashedPassword,
      first_name: "Emma",
      last_name: "Brown",
      phone: "+1555456789",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "david.garcia@email.com",
      password: hashedPassword,
      first_name: "David",
      last_name: "Garcia",
      phone: "+1555567890",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
  ];

  for (const user of users) {
    await connection.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone, role_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.email,
        user.password,
        user.first_name,
        user.last_name,
        user.phone,
        user.role_id,
        user.is_active,
        user.email_verified,
      ],
    );
  }

  console.log(`✅ Seeded ${users.length} users`);
};
// Seed Companies
const seedCompanies = async (connection) => {
  console.log("🏢 Seeding companies...");

  const companies = [
    {
      user_id: 2, // bali@adventures.com
      company_name: "Bali Adventures Co.",
      description:
        "Premier tour operator in Bali offering authentic cultural experiences, adventure tours, and luxury accommodations. We specialize in creating unforgettable memories with our expert local guides.",
      address: "Jl. Raya Ubud No. 123, Ubud, Bali 80571, Indonesia",
      phone: "+62812345678",
      email: "info@baliadventures.com",
      website: "https://baliadventures.com",
      license_number: "BALI-TOUR-2023-001",
      is_verified: true,
    },
    {
      user_id: 3, // paris@tours.com
      company_name: "Paris Elite Tours",
      description:
        "Luxury travel experiences in the City of Light. From romantic getaways to cultural immersions, we offer exclusive access to Paris's hidden gems and iconic landmarks.",
      address: "15 Rue de la Paix, 75002 Paris, France",
      phone: "+33123456789",
      email: "contact@pariselitetours.fr",
      website: "https://pariselitetours.fr",
      license_number: "FR-TOUR-2023-002",
      is_verified: true,
    },
    {
      user_id: 4, // safari@kenya.com
      company_name: "Kenya Safari Experts",
      description:
        "Award-winning safari company with over 20 years of experience. We offer authentic wildlife experiences in Kenya's most pristine national parks and conservancies.",
      address: "Westlands Road, Nairobi 00100, Kenya",
      phone: "+254712345678",
      email: "info@kenyasafariexperts.com",
      website: "https://kenyasafariexperts.com",
      license_number: "KE-SAFARI-2023-003",
      is_verified: true,
    },
    {
      user_id: 5, // tokyo@experiences.com
      company_name: "Tokyo Cultural Experiences",
      description:
        "Immerse yourself in authentic Japanese culture with our carefully curated experiences. From traditional tea ceremonies to modern city adventures.",
      address: "1-1-1 Shibuya, Shibuya City, Tokyo 150-0002, Japan",
      phone: "+81312345678",
      email: "hello@tokyoexperiences.jp",
      website: "https://tokyoexperiences.jp",
      license_number: "JP-TOUR-2023-004",
      is_verified: true,
    },
    {
      user_id: 6, // egypt@tours.com
      company_name: "Pharaoh's Legacy Tours",
      description:
        "Discover the mysteries of ancient Egypt with our expert Egyptologists. We offer exclusive access to archaeological sites and luxury Nile cruises.",
      address: "Corniche El Nil, Cairo 11511, Egypt",
      phone: "+201234567890",
      email: "info@pharaohslegacy.com",
      website: "https://pharaohslegacy.com",
      license_number: "EG-TOUR-2023-005",
      is_verified: true,
    },
  ];

  for (const company of companies) {
    await connection.execute(
      `INSERT INTO companies (user_id, company_name, description, address, phone, email, website, license_number, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company.user_id,
        company.company_name,
        company.description,
        company.address,
        company.phone,
        company.email,
        company.website,
        company.license_number,
        company.is_verified,
      ],
    );
  }

  console.log(`✅ Seeded ${companies.length} companies`);
};
// Seed Packages
const seedPackages = async (connection) => {
  console.log("📦 Seeding packages...");

  const packages = [
    // Bali Adventures Co. packages
    {
      company_id: 1,
      title: "7-Day Bali Cultural Adventure",
      description:
        "Immerse yourself in the rich culture of Bali with this comprehensive 7-day journey. Visit ancient temples, experience traditional ceremonies, learn Balinese cooking, and relax on pristine beaches. This package includes stays in both Ubud's cultural heart and Seminyak's beach paradise.",
      location: "Bali, Indonesia",
      duration_days: 7,
      price: 1299.0,
      max_people: 12,
      available_slots: 8,
      start_date: "2024-06-01",
      end_date: "2024-12-31",
      includes:
        "Airport transfers, 6 nights accommodation (3 nights Ubud, 3 nights Seminyak), Daily breakfast, 4 lunches, 3 dinners, Temple tours, Cooking class, Traditional dance show, Spa treatment, English-speaking guide",
      excludes:
        "International flights, Travel insurance, Personal expenses, Alcoholic beverages, Tips for guides and drivers",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Arrival in Bali",
          description:
            "Airport pickup and transfer to Ubud. Welcome dinner with traditional Balinese cuisine.",
          activities: ["Airport transfer", "Hotel check-in", "Welcome dinner"],
        },
        {
          day: 2,
          title: "Ubud Temple Tour",
          description:
            "Visit Tirta Empul holy water temple and Tegenungan waterfall. Afternoon cooking class.",
          activities: ["Temple visit", "Waterfall tour", "Cooking class"],
        },
        {
          day: 3,
          title: "Rice Terraces & Art Villages",
          description:
            "Explore Jatiluwih rice terraces and traditional art villages of Mas and Celuk.",
          activities: [
            "Rice terraces",
            "Wood carving village",
            "Silver jewelry workshop",
          ],
        },
        {
          day: 4,
          title: "Transfer to Seminyak",
          description:
            "Morning spa treatment, then transfer to beach resort in Seminyak.",
          activities: [
            "Spa treatment",
            "Beach resort check-in",
            "Sunset beach walk",
          ],
        },
        {
          day: 5,
          title: "Beach Day & Water Sports",
          description:
            "Free day at the beach with optional water sports activities.",
          activities: ["Beach relaxation", "Water sports", "Beach club lunch"],
        },
        {
          day: 6,
          title: "Tanah Lot & Shopping",
          description:
            "Visit iconic Tanah Lot temple and enjoy shopping in Seminyak.",
          activities: ["Tanah Lot temple", "Shopping tour", "Farewell dinner"],
        },
        {
          day: 7,
          title: "Departure",
          description: "Free morning, then airport transfer for departure.",
          activities: ["Free time", "Airport transfer"],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800",
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800",
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
      ]),
      is_active: true,
    },
    {
      company_id: 1,
      title: "4-Day Bali Adventure & Volcano Trek",
      description:
        "Perfect for adventure seekers! Trek Mount Batur volcano for sunrise, explore hidden waterfalls, and experience white water rafting through tropical landscapes.",
      location: "Bali, Indonesia",
      duration_days: 4,
      price: 699.0,
      max_people: 8,
      available_slots: 6,
      start_date: "2024-05-15",
      end_date: "2024-11-30",
      includes:
        "Airport transfers, 3 nights accommodation, Daily breakfast, 2 lunches, 1 dinner, Mount Batur sunrise trek, White water rafting, Waterfall tour, Professional guide",
      excludes:
        "International flights, Travel insurance, Personal expenses, Additional meals, Tips",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Arrival & Waterfall Tour",
          description: "Airport pickup and visit to Sekumpul waterfall.",
          activities: ["Airport transfer", "Waterfall trek", "Hotel check-in"],
        },
        {
          day: 2,
          title: "Mount Batur Sunrise Trek",
          description:
            "Early morning volcano trek to watch sunrise from the summit.",
          activities: [
            "2 AM pickup",
            "Volcano trek",
            "Sunrise viewing",
            "Hot springs",
          ],
        },
        {
          day: 3,
          title: "White Water Rafting",
          description: "Thrilling rafting adventure on Ayung River.",
          activities: [
            "Rafting adventure",
            "Jungle lunch",
            "Traditional village visit",
          ],
        },
        {
          day: 4,
          title: "Departure",
          description: "Free morning and airport transfer.",
          activities: ["Free time", "Airport transfer"],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      ]),
      is_active: true,
    },

    // Paris Elite Tours packages
    {
      company_id: 2,
      title: "5-Day Paris Romantic Getaway",
      description:
        "Fall in love with Paris all over again. This romantic package includes luxury accommodations, private Seine river cruise, exclusive wine tasting, and intimate dining experiences at hidden gems known only to locals.",
      location: "Paris, France",
      duration_days: 5,
      price: 1899.0,
      max_people: 6,
      available_slots: 4,
      start_date: "2024-05-01",
      end_date: "2024-10-31",
      includes:
        "Airport transfers, 4 nights luxury hotel, Daily breakfast, 2 romantic dinners, Private Seine cruise, Wine tasting, Louvre skip-the-line tickets, Professional guide",
      excludes:
        "International flights, Travel insurance, Lunch meals, Personal shopping, Tips",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Arrival in City of Love",
          description:
            "Airport transfer to luxury hotel, evening Seine river cruise with champagne.",
          activities: [
            "Airport transfer",
            "Hotel check-in",
            "Seine cruise",
            "Champagne toast",
          ],
        },
        {
          day: 2,
          title: "Art & Culture",
          description:
            "Private Louvre tour and stroll through Montmartre district.",
          activities: [
            "Louvre museum",
            "Montmartre walk",
            "Sacré-Cœur visit",
            "Artist quarter",
          ],
        },
        {
          day: 3,
          title: "Wine & Dine",
          description:
            "Wine tasting in historic cellar and romantic dinner at Michelin-starred restaurant.",
          activities: [
            "Wine cellar tour",
            "Tasting session",
            "Michelin dinner",
            "Night walk",
          ],
        },
        {
          day: 4,
          title: "Palace & Gardens",
          description: "Day trip to Versailles Palace and gardens.",
          activities: [
            "Versailles tour",
            "Palace gardens",
            "Marie Antoinette estate",
            "Royal chapel",
          ],
        },
        {
          day: 5,
          title: "Au Revoir Paris",
          description: "Free morning for shopping, then airport transfer.",
          activities: ["Shopping time", "Café visit", "Airport transfer"],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800",
        "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800",
        "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800",
      ]),
      is_active: true,
    },
    {
      company_id: 2,
      title: "3-Day Paris Art & History Tour",
      description:
        "Discover Paris through the eyes of artists and historians. Visit world-class museums, historic neighborhoods, and hidden artistic treasures.",
      location: "Paris, France",
      duration_days: 3,
      price: 899.0,
      max_people: 10,
      available_slots: 7,
      start_date: "2024-04-01",
      end_date: "2024-12-15",
      includes:
        "Airport transfers, 2 nights boutique hotel, Daily breakfast, Museum passes, Walking tours, Art workshop, Professional art historian guide",
      excludes:
        "International flights, Lunch and dinner, Personal expenses, Shopping",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Classic Art Masters",
          description: "Louvre and Orsay museums with expert guide.",
          activities: ["Louvre tour", "Orsay museum", "Latin Quarter walk"],
        },
        {
          day: 2,
          title: "Modern Art & Bohemian Paris",
          description: "Pompidou Centre and Montmartre artistic heritage.",
          activities: ["Pompidou Centre", "Montmartre tour", "Art workshop"],
        },
        {
          day: 3,
          title: "Hidden Artistic Gems",
          description: "Lesser-known museums and artist studios.",
          activities: ["Rodin Museum", "Artist studios", "Marais district"],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800",
        "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800",
      ]),
      is_active: true,
    },

    // Kenya Safari Experts packages
    {
      company_id: 3,
      title: "6-Day Masai Mara Safari Adventure",
      description:
        "Experience the ultimate African safari in the world-famous Masai Mara. Witness the Great Migration, encounter the Big Five, and immerse yourself in Masai culture. Stay in luxury tented camps with stunning savanna views.",
      location: "Masai Mara, Kenya",
      duration_days: 6,
      price: 2799.0,
      max_people: 8,
      available_slots: 5,
      start_date: "2024-07-01",
      end_date: "2024-03-31",
      includes:
        "Airport transfers, 5 nights luxury tented camp, All meals, Game drives, Masai village visit, Professional safari guide, Park fees, Binoculars",
      excludes:
        "International flights, Travel insurance, Alcoholic beverages, Personal expenses, Tips for guide and staff",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Arrival & First Game Drive",
          description: "Fly from Nairobi to Masai Mara, afternoon game drive.",
          activities: [
            "Flight to Mara",
            "Camp check-in",
            "Afternoon game drive",
            "Sundowner drinks",
          ],
        },
        {
          day: 2,
          title: "Full Day Safari",
          description:
            "Full day exploring the Mara with picnic lunch in the wild.",
          activities: [
            "Morning game drive",
            "Picnic lunch",
            "Afternoon game drive",
            "Wildlife photography",
          ],
        },
        {
          day: 3,
          title: "Great Migration Experience",
          description:
            "Witness the spectacular wildebeest migration (seasonal).",
          activities: [
            "Migration viewing",
            "River crossing",
            "Predator tracking",
            "Bush breakfast",
          ],
        },
        {
          day: 4,
          title: "Masai Cultural Experience",
          description:
            "Visit authentic Masai village and learn traditional customs.",
          activities: [
            "Village visit",
            "Cultural ceremony",
            "Traditional lunch",
            "Craft workshop",
          ],
        },
        {
          day: 5,
          title: "Big Five Quest",
          description: "Dedicated day to spot all members of the Big Five.",
          activities: [
            "Early morning drive",
            "Big Five tracking",
            "Photography session",
            "Farewell dinner",
          ],
        },
        {
          day: 6,
          title: "Departure",
          description: "Final game drive and flight back to Nairobi.",
          activities: [
            "Morning game drive",
            "Flight to Nairobi",
            "Airport transfer",
          ],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
        "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800",
      ]),
      is_active: true,
    },
    {
      company_id: 3,
      title: "4-Day Amboseli Elephant Safari",
      description:
        "Focus on Kenya's gentle giants in Amboseli National Park with stunning views of Mount Kilimanjaro. Perfect for elephant enthusiasts and photographers.",
      location: "Amboseli, Kenya",
      duration_days: 4,
      price: 1599.0,
      max_people: 6,
      available_slots: 4,
      start_date: "2024-06-01",
      end_date: "2024-12-31",
      includes:
        "Airport transfers, 3 nights safari lodge, All meals, Game drives, Elephant research center visit, Professional guide, Park fees",
      excludes:
        "International flights, Travel insurance, Personal expenses, Tips",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Journey to Amboseli",
          description:
            "Drive from Nairobi to Amboseli with game viewing en route.",
          activities: [
            "Nairobi departure",
            "Scenic drive",
            "Lodge check-in",
            "Afternoon game drive",
          ],
        },
        {
          day: 2,
          title: "Elephant Paradise",
          description:
            "Full day dedicated to elephant observation and photography.",
          activities: [
            "Dawn elephant viewing",
            "Research center visit",
            "Photography workshop",
            "Sunset game drive",
          ],
        },
        {
          day: 3,
          title: "Kilimanjaro Views",
          description:
            "Early morning game drive with Mount Kilimanjaro backdrop.",
          activities: [
            "Sunrise game drive",
            "Kilimanjaro photography",
            "Masai village visit",
            "Cultural lunch",
          ],
        },
        {
          day: 4,
          title: "Return to Nairobi",
          description: "Final game drive and return journey to Nairobi.",
          activities: [
            "Morning game drive",
            "Lodge checkout",
            "Return to Nairobi",
          ],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
      ]),
      is_active: true,
    },

    // Tokyo Cultural Experiences packages
    {
      company_id: 4,
      title: "5-Day Tokyo Traditional & Modern Experience",
      description:
        "Perfect blend of ancient traditions and cutting-edge modernity. Experience authentic tea ceremonies, visit historic temples, explore futuristic districts, and enjoy world-class cuisine.",
      location: "Tokyo, Japan",
      duration_days: 5,
      price: 1699.0,
      max_people: 10,
      available_slots: 8,
      start_date: "2024-04-01",
      end_date: "2024-11-30",
      includes:
        "Airport transfers, 4 nights traditional ryokan + modern hotel, Daily breakfast, 3 traditional dinners, Tea ceremony, Sushi making class, Temple tours, English-speaking guide",
      excludes:
        "International flights, Travel insurance, Lunch meals, Personal shopping, JR Pass",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Traditional Tokyo",
          description: "Arrive and experience old Tokyo in Asakusa district.",
          activities: [
            "Airport transfer",
            "Senso-ji Temple",
            "Traditional lunch",
            "Ryokan check-in",
          ],
        },
        {
          day: 2,
          title: "Cultural Immersion",
          description: "Tea ceremony and traditional arts experience.",
          activities: [
            "Tea ceremony",
            "Calligraphy class",
            "Imperial Palace gardens",
            "Kaiseki dinner",
          ],
        },
        {
          day: 3,
          title: "Modern Tokyo",
          description: "Explore futuristic Shibuya and Harajuku districts.",
          activities: [
            "Shibuya crossing",
            "Harajuku fashion",
            "Modern hotel check-in",
            "Robot restaurant",
          ],
        },
        {
          day: 4,
          title: "Culinary Journey",
          description: "Tsukiji market tour and sushi making experience.",
          activities: [
            "Fish market tour",
            "Sushi class",
            "Ginza shopping",
            "Farewell dinner",
          ],
        },
        {
          day: 5,
          title: "Sayonara Tokyo",
          description: "Final temple visit and departure.",
          activities: [
            "Meiji Shrine",
            "Last-minute shopping",
            "Airport transfer",
          ],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
        "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800",
        "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800",
      ]),
      is_active: true,
    },

    // Pharaoh's Legacy Tours packages
    {
      company_id: 5,
      title: "8-Day Ancient Egypt Discovery",
      description:
        "Journey through 5000 years of history. Explore the Pyramids of Giza, cruise the Nile, discover Luxor's treasures, and uncover the mysteries of ancient pharaohs with expert Egyptologists.",
      location: "Cairo & Luxor, Egypt",
      duration_days: 8,
      price: 2299.0,
      max_people: 12,
      available_slots: 9,
      start_date: "2024-10-01",
      end_date: "2024-04-30",
      includes:
        "Airport transfers, 3 nights Cairo hotel, 4 nights Nile cruise, All meals on cruise, Daily breakfast in Cairo, Pyramid tours, Valley of Kings, Professional Egyptologist guide, All entrance fees",
      excludes:
        "International flights, Travel insurance, Lunch/dinner in Cairo, Personal expenses, Tips, Optional hot air balloon",
      itinerary: JSON.stringify([
        {
          day: 1,
          title: "Arrival in Cairo",
          description:
            "Welcome to the land of pharaohs. Evening Nile dinner cruise.",
          activities: [
            "Airport transfer",
            "Hotel check-in",
            "Nile dinner cruise",
            "Welcome briefing",
          ],
        },
        {
          day: 2,
          title: "Pyramids & Sphinx",
          description: "Explore the last wonder of the ancient world.",
          activities: [
            "Giza Pyramids",
            "Great Sphinx",
            "Solar Boat Museum",
            "Papyrus institute",
          ],
        },
        {
          day: 3,
          title: "Egyptian Museum & Old Cairo",
          description: "Treasures of Tutankhamun and Coptic Cairo.",
          activities: [
            "Egyptian Museum",
            "Tutankhamun treasures",
            "Coptic Cairo",
            "Khan el-Khalili bazaar",
          ],
        },
        {
          day: 4,
          title: "Fly to Luxor & Cruise",
          description: "Begin your Nile cruise adventure.",
          activities: [
            "Flight to Luxor",
            "Cruise embarkation",
            "Luxor Temple",
            "Karnak Temple",
          ],
        },
        {
          day: 5,
          title: "Valley of Kings",
          description: "Explore royal tombs and Queen Hatshepsut temple.",
          activities: [
            "Valley of Kings",
            "Hatshepsut Temple",
            "Colossi of Memnon",
            "Sail to Edfu",
          ],
        },
        {
          day: 6,
          title: "Edfu & Kom Ombo",
          description: "Best-preserved temples in Egypt.",
          activities: [
            "Edfu Temple",
            "Horse carriage ride",
            "Kom Ombo Temple",
            "Crocodile museum",
          ],
        },
        {
          day: 7,
          title: "Aswan Highlights",
          description: "Philae Temple and Nubian culture.",
          activities: [
            "High Dam",
            "Philae Temple",
            "Nubian village",
            "Felucca sailing",
          ],
        },
        {
          day: 8,
          title: "Return to Cairo",
          description: "Flight back to Cairo and departure.",
          activities: [
            "Flight to Cairo",
            "Last-minute shopping",
            "Airport transfer",
          ],
        },
      ]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800",
        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800",
        "https://images.unsplash.com/photo-1471919743851-c4df8b6ee133?w=800",
      ]),
      is_active: true,
    },
  ];

  for (const pkg of packages) {
    await connection.execute(
      `INSERT INTO packages (company_id, title, description, location, duration_days, price, max_people, available_slots, start_date, end_date, includes, excludes, itinerary, images, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pkg.company_id,
        pkg.title,
        pkg.description,
        pkg.location,
        pkg.duration_days,
        pkg.price,
        pkg.max_people,
        pkg.available_slots,
        pkg.start_date,
        pkg.end_date,
        pkg.includes,
        pkg.excludes,
        pkg.itinerary,
        pkg.images,
        pkg.is_active,
      ],
    );
  }

  console.log(`✅ Seeded ${packages.length} packages`);
};
// Seed Bookings
const seedBookings = async (connection) => {
  console.log("📅 Seeding bookings...");

  const bookings = [
    {
      user_id: 7, // john.doe@email.com
      package_id: 1, // 7-Day Bali Cultural Adventure
      booking_reference: generateBookingReference(),
      number_of_people: 2,
      total_amount: 2598.0, // 1299 * 2
      booking_date: "2024-07-15",
      status: "confirmed",
      special_requests: "Vegetarian meals preferred. Celebrating anniversary.",
    },
    {
      user_id: 8, // sarah.wilson@email.com
      package_id: 3, // 5-Day Paris Romantic Getaway
      booking_reference: generateBookingReference(),
      number_of_people: 2,
      total_amount: 3798.0, // 1899 * 2
      booking_date: "2024-08-20",
      status: "confirmed",
      special_requests:
        "Honeymoon trip. Would appreciate room upgrade if possible.",
    },
    {
      user_id: 9, // mike.johnson@email.com
      package_id: 5, // 6-Day Masai Mara Safari Adventure
      booking_reference: generateBookingReference(),
      number_of_people: 1,
      total_amount: 2799.0,
      booking_date: "2024-09-10",
      status: "completed",
      special_requests:
        "Photography enthusiast. Interested in early morning game drives.",
    },
    {
      user_id: 10, // emma.brown@email.com
      package_id: 7, // 5-Day Tokyo Traditional & Modern Experience
      booking_reference: generateBookingReference(),
      number_of_people: 1,
      total_amount: 1699.0,
      booking_date: "2024-10-05",
      status: "confirmed",
      special_requests: "First time in Japan. Very excited about tea ceremony.",
    },
    {
      user_id: 11, // david.garcia@email.com
      package_id: 8, // 8-Day Ancient Egypt Discovery
      booking_reference: generateBookingReference(),
      number_of_people: 3,
      total_amount: 6897.0, // 2299 * 3
      booking_date: "2024-11-12",
      status: "pending",
      special_requests:
        "Family trip with teenage son. Interested in history and archaeology.",
    },
    {
      user_id: 7, // john.doe@email.com (second booking)
      package_id: 4, // 3-Day Paris Art & History Tour
      booking_reference: generateBookingReference(),
      number_of_people: 2,
      total_amount: 1798.0, // 899 * 2
      booking_date: "2024-12-01",
      status: "confirmed",
      special_requests:
        "Art lovers. Would like recommendations for local galleries.",
    },
    {
      user_id: 8, // sarah.wilson@email.com (second booking)
      package_id: 2, // 4-Day Bali Adventure & Volcano Trek
      booking_reference: generateBookingReference(),
      number_of_people: 2,
      total_amount: 1398.0, // 699 * 2
      booking_date: "2024-06-25",
      status: "completed",
      special_requests: "Adventure seekers. Both have hiking experience.",
    },
  ];

  for (const booking of bookings) {
    await connection.execute(
      `INSERT INTO bookings (user_id, package_id, booking_reference, number_of_people, total_amount, booking_date, status, special_requests) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.user_id,
        booking.package_id,
        booking.booking_reference,
        booking.number_of_people,
        booking.total_amount,
        booking.booking_date,
        booking.status,
        booking.special_requests,
      ],
    );
  }

  console.log(`✅ Seeded ${bookings.length} bookings`);
};
// Seed Payments
const seedPayments = async (connection) => {
  console.log("💳 Seeding payments...");

  const payments = [
    {
      booking_id: 1,
      amount: 2598.0,
      payment_method: "CARD",
      transaction_reference: generateTransactionReference(),
      status: "completed",
      payment_date: "2024-04-15 14:30:00",
    },
    {
      booking_id: 2,
      amount: 3798.0,
      payment_method: "PAYPAL",
      transaction_reference: generateTransactionReference(),
      status: "completed",
      payment_date: "2024-04-20 09:15:00",
    },
    {
      booking_id: 3,
      amount: 2799.0,
      payment_method: "CARD",
      transaction_reference: generateTransactionReference(),
      status: "completed",
      payment_date: "2024-04-10 16:45:00",
    },
    {
      booking_id: 4,
      amount: 1699.0,
      payment_method: "BANK_TRANSFER",
      transaction_reference: generateTransactionReference(),
      status: "completed",
      payment_date: "2024-04-05 11:20:00",
    },
    {
      booking_id: 5,
      amount: 6897.0,
      payment_method: "CARD",
      transaction_reference: generateTransactionReference(),
      status: "pending",
      payment_date: null,
    },
    {
      booking_id: 6,
      amount: 1798.0,
      payment_method: "PAYPAL",
      transaction_reference: generateTransactionReference(),
      status: "completed",
      payment_date: "2024-04-01 13:10:00",
    },
    {
      booking_id: 7,
      amount: 1398.0,
      payment_method: "CARD",
      transaction_reference: generateTransactionReference(),
      status: "completed",
      payment_date: "2024-03-25 10:30:00",
    },
  ];

  for (const payment of payments) {
    await connection.execute(
      `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, status, payment_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        payment.booking_id,
        payment.amount,
        payment.payment_method,
        payment.transaction_reference,
        payment.status,
        payment.payment_date,
      ],
    );
  }

  console.log(`✅ Seeded ${payments.length} payments`);
};
// Seed Reviews
const seedReviews = async (connection) => {
  console.log("⭐ Seeding reviews...");

  const reviews = [
    {
      user_id: 9, // mike.johnson@email.com
      package_id: 5, // 6-Day Masai Mara Safari Adventure
      booking_id: 3,
      rating: 5,
      comment:
        "Absolutely incredible experience! The safari guides were knowledgeable and passionate. We saw all of the Big Five and the Great Migration was breathtaking. The luxury tented camp exceeded expectations. Highly recommend Kenya Safari Experts!",
    },
    {
      user_id: 8, // sarah.wilson@email.com
      package_id: 2, // 4-Day Bali Adventure & Volcano Trek
      booking_id: 7,
      rating: 5,
      comment:
        "Perfect adventure package! The Mount Batur sunrise trek was challenging but so rewarding. White water rafting was thrilling and the waterfalls were stunning. Great organization and friendly guides. Will definitely book with Bali Adventures again!",
    },
    {
      user_id: 7, // john.doe@email.com
      package_id: 1, // 7-Day Bali Cultural Adventure (assuming completed)
      booking_id: 1,
      rating: 4,
      comment:
        "Wonderful cultural immersion in Bali. The cooking class was a highlight and the temples were magnificent. Accommodation was comfortable and guides were very informative. Only minor issue was some delays in transportation, but overall excellent value.",
    },
    {
      user_id: 8, // sarah.wilson@email.com
      package_id: 3, // 5-Day Paris Romantic Getaway (assuming completed)
      booking_id: 2,
      rating: 5,
      comment:
        "The most romantic trip ever! Paris Elite Tours made our honeymoon unforgettable. The Seine cruise at sunset, wine tasting in historic cellars, and Michelin-starred dinner were all perfect. Attention to detail was exceptional. Merci beaucoup!",
    },
    {
      user_id: 10, // emma.brown@email.com
      package_id: 7, // 5-Day Tokyo Traditional & Modern Experience (assuming completed)
      booking_id: 4,
      rating: 5,
      comment:
        "Amazing introduction to Japanese culture! The tea ceremony was so peaceful and authentic. Loved the contrast between traditional ryokan and modern Tokyo. Sushi making class was fun and educational. Guide was excellent - spoke perfect English and shared fascinating insights.",
    },
    {
      user_id: 7, // john.doe@email.com
      package_id: 4, // 3-Day Paris Art & History Tour (assuming completed)
      booking_id: 6,
      rating: 4,
      comment:
        "Great art-focused tour of Paris. The expert art historian guide brought the museums to life with fascinating stories. Loved the hidden gems and artist studios. Would have liked more time at each location, but understand the time constraints. Good value for art lovers.",
    },
  ];

  for (const review of reviews) {
    await connection.execute(
      `INSERT INTO reviews (user_id, package_id, booking_id, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        review.user_id,
        review.package_id,
        review.booking_id,
        review.rating,
        review.comment,
      ],
    );
  }

  console.log(`✅ Seeded ${reviews.length} reviews`);
};
// Seed Notifications
const seedNotifications = async (connection) => {
  console.log("🔔 Seeding notifications...");

  const notifications = [
    {
      user_id: 7, // john.doe@email.com
      title: "Booking Confirmed",
      message:
        "Your booking for '7-Day Bali Cultural Adventure' has been confirmed. Get ready for an amazing journey!",
      type: "BOOKING",
      is_read: true,
    },
    {
      user_id: 7,
      title: "Payment Successful",
      message:
        "Payment of $2,598.00 has been processed successfully for your Bali adventure.",
      type: "PAYMENT",
      is_read: true,
    },
    {
      user_id: 8, // sarah.wilson@email.com
      title: "Trip Reminder",
      message:
        "Your Paris Romantic Getaway starts in 7 days. Don't forget to check your travel documents!",
      type: "BOOKING",
      is_read: false,
    },
    {
      user_id: 9, // mike.johnson@email.com
      title: "Review Request",
      message:
        "How was your Masai Mara Safari? Please share your experience by leaving a review.",
      type: "REVIEW",
      is_read: false,
    },
    {
      user_id: 10, // emma.brown@email.com
      title: "Welcome to Tokyo Experience",
      message:
        "Thank you for booking with Tokyo Cultural Experiences. Your adventure begins soon!",
      type: "BOOKING",
      is_read: true,
    },
    {
      user_id: 11, // david.garcia@email.com
      title: "Payment Pending",
      message:
        "Your booking for Ancient Egypt Discovery is confirmed, but payment is still pending. Please complete payment to secure your spots.",
      type: "PAYMENT",
      is_read: false,
    },
    {
      user_id: 2, // Company: bali@adventures.com
      title: "New Booking Received",
      message:
        "You have received a new booking for '7-Day Bali Cultural Adventure' from John Doe.",
      type: "BOOKING",
      is_read: true,
    },
    {
      user_id: 3, // Company: paris@tours.com
      title: "Customer Review",
      message:
        "Sarah Wilson left a 5-star review for your Paris Romantic Getaway package!",
      type: "REVIEW",
      is_read: false,
    },
    {
      user_id: 4, // Company: safari@kenya.com
      title: "Payment Received",
      message:
        "Payment of $2,799.00 received for Mike Johnson's Masai Mara Safari booking.",
      type: "PAYMENT",
      is_read: true,
    },
    {
      user_id: 1, // Admin
      title: "System Update",
      message:
        "Monthly system maintenance completed successfully. All services are running normally.",
      type: "SYSTEM",
      is_read: false,
    },
  ];

  for (const notification of notifications) {
    await connection.execute(
      `INSERT INTO notifications (user_id, title, message, type, is_read) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        notification.user_id,
        notification.title,
        notification.message,
        notification.type,
        notification.is_read,
      ],
    );
  }

  console.log(`✅ Seeded ${notifications.length} notifications`);
};
