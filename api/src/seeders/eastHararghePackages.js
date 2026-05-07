// East Hararghe Tourism Packages
export const eastHararghePackages = [
  // Harar Cultural Tours packages
  {
    company_id: 1,
    title: "5-Day Harar Cultural Heritage Experience",
    description:
      "Immerse yourself in the ancient walled city of Harar, a UNESCO World Heritage Site. Explore the 4th holiest city in Islam, visit traditional Harari houses, witness the famous hyena feeding ceremony, and experience authentic Harari culture and cuisine.",
    location: "Harar, East Hararghe Zone, Ethiopia",
    duration_days: 5,
    price: 850.0,
    max_people: 12,
    available_slots: 8,
    start_date: "2024-06-01",
    end_date: "2024-12-31",
    includes:
      "Airport transfers, 4 nights accommodation in traditional Harari house, Daily breakfast, 3 lunches, 2 dinners, City wall tour, Mosque visits, Hyena feeding experience, Traditional coffee ceremony, English-speaking local guide",
    excludes:
      "International flights, Travel insurance, Personal expenses, Alcoholic beverages, Tips for guides",
    itinerary: JSON.stringify([
      {
        day: 1,
        title: "Arrival in Harar",
        description:
          "Airport pickup and transfer to traditional Harari house. Evening orientation and welcome dinner.",
        activities: [
          "Airport transfer",
          "Hotel check-in",
          "City orientation",
          "Welcome dinner",
        ],
      },
      {
        day: 2,
        title: "Old City Exploration",
        description:
          "Explore the ancient walled city, visit Ras Tafari's house and traditional markets.",
        activities: [
          "City wall tour",
          "Ras Tafari house",
          "Traditional market",
          "Harari house visit",
        ],
      },
      {
        day: 3,
        title: "Religious & Cultural Sites",
        description:
          "Visit ancient mosques, shrines, and experience traditional Harari culture.",
        activities: [
          "Mosque visits",
          "Shrine tours",
          "Cultural center",
          "Traditional crafts workshop",
        ],
      },
      {
        day: 4,
        title: "Hyena Feeding & Coffee Ceremony",
        description:
          "Witness the famous hyena feeding and participate in traditional coffee ceremony.",
        activities: [
          "Hyena feeding experience",
          "Coffee ceremony",
          "Traditional music",
          "Local cuisine tasting",
        ],
      },
      {
        day: 5,
        title: "Departure",
        description: "Final city tour and airport transfer.",
        activities: [
          "Last-minute shopping",
          "City farewell tour",
          "Airport transfer",
        ],
      },
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=800",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    ]),
    is_active: true,
  },

  // Dire Dawa Adventure Tours packages
  {
    company_id: 2,
    title: "4-Day Dire Dawa Cave & Nature Adventure",
    description:
      "Explore the stunning caves and natural formations around Dire Dawa. Visit Porc-Epic Cave, hike through scenic landscapes, and discover the geological wonders of East Hararghe. Perfect for adventure enthusiasts and nature lovers.",
    location: "Dire Dawa & Surroundings, East Hararghe Zone, Ethiopia",
    duration_days: 4,
    price: 680.0,
    max_people: 10,
    available_slots: 7,
    start_date: "2024-05-15",
    end_date: "2024-11-30",
    includes:
      "Airport transfers, 3 nights accommodation, Daily breakfast, 2 lunches, 1 dinner, Cave exploration, Hiking equipment, Professional guide, Transportation",
    excludes:
      "International flights, Travel insurance, Personal expenses, Additional meals, Tips",
    itinerary: JSON.stringify([
      {
        day: 1,
        title: "Arrival & City Tour",
        description:
          "Arrive in Dire Dawa, city orientation and railway heritage tour.",
        activities: [
          "Airport transfer",
          "City tour",
          "Railway museum",
          "Hotel check-in",
        ],
      },
      {
        day: 2,
        title: "Porc-Epic Cave Exploration",
        description: "Full day cave exploration and archaeological site visit.",
        activities: [
          "Cave exploration",
          "Archaeological tour",
          "Picnic lunch",
          "Rock formations",
        ],
      },
      {
        day: 3,
        title: "Nature Hiking",
        description: "Hiking through scenic landscapes and natural formations.",
        activities: [
          "Mountain hiking",
          "Nature photography",
          "Local village visit",
          "Traditional lunch",
        ],
      },
      {
        day: 4,
        title: "Departure",
        description: "Final tour and departure.",
        activities: ["Morning walk", "Shopping", "Airport transfer"],
      },
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800",
    ]),
    is_active: true,
  },

  // Babille Eco Tours packages
  {
    company_id: 3,
    title: "3-Day Babille Elephant Sanctuary Experience",
    description:
      "Visit the unique Babille Elephant Sanctuary, home to the easternmost population of African elephants. Experience wildlife viewing, learn about conservation efforts, and explore the diverse ecosystems of East Hararghe.",
    location: "Babille Elephant Sanctuary, East Hararghe Zone, Ethiopia",
    duration_days: 3,
    price: 750.0,
    max_people: 8,
    available_slots: 5,
    start_date: "2024-07-01",
    end_date: "2025-03-31",
    includes:
      "Airport transfers, 2 nights eco-lodge accommodation, All meals, Game drives, Conservation center visit, Professional wildlife guide, Park fees",
    excludes:
      "International flights, Travel insurance, Personal expenses, Tips for guide",
    itinerary: JSON.stringify([
      {
        day: 1,
        title: "Arrival & Sanctuary Introduction",
        description:
          "Arrive at Babille, check-in to eco-lodge and evening game drive.",
        activities: [
          "Airport transfer",
          "Lodge check-in",
          "Sanctuary orientation",
          "Evening game drive",
        ],
      },
      {
        day: 2,
        title: "Full Day Wildlife Experience",
        description:
          "Full day exploring the sanctuary with morning and afternoon game drives.",
        activities: [
          "Morning game drive",
          "Elephant tracking",
          "Conservation center visit",
          "Afternoon wildlife viewing",
        ],
      },
      {
        day: 3,
        title: "Community Visit & Departure",
        description:
          "Visit local community and learn about human-wildlife coexistence.",
        activities: [
          "Community visit",
          "Traditional breakfast",
          "Final game drive",
          "Departure",
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

  // Kombolcha Heritage Tours packages
  {
    company_id: 4,
    title: "4-Day East Hararghe Historical Circuit",
    description:
      "Explore the rich historical heritage of East Hararghe including ancient settlements, archaeological sites, and traditional architecture. Learn about the region's fascinating history and cultural evolution.",
    location: "Kombolcha & Historical Sites, East Hararghe Zone, Ethiopia",
    duration_days: 4,
    price: 620.0,
    max_people: 12,
    available_slots: 9,
    start_date: "2024-04-01",
    end_date: "2024-11-30",
    includes:
      "Airport transfers, 3 nights accommodation, Daily breakfast, 2 lunches, 1 dinner, Archaeological site visits, Museum entries, Professional historian guide",
    excludes:
      "International flights, Travel insurance, Personal expenses, Additional meals, Tips",
    itinerary: JSON.stringify([
      {
        day: 1,
        title: "Arrival & Kombolcha Tour",
        description:
          "Arrive and explore Kombolcha town and its historical significance.",
        activities: [
          "Airport transfer",
          "Town tour",
          "Local museum",
          "Hotel check-in",
        ],
      },
      {
        day: 2,
        title: "Ancient Settlement Sites",
        description:
          "Visit ancient settlement sites and archaeological excavations.",
        activities: [
          "Archaeological sites",
          "Ancient ruins",
          "Historical interpretation",
          "Traditional lunch",
        ],
      },
      {
        day: 3,
        title: "Traditional Architecture",
        description:
          "Explore traditional Oromo architecture and building techniques.",
        activities: [
          "Traditional houses",
          "Architecture tour",
          "Craft demonstrations",
          "Cultural center",
        ],
      },
      {
        day: 4,
        title: "Departure",
        description: "Final historical site visit and departure.",
        activities: [
          "Final site visit",
          "Souvenir shopping",
          "Airport transfer",
        ],
      },
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=800",
    ]),
    is_active: true,
  },

  // Fedis Nature Tours packages
  {
    company_id: 5,
    title: "6-Day Coffee Origin & Highland Experience",
    description:
      "Discover the birthplace of coffee in the highlands of East Hararghe. Experience traditional coffee farming, participate in coffee ceremonies, and enjoy the stunning highland scenery while staying with local farming families.",
    location: "Fedis & Coffee Highlands, East Hararghe Zone, Ethiopia",
    duration_days: 6,
    price: 920.0,
    max_people: 10,
    available_slots: 8,
    start_date: "2024-10-01",
    end_date: "2025-04-30",
    includes:
      "Airport transfers, 5 nights accommodation (3 nights homestay, 2 nights lodge), All meals, Coffee farm tours, Traditional coffee ceremonies, Highland trekking, Local guide",
    excludes:
      "International flights, Travel insurance, Personal expenses, Tips",
    itinerary: JSON.stringify([
      {
        day: 1,
        title: "Arrival & Coffee Introduction",
        description: "Arrive in Fedis and introduction to coffee culture.",
        activities: [
          "Airport transfer",
          "Coffee orientation",
          "Local family welcome",
          "Traditional dinner",
        ],
      },
      {
        day: 2,
        title: "Coffee Farm Experience",
        description:
          "Full day at coffee farms learning traditional cultivation methods.",
        activities: [
          "Farm tour",
          "Coffee picking",
          "Processing demonstration",
          "Farmer interaction",
        ],
      },
      {
        day: 3,
        title: "Highland Trekking",
        description: "Trek through beautiful highland landscapes and forests.",
        activities: [
          "Highland trek",
          "Forest exploration",
          "Scenic viewpoints",
          "Picnic lunch",
        ],
      },
      {
        day: 4,
        title: "Traditional Coffee Ceremony",
        description: "Participate in elaborate traditional coffee ceremonies.",
        activities: [
          "Coffee ceremony",
          "Cultural exchange",
          "Traditional music",
          "Local crafts",
        ],
      },
      {
        day: 5,
        title: "Community Life Experience",
        description:
          "Experience daily life in rural East Hararghe communities.",
        activities: [
          "Community activities",
          "Traditional cooking",
          "Local market",
          "Cultural performances",
        ],
      },
      {
        day: 6,
        title: "Departure",
        description: "Final coffee tasting and departure.",
        activities: [
          "Coffee cupping session",
          "Souvenir shopping",
          "Airport transfer",
        ],
      },
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
      "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800",
    ]),
    is_active: true,
  },

  // Additional East Hararghe Experience
  {
    company_id: 1,
    title: "7-Day Complete East Hararghe Discovery",
    description:
      "The ultimate East Hararghe experience combining cultural heritage, natural wonders, and authentic local experiences. Visit Harar, explore caves, see elephants, and experience coffee culture in one comprehensive tour.",
    location: "Multiple Locations, East Hararghe Zone, Ethiopia",
    duration_days: 7,
    price: 1450.0,
    max_people: 8,
    available_slots: 4,
    start_date: "2024-08-01",
    end_date: "2024-12-31",
    includes:
      "Airport transfers, 6 nights accommodation (variety of lodging), All meals, All activities and tours, Professional guides, Transportation, Park fees",
    excludes:
      "International flights, Travel insurance, Personal expenses, Alcoholic beverages, Tips",
    itinerary: JSON.stringify([
      {
        day: 1,
        title: "Arrival & Harar Introduction",
        description: "Arrive and begin Harar cultural exploration.",
        activities: [
          "Airport transfer",
          "Harar city tour",
          "Traditional accommodation",
          "Welcome dinner",
        ],
      },
      {
        day: 2,
        title: "Harar Cultural Immersion",
        description: "Deep dive into Harari culture and traditions.",
        activities: [
          "Mosque visits",
          "Hyena feeding",
          "Traditional crafts",
          "Coffee ceremony",
        ],
      },
      {
        day: 3,
        title: "Dire Dawa & Cave Exploration",
        description: "Travel to Dire Dawa and explore natural caves.",
        activities: [
          "Travel to Dire Dawa",
          "Cave exploration",
          "Railway heritage",
          "Hotel check-in",
        ],
      },
      {
        day: 4,
        title: "Babille Elephant Sanctuary",
        description: "Wildlife experience at Babille Elephant Sanctuary.",
        activities: [
          "Sanctuary visit",
          "Elephant tracking",
          "Conservation learning",
          "Eco-lodge stay",
        ],
      },
      {
        day: 5,
        title: "Highland Coffee Experience",
        description:
          "Journey to coffee highlands for authentic farm experience.",
        activities: [
          "Travel to Fedis",
          "Coffee farm tour",
          "Highland scenery",
          "Homestay experience",
        ],
      },
      {
        day: 6,
        title: "Cultural Exchange & Crafts",
        description: "Community interaction and traditional craft learning.",
        activities: [
          "Community visit",
          "Craft workshops",
          "Traditional cooking",
          "Cultural performances",
        ],
      },
      {
        day: 7,
        title: "Departure",
        description: "Final experiences and departure.",
        activities: [
          "Final coffee ceremony",
          "Souvenir shopping",
          "Airport transfer",
        ],
      },
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
      "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=800",
    ]),
    is_active: true,
  },
];
