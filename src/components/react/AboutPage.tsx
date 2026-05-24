import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-warmgray-900">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif font-bold text-warmgray-900 mb-8">Surjit Das</h1>

        <div className="space-y-6 font-sans text-warmgray-700 leading-relaxed">
          <p>
            Surjit Das was a man of many dimensions — a dedicated civil servant, a thoughtful
            scholar, a passionate cricket enthusiast, a connoisseur of culture, and above all, a
            deeply humane individual.
          </p>
          <p>
            As an administrator, he represented the finest traditions of public service. He firmly
            believed in the principles of good governance and worked tirelessly to ensure the
            efficient and ethical delivery of public services. His approach to administration extended
            beyond routine governance, encompassing a genuine commitment to cultural enrichment,
            academic engagement, and the promotion of libraries and sports as pillars of a
            well-rounded society.
          </p>
          <p>
            During his tenure as District Magistrate of Dehradun, he was known for his
            approachability and gracious demeanor. His humility and warmth left a lasting impression
            on everyone who had the privilege of interacting with him.
          </p>
          <p>
            Later, as Chief Secretary of Uttarakhand, Surjit Das played a transformative role in the
            development of key institutions across the state. His vision and dedication were
            instrumental in establishing and strengthening several significant initiatives, including
            the Civil Services Institute, the relocation and expansion of the Doon Library &amp;
            Research Centre, and the upgradation of the Doon District Hospital into the Doon Medical
            College &amp; Hospital.
          </p>
          <p>
            His legacy lives on through the institutions he helped shape and the countless lives he
            touched. Surjit Das remains an enduring symbol of thoughtful leadership, integrity, and
            service — a true officer and a gentleman.
          </p>
        </div>

        <hr className="my-12 border-warmgray-200" />

        <div className="space-y-6 font-sans text-warmgray-700 leading-relaxed">
          <h2 className="text-2xl font-serif font-semibold text-warmgray-800">About Vanaprastha</h2>
          <p>
            Vanaprastha was more than a residence; it was an extension of his mind and spirit —
            quiet, reflective, and richly layered. Within its walls, he curated an extraordinary
            array of artifacts that spoke to his multifaceted interests. From rare tribal masks and
            cultural mascots to paintings, photographs, posters, coins, stamps, and archival
            memorabilia, every object in this collection echoes his passion for heritage, form, and
            meaning.
          </p>
          <p>
            This site is not merely a catalogue; it is a window into the world of S.K. Das. It
            invites you to step into Vanaprastha, to walk among the objects he cherished, and to
            experience the legacy of a man who saw beauty in detail and history in everything.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
