import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(import.meta.dirname, '..', 'src', 'content', 'collections');
mkdirSync(CONTENT_DIR, { recursive: true });

interface Collection {
  slug: string;
  title: string;
  order: number;
  pdfPage: number;
  blurb: string;
}

const collections: Collection[] = [
  {
    slug: 'auli-mascots',
    title: 'Auli Mascots',
    order: 1,
    pdfPage: 12,
    blurb: `This mascot sculpture originates from Auli, a prominent ski destination in Uttarakhand, and is associated with the early development of winter sports in the region, particularly the 5th National Winter Games held in 1993. The form reflects a locally rooted visual language influenced by folk and handcrafted aesthetics. The mascot represents a significant period in Auli's emergence as a center for skiing and winter recreation, and stands as a visual marker of the region's sporting heritage and cultural identity.`,
  },
  {
    slug: 'nekchand-sculptures',
    title: "Nek Chand's Sculptures",
    order: 2,
    pdfPage: 16,
    blurb: `Nine sculptural figures reflecting the influence of Nek Chand, celebrated creator of the Rock Garden in Chandigarh. Characterized by their folk-inspired forms and use of repurposed materials, the figures embody a spirit of intuitive creativity and grassroots artistry. Among them is a female figure beside a fixed well, fondly named Uma by author Ruskin Bond during a visit - an interaction captured in a photograph that remains part of the family's cherished memory.

These sculptures hold personal and emotional significance within the family. Together, they represent not only a distinct artistic style but also a deep personal narrative rooted in memory, interaction, and place.`,
  },
  {
    slug: 'paintings',
    title: 'Paintings',
    order: 3,
    pdfPage: 26,
    blurb: `A compelling ensemble of works by artists such as Rathin Mitra, Nicholas Roerich, and Dr. Y. Mathpal, along with photographs captured by Surjit Das himself. Rooted in the visual language of ritual, landscape, and symbolic expression, these works reflect a wide range of spiritual, emotional, and cultural resonances.

Each piece offers a window into deeper artistic journeys - exploring identity, devotion, contemplation, and transformation. More than decorative artworks, they are silent narrators of stories, moods, and inner worlds - echoes of heritage, imagination, and introspection.`,
  },
  {
    slug: 'bollywood-posters',
    title: 'Bollywood Posters',
    order: 4,
    pdfPage: 60,
    blurb: `A curated selection of Bollywood photographic posters from the Vanaprastha collection. Created using real studio photography and cinematic visuals, these posters offer a glimpse into the evolving aesthetics of Indian film promotion. Through powerful imagery, expressive portraits, and iconic layouts, each poster captures the mood, star presence, and storytelling style of its time - an exploration of Bollywood's visual legacy through its most direct and impactful medium.`,
  },
  {
    slug: 'crockery-set',
    title: 'Ceramic Tableware Set',
    order: 5,
    pdfPage: 84,
    blurb: `A vibrant ceramic dinnerware set crafted in Chinhat, Lucknow district, Uttar Pradesh. The pieces feature beautifully hand-painted motifs inspired by tribal art traditions such as Bhil and Warli. Each piece - from plates and bowls to lidded pots - showcases a stylized bird form adorned with geometric patterns, suns, and traditional decorative elements.

The earthy color palette of browns, blacks, and creams enhances the handmade texture and connects the set to the natural world. Functional yet artistic, this collection bridges utility and storytelling, reflecting the deep-rooted relationship between indigenous art and everyday life. It highlights the heritage of Chinhat pottery while celebrating India's rich cultural expressions through daily-use objects.`,
  },
  {
    slug: 'traditional-textiles',
    title: 'Traditional Embroidered Textiles',
    order: 6,
    pdfPage: 86,
    blurb: `Beautifully hand-crafted textiles drawing from tribal art traditions such as Bhil, Warli, and Pithora painting. The pieces include Sujani embroidery from Bihar, Pithora painting from Gujarat, and mirror-and-patchwork textiles from Rajasthan. Each piece showcases intricate craftsmanship, bold patterns, and vibrant colors, reflecting the deep-rooted relationship between indigenous art and everyday life.`,
  },
  {
    slug: 'wooden-toys',
    title: 'Wooden Toys',
    order: 7,
    pdfPage: 90,
    blurb: `A charming ensemble of handcrafted wooden toys rooted in India's rich artistic and spiritual traditions, carefully selected by Surjit Das. These pieces reflect a deep appreciation for cultural storytelling, craftsmanship, and heritage. Each toy features intricate woodwork, delicately carved idols of deities, and traditional Pattachitra paintings that bring mythological and devotional themes to life.

Beyond their visual appeal, these toys represent a deeper connection to India's folk practices and ritual objects. Thoughtfully designed wooden storage boxes accompany many of the pieces, adding both utility and elegance. Together, the toys and their cases offer a unique blend of playfulness, reverence, and design - capturing the spirit of Vanaprastha as a space of quiet reflection and aesthetic richness.`,
  },
  {
    slug: 'masks',
    title: 'Traditional Masks',
    order: 8,
    pdfPage: 100,
    blurb: `A remarkable assembly of ritual, theatrical, and ceremonial masks gathered over many decades by Surjit Das. Spanning diverse regions and cultures - from the sacred landscapes of the Himalayas to the vibrant ritual arts of Southern India and the ancestral spirit worlds of Africa - this collection reflects the powerful visual and spiritual traditions of masking.

These masks are more than objects of art; they are expressions of identity, transformation, and devotion - vessels of memory, spirituality, and cultural heritage. In the spirit of vanaprastha - the third stage of life in Indian philosophy, marked by contemplation and inner reflection - Surjit Das approached collecting with quiet reverence and a deep sense of cultural stewardship.`,
  },
  {
    slug: 'dokra-chola-crafts',
    title: 'Dokra and Chola Crafts',
    order: 9,
    pdfPage: 142,
    blurb: `Vanaprastha houses a unique collection of traditional Indian metal crafts, primarily featuring Dokra and Chola artworks. The Dokra pieces, crafted by tribal artisans using the ancient lost-wax technique, highlight rural motifs, animals, and deities with intricate linear patterns in brass.

Alongside, the Chola bronzes - known for their smooth, divine representations of gods and dancers - reflect the elegance and precision of South Indian temple art. Together, these crafts celebrate India's rich heritage, making Vanaprastha not just a home but a living museum of indigenous artistry.`,
  },
  {
    slug: 'seaforms-minerals-fossils',
    title: 'Seaforms, Minerals & Fossils',
    order: 10,
    pdfPage: 194,
    blurb: `A captivating array of sea shells, corals, minerals, and rocks reflecting the rich diversity and beauty of the natural world. This curated assemblage offers an insightful glimpse into marine and geological formations, showcasing intricate textures, unique shapes, and vivid colors shaped by nature over time. The collection serves as both an aesthetic and educational resource, inviting viewers to explore the intersection of art, science, and natural history.`,
  },
  {
    slug: 'photographs',
    title: 'Photographs',
    order: 11,
    pdfPage: 230,
    blurb: `Framed photographs taken by Surjit Das, reflecting his deep sensitivity toward landscapes, history, and cultural memory. Among the highlights is a striking aerial photograph captured during his return journey from Bhutan to Uttarakhand, offering a rare glimpse of the Himalayan range from above. Also featured is a framed 1953 London Herald front page commemorating the first successful ascent of Mount Everest - a testament to his interest in historic milestones. Each photograph stands as a visual document of a life lived with curiosity, reflection, and an enduring connection to place and time.`,
  },
  {
    slug: 'wooden-gods-sculpture',
    title: "Wooden God's Sculpture",
    order: 12,
    pdfPage: 240,
    blurb: `Carved wooden sculptures of deities from the Vanaprastha collection. The pieces include a Rama and Sita sculpture from Bali, Indonesia, crafted in Suar wood, and a Bayon-style multi-faced head sculpture from Cambodia in teak wood. These works reflect the rich tradition of devotional woodcarving across Southeast Asia.`,
  },
  {
    slug: 'tehri-pillars',
    title: 'Wooden Tehri Pillars',
    order: 13,
    pdfPage: 246,
    blurb: `An intricately carved wooden pillar exemplifying the architectural craftsmanship found in traditional homes and temples of Tehri Garhwal, Uttarakhand. Made from durable local hardwood, the pillar features stylized leaf motifs inspired by nature and fertility - common themes in Himalayan design traditions. The top and bottom are angular and structural, while the central carved portion displays delicate symmetrical vine-like patterns reflecting the region's deep connection to nature and spirituality. These pillars served not only as structural elements but also as artistic expressions of cultural identity and devotion.`,
  },
  {
    slug: 'wooden-vessels',
    title: 'Wooden Vessels',
    order: 14,
    pdfPage: 250,
    blurb: `Traditional handcrafted wooden vessels commonly used in Indian households for storage and utility. The rounded pot, often referred to as a matka, was typically used to store water or grains. The taller cylindrical container served for storing larger quantities of food grains or liquids. These vessels reflect utilitarian craftsmanship while embodying the earthy, organic aesthetics of rural India. The visible grain and patina of the wood highlight the handmade quality and age of these timeless artifacts.`,
  },
  {
    slug: 'butterflies',
    title: 'Framed Butterflies',
    order: 15,
    pdfPage: 252,
    blurb: `A delicate homage to nature - preserved butterfly specimens that capture the quiet poetry of the wild. From the grand wings of the Atlas Moth to the vivid hues of the Plain Tiger and the earthy grace of the Peacock Pansy, each butterfly was carefully mounted within handcrafted wooden-glass frames. This collection is not merely decorative; it is an ode to transformation, stillness, and the fleeting beauty of flight - preserving the elegance of natural life and celebrating nature's most delicate stories.`,
  },
];

for (const c of collections) {
  const frontmatter = [
    '---',
    `title: "${c.title}"`,
    `order: ${c.order}`,
    `pdfPage: ${c.pdfPage}`,
    `items: []`,
    '---',
  ].join('\n');

  const content = `${frontmatter}\n\n${c.blurb}\n`;
  const filePath = join(CONTENT_DIR, `${c.slug}.md`);
  writeFileSync(filePath, content, 'utf-8');
  console.log(`  created ${c.slug}.md`);
}

console.log(`\nSeeded ${collections.length} collections to ${CONTENT_DIR}`);
