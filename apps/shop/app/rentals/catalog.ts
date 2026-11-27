import {rentalPhoto, type RentalPhoto} from './photos';

const seating = rentalPhoto('white-loveseat');
const arch = rentalPhoto('white-floral-arch');
const blueFrame = rentalPhoto('blue-floral-frame');
const pinkArch = rentalPhoto('pink-arch-display');
const details = rentalPhoto('ceremony-details');

const photo0146 = rentalPhoto('photo-img_0146');
const photo1025 = rentalPhoto('photo-img_1025');
const photo1032 = rentalPhoto('photo-img_1032');
const photo0014 = rentalPhoto('photo-img_0014');
const photo0003 = rentalPhoto('photo-img_0003');
const photo0059 = rentalPhoto('photo-img_0059');
const photo0173 = rentalPhoto('photo-img_0173');
const photo0181 = rentalPhoto('photo-img_0181');
const photo0085 = rentalPhoto('photo-img_0085');
const photo0787 = rentalPhoto('photo-img_0787');
const photo0788 = rentalPhoto('photo-img_0788');
const photo5680 = rentalPhoto('photo-img_5680');
const photo9031 = rentalPhoto('photo-img_9031');

const photo3745 = rentalPhoto('photo-img_3745');
const photo4834 = rentalPhoto('photo-img_4834');
const photo4845 = rentalPhoto('photo-img_4845');
const photo7331 = rentalPhoto('photo-img_7331');
const photo7334 = rentalPhoto('photo-img_7334');
const photo7950 = rentalPhoto('photo-img_7950');
const photo7955 = rentalPhoto('photo-img_7955');

const blushLoveseat = rentalPhoto('photo-img_81001');
const blushLoveseatScene = rentalPhoto('photo-img_8100');
const blueTableDetail = rentalPhoto('photo-img_9030');

export const categories = ['Seating', 'Reusable Florals', 'Backdrops & Staging', 'Tabletop & Décor'] as const;
export type Category = typeof categories[number];

export type Rental = {
  id: string;
  category: Category;
  name: string;
  description: string;
  image: RentalPhoto;
  samplePrice?: number;
  alt: string;
  photos?: readonly {image: RentalPhoto; alt: string}[];
};

