import TradeForm from '../components/TradeForm';

export const metadata = {
  title: 'Card Trades',
  description: 'Create and manage card trade listings',
};

export default function TradePage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Trade Cards</h1>

      <p className="mb-4">
        Use this form to propose a card trade. All trades require both parties
        to ship their cards to an independent authenticator. The authenticator
        will verify both cards are authentic before shipping them to their new
        owners.
      </p>

      <section className="bg-gray-50 border rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">How the process works</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Both parties agree to the trade terms and submit shipping info.</li>
          <li>
            Ship your card to the nominated authenticator (we'll provide an
            address after both parties accept).
          </li>
          <li>The authenticator verifies authenticity of both cards.</li>
          <li>
            If both cards are authentic, the authenticator forwards each card to
            the other party.
          </li>
          <li>
            If a card is determined to be fake, the authenticator will return
            the real card and permanently destroy the counterfeit card.
          </li>
        </ul>
      </section>

      <TradeForm />
    </main>
  );
}
