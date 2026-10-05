// ============================================================
// NP Construction — Site Configuration
// Edit this file to update contact info, project locations,
// client logos, videos, before/after sliders, and service areas
// ============================================================

export const SITE = {
  name:        'NP Construction',
  tagline:     'Steel | Strength | Solutions',
  phone:       '+91 70165 93309',
  phoneRaw:    '917016593309',
  whatsapp:    '917016593309',
  email:       'ajeetsanu177@gmail.com',
  address:     'HIGH-TECH, GMDC Ground, Thaltej, Ahmedabad, Gujarat – 380061',
  hours:       'Mon – Sat: 9:00 AM – 7:00 PM',
  logo:        '/images/NP-Contruction-logo.png',
  mapEmbed:    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.4!2d72.5072!3d23.0539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f5d8531001%3A0x4ba5a3bb3e4dff8b!2sThaltej%2C%20Ahmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000',
};

export const STATS = [
  { value: 15,    label: 'stats.years' },
  { value: 350,   label: 'stats.projects' },
  { value: 12000, label: 'stats.tons' },
  { value: 25,    label: 'stats.cities' },
];

// ── Project before/after slider pairs ──────────────────────
// Add before/after image pairs for the comparison slider
export const PROJECT_BEFORE_AFTER = [
  {
    id: 1,
    title: 'Sunrise Residency — Steel Framework',
    location: 'Ahmedabad, Gujarat',
    before: '/images/projects/proj1-before.jpg',
    after:  '/images/projects/proj1-after.jpg',
  },
  {
    id: 2,
    title: 'Commercial Tower — Steel Framework',
    location: 'Surat, Gujarat',
    before: '/images/projects/proj2-before.jpg',
    after:  '/images/projects/proj2-after.jpg',
  },
];

// ── Project location map markers ───────────────────────────
export const PROJECT_LOCATIONS = [
  { name: 'Sunrise Residency',       city: 'Ahmedabad', lat: 23.0539, lng: 72.5072, type: 'Residential', year: 2024 },
  { name: 'Metro Commercial Tower',  city: 'Surat',     lat: 21.1702, lng: 72.8311, type: 'Commercial',  year: 2023 },
  { name: 'AKS Warehouse',           city: 'Vadodara',  lat: 22.3072, lng: 73.1812, type: 'Industrial',  year: 2023 },
  { name: 'Business Park Phase 1',   city: 'Rajkot',    lat: 22.3039, lng: 70.8022, type: 'Commercial',  year: 2022 },
  { name: 'Shree Steel Factory',     city: 'Gandhinagar', lat: 23.2156, lng: 72.6369, type: 'Industrial', year: 2022 },
];

// ── Video gallery ───────────────────────────────────────────
export const VIDEOS = [
  {
    id: 1,
    title: 'Steel Erection — Ahmedabad Project',
    type: 'youtube',
    url:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: '/images/video-thumb-1.jpg',
  },
  {
    id: 2,
    title: 'Iron Fabrication Timelapse',
    type: 'youtube',
    url:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: '/images/video-thumb-2.jpg',
  },
  // For local video: { type: 'local', url: '/videos/welding.mp4', thumbnail: '/images/thumb.jpg' }
];

// ── Client logos (marquee wall) ────────────────────────────
export const CLIENT_LOGOS = [
  { name: 'ABC Builders',   logo: '/images/clients/client-1.png' },
  { name: 'XYZ Developers', logo: '/images/clients/client-2.png' },
  { name: 'Sunrise Group',  logo: '/images/clients/client-3.png' },
  { name: 'Metro Projects', logo: '/images/clients/client-4.png' },
  { name: 'Gujarat Infra',  logo: '/images/clients/client-5.png' },
  { name: 'Rajhans Realty', logo: '/images/clients/client-6.png' },
];

// ── Service area cities ────────────────────────────────────
export const SERVICE_AREAS = [
  { city: 'Ahmedabad', slug: 'ahmedabad', lat: 23.0225, lng: 72.5714, projects: 80 },
  { city: 'Surat',     slug: 'surat',     lat: 21.1702, lng: 72.8311, projects: 45 },
  { city: 'Vadodara',  slug: 'vadodara',  lat: 22.3072, lng: 73.1812, projects: 35 },
  { city: 'Rajkot',    slug: 'rajkot',    lat: 22.3039, lng: 70.8022, projects: 28 },
  { city: 'Gandhinagar', slug: 'gandhinagar', lat: 23.2156, lng: 72.6369, projects: 20 },
];

// ── Brochure download popup ────────────────────────────────
export const BROCHURE = {
  enabled: true,
  delaySeconds: 30,
  fileName: 'NP-Construction-Profile.pdf',
};

// ── reCAPTCHA ──────────────────────────────────────────────
// Replace with your actual site key from console.recaptcha.google.com
export const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // test key

// ── Google Maps API key ────────────────────────────────────
// Replace with your actual key from console.cloud.google.com
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