export const catalogRentals: Rental[] = [
  {id: 'white-loveseat', category: 'Seating', name: 'White Curved Loveseat', description: 'A white loveseat with curved arms, pictured in a colourful outdoor lounge setup.', samplePrice: 245, image: seating, alt: 'White curved loveseat with pink cushions in front of colourful flowers'},
  {id: 'white-floral-arch', category: 'Reusable Florals', name: 'White Floral Arch', description: 'White blooms and greenery frame an ivory arch for a ceremony or photo area.', samplePrice: 325, image: arch, alt: 'White floral installation surrounding an ivory ceremony arch'},
  {id: 'blue-floral-frame', category: 'Reusable Florals', name: 'Blue & White Floral Frame', description: 'Blue and white flowers frame draped fabric in this ceremony setup.', samplePrice: 360, image: blueFrame, alt: 'Blue and white florals along a white draped ceremony frame', photos: [{image: photo1025, alt: "Front view of the blue and white floral frame with draping"}, {image: photo1032, alt: "Angled view of the blue and white floral frame and pedestal flowers"}]},
  {id: 'pink-arch-display', category: 'Backdrops & Staging', name: 'Blush Arch Backdrop', description: 'Layered pink arches styled with floral clusters on both sides.', samplePrice: 290, image: pinkArch, alt: 'Pink arched backdrop with blush, pink and white floral clusters', photos: [{image: photo0146, alt: "Side view of the layered blush backdrop and floral clusters"}]},
  {id: 'ceremony-details', category: 'Tabletop & Décor', name: 'Peacock Ceremony Décor', description: 'A blue peacock accent shown beside a floral ceremony display.', samplePrice: 85, image: details, alt: 'Blue peacock accent beside a round floral arrangement'},
  {
    id: "ruby-floral-arch", category: "Reusable Florals", name: "Ruby & Blush Floral Arch",
    description: "A round arch with red, blush and white blooms, shown behind a low bench.",
    samplePrice: 390, image: photo0014, alt: "Red and blush floral arch behind a bench, photographed from the front",
    photos: [{image: photo0003, alt: "Side view of the red and blush floral arch"}],
  },
  {
    id: "pearl-shell-chair", category: "Seating", name: "Pearl Shell Chair",
    description: "A pearlescent shell-shaped seat with a scalloped back, shown in a pastel party setup.",
    samplePrice: 145, image: photo0059, alt: "Pearlescent shell chair with a scalloped back beside pastel balloons",
  },
  {
    id: "white-floral-pillars", category: "Reusable Florals", name: "White Floral Pillars",
    description: "Two freestanding white floral pillars with low clusters at their bases.",
    samplePrice: 340, image: photo0173, alt: "Pair of white floral pillars on a wooden ceremony platform",
    photos: [{image: photo0181, alt: "Angled view of the white floral pillars and their floor arrangements"}],
  },
  {
    id: "blush-table-runner", category: "Tabletop & Décor", name: "Blush & White Table Florals",
    description: "A low arrangement of blush and white flowers with trailing greenery.",
    samplePrice: 125, image: photo0085, alt: "Low blush and white floral arrangement with greenery across a table",
  },
  {
    id: "cream-lounge-set", category: "Seating", name: "Cream Lounge Set",
    description: "A cream loveseat and two matching chairs with gold-toned legs, styled on a reception stage.",
    samplePrice: 475, image: photo0787, alt: "Front view of a cream loveseat and two matching chairs",
    photos: [{image: photo0788, alt: "Angled view of the cream lounge seating on a floral stage"}],
  },
  {
    id: "white-glass-centerpiece", category: "Tabletop & Décor", name: "White Floral Centrepiece",
    description: "White blooms displayed in a tall clear vase, shown on a dressed reception table.",
    samplePrice: 140, image: photo5680, alt: "White flowers in a tall clear vase on a reception table",
  },
  {
    id: "blue-table-florals", category: "Tabletop & Décor", name: "Blue & White Table Florals",
    description: "An elongated blue and white arrangement for a feature table.",
    samplePrice: 180, image: photo9031, alt: "Long blue and white floral arrangement on a table",
    photos: [{image: blueTableDetail, alt: "Close view of the blue and white flowers and trailing stems"}],
  },
  {
    id: 'woven-lanterns', category: 'Backdrops & Staging', name: 'Woven Hanging Lanterns',
    description: 'Warm woven pendant lanterns in mixed sizes, shown suspended among greenery.',
    samplePrice: 135, image: photo3745, alt: 'Lit woven lanterns hanging at different heights against greenery',
  },
  {
    id: 'lavender-butterfly-backdrop', category: 'Backdrops & Staging', name: 'Lavender Butterfly Backdrop',
    description: 'Lavender butterfly wings flank a light arch styled with purple and ivory florals.',
    samplePrice: 310, image: photo4834, alt: 'Lavender butterfly backdrop with a floral arch and flowers at the base',
    photos: [{image: photo4845, alt: 'Closer view of the lavender floral arch and low arrangements'}],
  },
  {
    id: 'gold-ceremony-canopy', category: 'Backdrops & Staging', name: 'Gold Ceremony Canopy',
    description: 'An ornate gold canopy shown with hanging floral strands and red and white ceremony arrangements.',
    samplePrice: 695, image: photo7331, alt: 'Gold ceremony canopy with carved columns and red and white floral styling',
    photos: [{image: photo7334, alt: 'View up the red aisle towards the gold ceremony canopy'}],
  },
  {
    id: 'charcoal-loveseat', category: 'Seating', name: 'Charcoal Channel-Tufted Loveseat',
    description: 'A charcoal loveseat with a channel-tufted back and flared arms, shown in a red and gold event setup.',
    samplePrice: 265, image: photo7950, alt: 'Charcoal channel-tufted loveseat viewed from the front',
    photos: [{image: photo7955, alt: 'Side view of the charcoal loveseat beside a red balloon display'}],
  },
  {
    id: 'blush-loveseat', category: 'Seating', name: 'Blush Channel-Tufted Loveseat',
    description: 'A soft blush loveseat with a channel-tufted back and rounded arms.',
    samplePrice: 285, image: blushLoveseat, alt: 'Front view of the blush loveseat with rounded arms',
    photos: [{image: blushLoveseatScene, alt: 'Blush loveseat styled beneath pink draping and an overhead floral garland'}],
  },
];
