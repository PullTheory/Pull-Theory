"use client";

import Link from "next/link";
import ShopCatalog from "./ShopCatalog";

const departments = [
  { title: "Sealed Pokémon", detail: "Booster boxes, ETBs, bundles & collections", href: "/sealed-products", number: "01", tone: "amber", symbol: "▣" },
  { title: "Singles & chase cards", detail: "Find the exact card you're hunting", href: "/search", number: "02", tone: "blue", symbol: "◇" },
  { title: "Graded cards", detail: "Explore slabs and graded collectibles", href: "https://www.ebay.com/sch/i.html?_nkw=Pokemon+PSA+graded+card+slab&mkcid=1&mkrid=711-53200-19255-0&toolid=20023&campid=5339243819&customid=PullTheoryTrade&siteid=0&mkevt=1", number: "03", tone: "violet", symbol: "▤" },
  { title: "Collector marketplace", detail: "Buy, sell and trade with collectors", href: "/marketplace/browse", number: "04", tone: "green", symbol: "⇄" },
];

const features = [
  { title: "Your collection, organized", text: "Keep track of the cards you own and the ones you still want.", href: "/portfolio", link: "Open collection", icon: "▦" },
  { title: "Find your next card", text: "Search the Pokémon card database and discover details.", href: "/search", link: "Search cards", icon: "⌕" },
  { title: "Sell or trade", text: "Connect with the collector community and move your extras.", href: "/sell", link: "Start selling", icon: "↗" },
];

export default function PublicLandingV2() {
  return (
    <main className="pt-storefront">
      <div className="pt-store-topline"><span>THE COLLECTOR'S MARKETPLACE</span><span>COLLECT · CONNECT · DISCOVER</span></div>
      <section className="pt-store-hero">
        <div className="pt-store-hero-copy">
          <p className="pt-store-kicker"><span /> MADE FOR THE HUNT</p>
          <h1>Every great<br /><em>collection</em><br />starts somewhere.</h1>
          <p className="pt-store-lede">The place to discover Pokémon cards, shop sealed product, track your collection, and connect with collectors who love the hobby as much as you do.</p>
          <div className="pt-store-actions">
            <Link href="/shopify" className="pt-store-button">Shop the collection <span>↗</span></Link>
            <Link href="/marketplace/browse" className="pt-store-text-link">Explore marketplace <span>→</span></Link>
          </div>
          <div className="pt-store-proof"><span>01 / DISCOVER</span><span>02 / COLLECT</span><span>03 / CONNECT</span></div>
        </div>
        <div className="pt-store-hero-visual" aria-label="PullTheoryTrade collector card artwork">
          <div className="pt-store-orbit orbit-a" /><div className="pt-store-orbit orbit-b" />
          <div className="pt-store-hero-label label-top">THE NEXT BIG PULL</div>
          <div className="pt-store-card card-shadow"><span>PT / 001</span><div className="pt-store-card-art">✦</div><strong>CHASE<br />YOUR<br /><i>GRAIL.</i></strong><small>PULLTHEORYTRADE · COLLECTOR SERIES</small></div>
          <div className="pt-store-pack"><span>COLLECTOR DROP</span><b>THE<br />HUNT<br /><i>IS ON.</i></b><div className="pt-store-pack-seal">PT</div><small>SEALED · SINGLES · GRADED</small></div>
          <div className="pt-store-hero-sticker">FIND<br /><b>YOUR<br />NEXT.</b></div>
        </div>
      </section>

      <section className="pt-store-departments">
        <div className="pt-store-section-head"><div><p className="pt-store-eyebrow">BROWSE THE HOBBY</p><h2>Shop by <em>department.</em></h2></div><Link href="/shopify">View the full store <span>↗</span></Link></div>
        <div className="pt-store-department-grid">
          {departments.map((item) => <Link key={item.number} href={item.href} className={`pt-store-department tone-${item.tone}`}><span className="pt-store-dept-number">{item.number} / DEPARTMENT</span><span className="pt-store-dept-symbol">{item.symbol}</span><h3>{item.title}</h3><p>{item.detail}</p><span className="pt-store-dept-arrow">Explore ↗</span></Link>)}
        </div>
      </section>

      <section className="pt-store-products">
        <div className="pt-store-section-head"><div><p className="pt-store-eyebrow">PULLTHEORYTRADE STORE</p><h2>Featured <em>finds.</em></h2><p className="pt-store-subhead">Real products from our store, with live pricing and availability.</p></div><Link href="/shopify">Shop all products <span>↗</span></Link></div>
        <ShopCatalog compact heading="Available in the store" />
      </section>

      <section className="pt-store-community">
        <div className="pt-store-community-head"><p className="pt-store-eyebrow">MORE THAN A STORE</p><h2>Build a collection.<br /><em>Make it yours.</em></h2><p>Tools for the way collectors actually collect — from the first pack to the cards you never plan to sell.</p></div>
        <div className="pt-store-feature-list">{features.map((item,index)=><Link href={item.href} key={item.title} className="pt-store-feature"><span className="pt-store-feature-icon">{item.icon}</span><span className="pt-store-feature-copy"><b>{item.title}</b><small>{item.text}</small><strong>{item.link} ↗</strong></span><span className="pt-store-feature-number">0{index+1}</span></Link>)}</div>
      </section>

      <section className="pt-store-membership">
        <div><p className="pt-store-eyebrow">LEVEL UP YOUR HOBBY</p><h2>Collectors belong <em>here.</em></h2><p>Get more from PullTheoryTrade with membership perks, community access, and tools built around your collection.</p></div>
        <Link href="/pricing" className="pt-store-button pt-store-button-light">Explore memberships <span>↗</span></Link>
      </section>
    </main>
  );
}
