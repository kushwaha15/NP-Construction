const mapUrl = (city) => `https://www.google.com/maps?q=${encodeURIComponent(`${city}, Gujarat`)}&output=embed`;

export const CITIES = {
  ahmedabad: {
    name: 'Ahmedabad',
    projectCount: 80,
    intro: 'Ahmedabad projects need steel packages that respect active sites, tight urban plots, and fast-moving commercial schedules. NP Construction supports builders across the city with measured fabrication, dependable erection crews, and practical coordination from drawings through handover. Our team works on warehouses, factories, commercial buildings, residences, mezzanines, and repair scopes. We plan deliveries around access constraints, keep connections aligned, and communicate clearly when site conditions change. From Thaltej and SG Highway to Vatva and Sanand, clients choose us for accountable structural steel work that stays focused on safety, finish, and the agreed programme.',
    localAreas: ['Thaltej', 'SG Highway', 'Bopal', 'Vatva', 'Naroda', 'Sanand', 'Changodar', 'Prahladnagar'],
    landmarks: ['SG Highway', 'Sabarmati Ashram', 'Sardar Vallabhbhai Patel International Airport'],
    faq: [
      { q: 'How quickly can you visit an Ahmedabad site?', a: 'We usually arrange an initial call and site discussion within one working day, subject to access and project information.' },
      { q: 'Do you handle steel fabrication and erection together?', a: 'Yes. We can take responsibility for fabrication, delivery, erection, connection work, and coordination as one package.' },
      { q: 'Can you work around an occupied commercial site?', a: 'We plan deliveries, lifting windows, and work zones around the site programme and local access restrictions.' },
    ],
    mapEmbedUrl: mapUrl('Ahmedabad'),
  },
  surat: {
    name: 'Surat',
    projectCount: 45,
    intro: 'Surat has a strong mix of textile, diamond, logistics, and residential development, each with its own steel requirements. NP Construction delivers structural steel support for projects that need clean fabrication, coordinated transport, and disciplined site erection. We help clients turn drawings into practical frames, trusses, platforms, stairs, and industrial additions without losing sight of the schedule. Our crews serve established industrial belts as well as new construction around the city. Whether the job is a textile unit in Sachin, a warehouse near Hazira, or a commercial build in Vesu, we bring a steady process and clear responsibility.',
    localAreas: ['Vesu', 'Sachin', 'Palsana', 'Udhna', 'Hazira', 'Katargam', 'Adajan', 'Kadodara'],
    landmarks: ['Hazira Industrial Area', 'Surat Diamond Bourse', 'Surat Railway Station'],
    faq: [
      { q: 'Do you serve industrial sites near Hazira and Sachin?', a: 'Yes. Our team supports industrial and warehouse work across Surat, including Hazira, Sachin, Palsana, and nearby belts.' },
      { q: 'Can you fabricate steel for a textile facility?', a: 'We fabricate frames, platforms, stairs, supports, and roof structures to suit the drawings and operating requirements.' },
      { q: 'What should I share for a Surat steel quote?', a: 'Share drawings or dimensions, the site location, desired finish, and target programme. We will clarify the scope before pricing.' },
    ],
    mapEmbedUrl: mapUrl('Surat'),
  },
  vadodara: {
    name: 'Vadodara',
    projectCount: 35,
    intro: 'Vadodara combines engineering, chemicals, manufacturing, education, and residential growth, so every steel package benefits from careful coordination. NP Construction helps local developers and industrial teams with fabrication, erection, welding, roof systems, and access structures. We pay attention to fit-up, lifting plans, connection details, and the practical realities of working around operating facilities. Our service area includes Makarpura, Savli, Nandesari, Waghodia, and the city’s expanding outskirts. For a new factory, a warehouse extension, or a commercial frame, we offer a responsive point of contact and work that is planned to meet the site’s real constraints.',
    localAreas: ['Makarpura', 'Savli', 'Nandesari', 'Waghodia', 'Manjalpur', 'Gotri', 'Halol', 'Padra'],
    landmarks: ['Makarpura GIDC', 'Laxmi Vilas Palace', 'Vadodara Airport'],
    faq: [
      { q: 'Can you work inside an operating Vadodara plant?', a: 'We can coordinate phased work, controlled access, lifting windows, and shutdown requirements with the plant team.' },
      { q: 'Do you cover Savli and Makarpura GIDC?', a: 'Yes. Both are regular service areas, along with Nandesari, Waghodia, Halol, and surrounding industrial locations.' },
      { q: 'Can you repair or reinforce an existing frame?', a: 'Yes. We can inspect the scope, fabricate strengthening members, and coordinate installation after the required approvals.' },
    ],
    mapEmbedUrl: mapUrl('Vadodara'),
  },
  rajkot: {
    name: 'Rajkot',
    projectCount: 28,
    intro: 'Rajkot’s engineering and manufacturing businesses rely on steel structures that are durable, accessible, and straightforward to maintain. NP Construction works with local builders, factory owners, and commercial developers on frames, roof trusses, platforms, staircases, and fabrication packages. We combine workshop accuracy with practical site planning so steel arrives ready for assembly and the workfront keeps moving. From Metoda and Shapar-Veraval to Kalawad Road and the city centre, our team can support both new construction and carefully scoped modifications. Our focus is simple: understand the load and use, document the scope, and deliver dependable steel work.',
    localAreas: ['Metoda', 'Shapar-Veraval', 'Aji GIDC', 'Kalawad Road', 'Gondal Road', 'Mavdi', 'Kothariya', 'University Road'],
    landmarks: ['Metoda GIDC', 'Shapar-Veraval Industrial Area', 'Rajkot Airport'],
    faq: [
      { q: 'Do you take on smaller Rajkot fabrication packages?', a: 'Yes. We quote focused packages such as stairs, platforms, canopies, reinforcements, and smaller building frames.' },
      { q: 'Can you deliver to Metoda or Shapar-Veraval?', a: 'Yes. Delivery and erection planning includes Rajkot’s main industrial areas and nearby sites.' },
      { q: 'Will you review drawings before starting fabrication?', a: 'We review the available drawings and dimensions with you so that scope, connections, and finish are clear before work begins.' },
    ],
    mapEmbedUrl: mapUrl('Rajkot'),
  },
  gandhinagar: {
    name: 'Gandhinagar',
    projectCount: 20,
    intro: 'Gandhinagar projects often balance planned development, institutional buildings, offices, and industrial work around the capital region. NP Construction provides structural steel fabrication and erection with an emphasis on orderly coordination, clean site execution, and predictable communication. We support frames, roof structures, staircases, mezzanines, gates, platforms, and custom steelwork for builders and facility teams. Our crews cover Infocity, Kudasan, Sargasan, Kalol, and nearby estates. Whether the project is a new office, a public-facing facility, or a factory improvement, we bring practical detailing and a measured installation process to every stage.',
    localAreas: ['Infocity', 'Kudasan', 'Sargasan', 'Randesan', 'Kalol', 'Chiloda', 'Dahegam', 'Gift City'],
    landmarks: ['GIFT City', 'Mahatma Mandir', 'Infocity'],
    faq: [
      { q: 'Do you work around GIFT City and Infocity?', a: 'Yes. We serve planned commercial areas including GIFT City, Infocity, Kudasan, and nearby Gandhinagar locations.' },
      { q: 'Can steel work be scheduled in phases?', a: 'Yes. We can divide fabrication, deliveries, and erection into phases that align with access and other contractors.' },
      { q: 'Do you provide steel for offices and institutions?', a: 'Yes. We handle structural frames as well as stairs, platforms, canopies, supports, and other custom steel packages.' },
    ],
    mapEmbedUrl: mapUrl('Gandhinagar'),
  },
};

export const CITY_LIST = Object.entries(CITIES).map(([slug, city]) => ({ slug, ...city }));
