export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  intro: string;
  sections: { heading: string; body: string[]; bullets?: string[] }[];
  relatedSearches: string[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-check-pokemon-card-condition",
    title: "How to Check Pokémon Card Condition Before You Buy or Trade",
    description: "A practical checklist for checking corners, edges, surfaces, centering, and photos before making a Pokémon card deal.",
    category: "Buying & trading",
    readTime: "5 min read",
    intro: "A card can look great in a binder and still have wear that matters to another collector. Use the same checklist every time, and ask for clear photos when you cannot inspect a card in person.",
    sections: [
      { heading: "Inspect the four main areas", body: ["Look at the card under bright, indirect light and tilt it slowly. Avoid judging condition from one front-facing photo."], bullets: ["Corners: check for whitening, bends, and softened tips.", "Edges: look for chips, whitening, peeling, or dents.", "Surface: check for scratches, print lines, dents, fingerprints, and creases.", "Centering: compare the borders on the front and back."] },
      { heading: "Ask for the right photos", body: ["For an online purchase or trade, request sharp front and back photos, close-ups of all four corners, and angled surface photos for foil cards. Ask the seller to disclose any flaw that is not obvious in the pictures."] },
      { heading: "Agree on condition before trading", body: ["Condition labels can be subjective. Share the exact photos you used to judge the card and agree on any visible flaws before shipping. Keep the conversation and agreed details in the platform's trade record when possible."] }
    ],
    relatedSearches: ["Pokémon card condition", "card whitening", "raw Pokémon card"]
  },
  {
    slug: "is-pokemon-card-grading-worth-it",
    title: "Is Pokémon Card Grading Worth It?",
    description: "Understand grading costs, condition, turnaround time, and resale uncertainty before sending a card to a grading company.",
    category: "Grading",
    readTime: "6 min read",
    intro: "Grading can protect a card and make its condition easier to communicate, but it does not guarantee a profit. Decide based on the card, its condition, your goals, and the full cost of grading.",
    sections: [
      { heading: "Inspect before you submit", body: ["Check centering, corners, edges, and surface under good light. A small crease or dent can affect a grade even when the card looks clean at first glance."] },
      { heading: "Calculate the full cost", body: ["Include grading fees, shipping both ways, insurance, supplies, and the time your card is unavailable. Compare recent sold prices for raw cards and graded cards at comparable grades, not just asking prices."] },
      { heading: "Choose a goal", body: ["If the card is a personal favorite, grading may be about protection and display. If it is an investment decision, use conservative estimates and remember that fees, demand, and market prices can change."] }
    ],
    relatedSearches: ["PSA grading Pokémon cards", "grading costs", "graded Pokémon card"]
  },
  {
    slug: "how-to-trade-pokemon-cards-safely",
    title: "How to Trade Pokémon Cards Safely Online",
    description: "A step-by-step safety checklist for evaluating a trading partner, documenting condition, shipping cards, and resolving problems.",
    category: "Safety",
    readTime: "5 min read",
    intro: "A good trade starts with clear expectations. Take time to verify details, document condition, and agree on shipping before either person sends a card.",
    sections: [
      { heading: "Confirm the deal in writing", body: ["List the exact cards each person is sending, the agreed condition, any cash difference, and the shipping plan. Do not rely on vague descriptions or pressure to act immediately."] },
      { heading: "Document condition and packing", body: ["Save clear photos of both sides of each card before packing. Use a sleeve and a rigid holder, protect against moisture, and use packaging appropriate to the card's value. Share tracking details when available."] },
      { heading: "Watch for red flags", body: ["Be cautious of inconsistent photos, requests to move to unprotected payment methods, refusal to show the card, or sudden changes to the agreement. Use platform protections when available and never assume a badge means a deal is risk-free."] }
    ],
    relatedSearches: ["safe Pokémon card trading", "trade scam warning signs", "shipping Pokémon cards"]
  },
  {
    slug: "starting-a-pokemon-card-collection",
    title: "How to Start a Pokémon Card Collection You’ll Actually Enjoy",
    description: "Build a focused collection around favorite Pokémon, artwork, sets, or a budget instead of chasing every card.",
    category: "Collecting",
    readTime: "4 min read",
    intro: "The best collection is one you enjoy building. A simple theme helps you set goals, avoid impulse purchases, and know which cards to look for next.",
    sections: [
      { heading: "Pick a collecting theme", body: ["Try collecting one Pokémon, favorite artwork, a specific set, a type, or cards from a particular era. You can always expand your theme later."] },
      { heading: "Make a want list and budget", body: ["Write down the cards you want most and rank them. Set a monthly budget and compare recent sold prices before buying. This makes it easier to pass on listings that do not fit your plan."] },
      { heading: "Track what you own", body: ["Keep a collection list, note condition, and separate cards you are willing to trade from cards you want to keep. Revisit your list before buying duplicates."] }
    ],
    relatedSearches: ["Pokémon card collecting", "Pokémon card want list", "set completion"]
  }
];
