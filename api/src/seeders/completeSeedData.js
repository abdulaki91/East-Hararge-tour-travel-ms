import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import { eastHararghePackages } from "./eastHararghePackages.js";
import { futurePackages } from "./futurePackagesSeeder.js";

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
    console.log("🌱 Starting complete database seeding...");

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

    console.log("✅ Complete database seeding completed successfully!");
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
      email: "admin@easthararghetours.com",
      password: hashedPassword,
      name: "System Administrator",
      phone: "+251911234567",
      role_id: 3,
      is_active: true,
      email_verified: true,
    },

    // Company Users
    {
      email: "harar@culturaltours.com",
      password: hashedPassword,
      name: "Ahmed Mohammed",
      phone: "+251912345678",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "dire@adventuretours.com",
      password: hashedPassword,
      name: "Fatuma Hassan",
      phone: "+251913456789",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "babille@ecotours.com",
      password: hashedPassword,
      name: "Abdi Kedir",
      phone: "+251914567890",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "kombolcha@heritagetours.com",
      password: hashedPassword,
      name: "Meron Tadesse",
      phone: "+251915678901",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },
    {
      email: "fedis@naturetours.com",
      password: hashedPassword,
      name: "Yusuf Ibrahim",
      phone: "+251916789012",
      role_id: 2,
      is_active: true,
      email_verified: true,
    },

    // Regular Users
    {
      email: "mohammed.ali@email.com",
      password: hashedPassword,
      name: "Mohammed Ali",
      phone: "+251917123456",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "hanan.ahmed@email.com",
      password: hashedPassword,
      name: "Hanan Ahmed",
      phone: "+251918234567",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "dawit.tesfaye@email.com",
      password: hashedPassword,
      name: "Dawit Tesfaye",
      phone: "+251919345678",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "sara.mohammed@email.com",
      password: hashedPassword,
      name: "Sara Mohammed",
      phone: "+251920456789",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
    {
      email: "yonas.bekele@email.com",
      password: hashedPassword,
      name: "Yonas Bekele",
      phone: "+251921567890",
      role_id: 1,
      is_active: true,
      email_verified: true,
    },
  ];

  for (const user of users) {
    await connection.execute(
      `INSERT INTO users (email, password, name, phone, role_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.email,
        user.password,
        user.name,
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
      user_id: 2, // harar@culturaltours.com
      company_name: "Harar Cultural Tours",
      description:
        "Specialized in showcasing the rich cultural heritage of Harar and East Hararghe. We offer authentic experiences including visits to ancient mosques, traditional markets, and cultural ceremonies. Our expert guides are locals who share deep knowledge of Harari culture and history.",
      address: "Ras Tafari Street, Harar, East Hararghe Zone, Oromia, Ethiopia",
      phone: "+251912345678",
      email: "info@hararcultural.com",
      website: "https://hararcultural.com",
      license_number: "EH-TOUR-2024-001",
      is_verified: true,
    },
    {
      user_id: 3, // dire@adventuretours.com
      company_name: "Dire Dawa Adventure Tours",
      description:
        "Adventure and eco-tourism specialists covering Dire Dawa and surrounding areas. We organize hiking expeditions, cave explorations, and nature walks. Experience the unique landscapes and geological formations of East Hararghe with our experienced guides.",
      address: "Kezira Street, Dire Dawa, East Hararghe Zone, Oromia, Ethiopia",
      phone: "+251913456789",
      email: "contact@diredawaadventure.com",
      website: "https://diredawaadventure.com",
      license_number: "EH-TOUR-2024-002",
      is_verified: true,
    },
    {
      user_id: 4, // babille@ecotours.com
      company_name: "Babille Eco Tours",
      description:
        "Eco-tourism and wildlife specialists focusing on Babille Elephant Sanctuary and surrounding natural areas. We promote sustainable tourism while showcasing the unique flora and fauna of East Hararghe's protected areas.",
      address: "Babille Town, East Hararghe Zone, Oromia, Ethiopia",
      phone: "+251914567890",
      email: "info@babilleeco.com",
      website: "https://babilleeco.com",
      license_number: "EH-TOUR-2024-003",
      is_verified: true,
    },
    {
      user_id: 5, // kombolcha@heritagetours.com
      company_name: "Kombolcha Heritage Tours",
      description:
        "Heritage and historical site specialists covering ancient sites and archaeological areas in East Hararghe. We offer educational tours focusing on the region's rich history, ancient settlements, and traditional architecture.",
      address: "Kombolcha Town, East Hararghe Zone, Oromia, Ethiopia",
      phone: "+251915678901",
      email: "hello@kombheritage.com",
      website: "https://kombheritage.com",
      license_number: "EH-TOUR-2024-004",
      is_verified: true,
    },
    {
      user_id: 6, // fedis@naturetours.com
      company_name: "Fedis Nature Tours",
      description:
        "Nature and agricultural tourism specialists showcasing the beautiful landscapes and farming communities of Fedis and surrounding areas. Experience traditional coffee farming, highland scenery, and rural community life.",
      address: "Fedis Town, East Hararghe Zone, Oromia, Ethiopia",
      phone: "+251916789012",
      email: "info@fedisnature.com",
      website: "https://fedisnature.com",
      license_number: "EH-TOUR-2024-005",
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

  const allPackages = [...eastHararghePackages, ...futurePackages];

  for (const pkg of allPackages) {
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

  console.log(`✅ Seeded ${allPackages.length} packages`);
};
// Seed Bookings
const seedBookings = async (connection) => {
  console.log("📅 Seeding bookings...");

  const bookings = [
    {
      user_id: 7, // mohammed.ali@email.com
      package_id: 1, // 5-Day Harar Cultural Heritage Experience
      booking_reference: generateBookingReference(),
      number_of_people: 2,
      total_amount: 1700.0, // 850 * 2
      booking_date: "2024-07-15",
      status: "confirmed",
      special_requests:
        "Interested in traditional Harari cuisine and cultural performances.",
    },
    {
      user_id: 8, // hanan.ahmed@email.com
      package_id: 2, // 4-Day Dire Dawa Cave & Nature Adventure
      booking_reference: generateBookingReference(),
      number_of_people: 1,
      total_amount: 680.0,
      booking_date: "2024-08-20",
      status: "confirmed",
      special_requests:
        "Photography enthusiast. Interested in geological formations.",
    },
    {
      user_id: 9, // dawit.tesfaye@email.com
      package_id: 3, // 3-Day Babille Elephant Sanctuary Experience
      booking_reference: generateBookingReference(),
      number_of_people: 1,
      total_amount: 750.0,
      booking_date: "2024-09-10",
      status: "completed",
      special_requests:
        "Wildlife conservation researcher. Very interested in elephant behavior.",
    },
    {
      user_id: 10, // sara.mohammed@email.com
      package_id: 5, // 6-Day Coffee Origin & Highland Experience
      booking_reference: generateBookingReference(),
      number_of_people: 2,
      total_amount: 1840.0, // 920 * 2
      booking_date: "2024-10-05",
      status: "confirmed",
      special_requests:
        "Coffee enthusiasts. Would love to learn traditional coffee preparation methods.",
    },
    {
      user_id: 11, // yonas.bekele@email.com
      package_id: 6, // 7-Day Complete East Hararghe Discovery
      booking_reference: generateBookingReference(),
      number_of_people: 3,
      total_amount: 4350.0, // 1450 * 3
      booking_date: "2024-11-12",
      status: "pending",
      special_requests:
        "Family trip with teenage children. Interested in cultural education and history.",
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
      package_id: 4, // 6-Day Masai Mara Safari Adventure
      booking_id: 3,
      rating: 5,
      comment:
        "Absolutely incredible experience! The safari guides were knowledgeable and passionate. We saw all of the Big Five and the Great Migration was breathtaking. The luxury tented camp exceeded expectations. Highly recommend Kenya Safari Experts!",
    },
    {
      user_id: 8, // sarah.wilson@email.com
      package_id: 3, // 5-Day Paris Romantic Getaway
      booking_id: 2,
      rating: 5,
      comment:
        "The most romantic trip ever! Paris Elite Tours made our honeymoon unforgettable. The Seine cruise at sunset, wine tasting in historic cellars, and Michelin-starred dinner were all perfect. Attention to detail was exceptional. Merci beaucoup!",
    },
    {
      user_id: 7, // john.doe@email.com
      package_id: 1, // 7-Day Bali Cultural Adventure
      booking_id: 1,
      rating: 4,
      comment:
        "Wonderful cultural immersion in Bali. The cooking class was a highlight and the temples were magnificent. Accommodation was comfortable and guides were very informative. Only minor issue was some delays in transportation, but overall excellent value.",
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
      user_id: 2, // Company: bali@adventures.com
      title: "New Booking Received",
      message:
        "You have received a new booking for '7-Day Bali Cultural Adventure' from John Doe.",
      type: "BOOKING",
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
