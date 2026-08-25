/**
 * ==============================================================================
 * SKILLSFY INSIGHTS — MASTER KNOWLEDGE GRAPH & EDITORIAL DATA ENGINE
 * Domain: insights.skillsfy.in
 * Positioning: Stories. Strategies. Lessons.
 * Ready for Localhost Preview & Firebase Firestore Sync
 * ==============================================================================
 */

const INSIGHTS_DATA = {
  // 1. FOUNDERS DIRECTORY
  founders: [
    {
      id: "nithin-kamath",
      name: "Nithin Kamath",
      title: "Co-Founder & CEO, Zerodha",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      company: "Zerodha",
      companySlug: "zerodha",
      industry: "FinTech & Capital Markets",
      location: "Bengaluru, Karnataka",
      netWorth: "₹30,000+ Cr (Self-Made / Bootstrapped)",
      bio: "Pioneered discount broking in India. Built India's largest retail brokerage without raising external venture capital, prioritizing lean operations, user education, and zero marketing spend.",
      timeline: [
        { year: "2000 - 2008", event: "Traded actively in Indian capital markets and worked in call centers at night to fund trading accounts." },
        { year: "2010", event: "Founded Zerodha with brother Nikhil Kamath with a disruptive flat ₹20 per trade model." },
        { year: "2015", event: "Launched Kite, an ultra-fast in-house web trading platform that transformed Zerodha into a tech-first company." },
        { year: "2019", event: "Became India's largest retail stockbroker by active client volume, overtaking traditional legacy banks." },
        { year: "2023 - 2026", event: "Scaled Rainmatter to back 100+ climate, fintech, and health ventures while maintaining zero debt." }
      ],
      quotes: [
        "If you want long-term customer trust, never incentivize your sales team with commissions.",
        "The hardest thing in business is to say no to fast money that compromises your core product simplicity."
      ],
      lessons: [
        "Product-led distribution always compounds faster than aggressive paid ads.",
        "A lean team of 120 focused engineers can outperform a 2,000-person legacy enterprise.",
        "Free investor education (Zerodha Varsity) created the largest customer acquisition engine in Indian finance."
      ]
    },
    {
      id: "ritesh-agarwal",
      name: "Ritesh Agarwal",
      title: "Founder & Group CEO, OYO",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      company: "OYO",
      companySlug: "oyo",
      industry: "Hospitality & Travel Tech",
      location: "Gurugram, Haryana",
      netWorth: "Self-Made Entrepreneur & Investor",
      bio: "Started Oravel Stays at age 19 in Rayagada, Odisha. Scaled OYO into a global hospitality tech platform standardizing unbranded budget hotels across India, Southeast Asia, and Europe.",
      timeline: [
        { year: "2012", event: "Launched Oravel Stays, inspired by Airbnb, after traveling across budget accommodations in India." },
        { year: "2013", event: "Selected for the prestigious Thiel Fellowship ($100,000 grant) and pivoted Oravel into OYO Rooms." },
        { year: "2016 - 2019", event: "Rapid geographic expansion into 800+ cities backed by SoftBank, Lightspeed, and Sequoia." },
        { year: "2020 - 2022", event: "Navigated the global pandemic crisis by shedding heavy lease models and transitioning to asset-light revenue share." },
        { year: "2024 - 2026", event: "Achieved sustained EBITDA profitability and expanded premium leisure segments (Townhouse & Belvilla)." }
      ],
      quotes: [
        "The biggest risk in a startup is not failing; it is building something that nobody genuinely cares about.",
        "Crisis tests whether your unit economics are real or just subsidized by investor capital."
      ],
      lessons: [
        "Standardization of broken consumer experiences creates instant product-market fit.",
        "Capital intensity must quickly transition to operational profitability during macroeconomic shifts."
      ]
    },
    {
      id: "deepinder-goyal",
      name: "Deepinder Goyal",
      title: "Founder & CEO, Zomato",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      company: "Zomato",
      companySlug: "zomato",
      industry: "Food Tech & Quick Commerce",
      location: "Gurugram, Haryana",
      netWorth: "Blinkit & Zomato Market Leader",
      bio: "Transformed a simple office menu-scanning project (Foodiebay) into a public multi-billion dollar food delivery and quick commerce empire (Blinkit + Zomato).",
      timeline: [
        { year: "2008", event: "Started Foodiebay while working at Bain & Company to digitize office cafeteria menus." },
        { year: "2010", event: "Rebranded to Zomato and expanded to restaurant reviews across major Indian metros." },
        { year: "2015", event: "Launched online food ordering and delivery, entering high-intensity logistics." },
        { year: "2021", event: "Led Zomato to a landmark Indian tech IPO on the National Stock Exchange." },
        { year: "2022 - 2026", event: "Acquired Blinkit and scaled Quick Commerce to become the primary revenue growth driver." }
      ],
      quotes: [
        "Great execution is simply doing ordinary things with extraordinary consistency every single day.",
        "Acquiring Blinkit was counter-consensus at the time, but quick commerce proved to be the ultimate retail distribution highway."
      ],
      lessons: [
        "Bold, counter-narrative acquisitions can redefine an enterprise's entire growth ceiling.",
        "Hyper-local density is the only metric that makes last-mile unit economics profitable."
      ]
    },
    {
      id: "falguni-nayar",
      name: "Falguni Nayar",
      title: "Founder & CEO, Nykaa",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      company: "Nykaa",
      companySlug: "nykaa",
      industry: "Beauty, Wellness & E-Commerce",
      location: "Mumbai, Maharashtra",
      netWorth: "India's Leading Self-Made Woman Billionaire",
      bio: "Left a successful investment banking career at age 50 to launch Nykaa, proving that deep domain expertise, curated authentic supply, and omnichannel retail beat cash-burn marketplaces.",
      timeline: [
        { year: "2012", event: "Founded Nykaa at age 50 after identifying an untapped gap in authentic beauty retail in India." },
        { year: "2015", event: "Pioneered the Omnichannel inventory-led model by opening Nykaa Luxe physical retail stores." },
        { year: "2021", event: "Took Nykaa public in one of India's most successful profitable consumer tech IPOs." }
      ],
      quotes: [
        "Age is just a number. What matters is conviction, preparation, and the willingness to learn from scratch.",
        "Authenticity of product is non-negotiable when building consumer brand equity."
      ],
      lessons: [
        "Curated, authentic inventory beats massive unverified marketplaces in high-trust categories.",
        "Omnichannel (combining digital app + physical experience centers) multiplies customer lifetime value."
      ]
    },
    {
      id: "sridhar-vembu",
      name: "Sridhar Vembu",
      title: "Founder & CEO, Zoho Corporation",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
      company: "Zoho",
      companySlug: "zoho",
      industry: "Enterprise Cloud Software (SaaS)",
      location: "Tenkasi, Tamil Nadu",
      netWorth: "Bootstrapped Tech Icon (Padma Shri)",
      bio: "Pioneered rural tech campuses and built a global SaaS powerhouse serving 100M+ users with zero VC funding, proving that world-class software can be built from Indian villages.",
      timeline: [
        { year: "1996", event: "Co-founded AdventNet in Chennai focusing on network management software." },
        { year: "2005", event: "Rebranded to Zoho and launched online office suite competing with global software giants." },
        { year: "2011 - 2026", event: "Established rural headquarters in Tenkasi, Tamil Nadu and trained thousands through Zoho Schools." }
      ],
      quotes: [
        "We measure our success not by our valuation on paper, but by the resilience of our culture and our people.",
        "When you don't take external venture capital, you can afford to think in 20-year horizons."
      ],
      lessons: [
        "Investing in non-traditional talent pools (Zoho Schools) creates unbeatable loyalty and lower cost structure.",
        "R&D ownership of the entire tech stack creates sustainable gross margins exceeding 85%."
      ]
    }
  ],

  // 2. COMPANIES DIRECTORY
  companies: [
    {
      id: "zerodha",
      name: "Zerodha",
      slug: "zerodha",
      logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&q=80",
      tagline: "India's largest retail brokerage & FinTech pioneer",
      industry: "FinTech / Capital Markets",
      founded: 2010,
      headquarters: "Bengaluru, Karnataka",
      founders: ["Nithin Kamath", "Nikhil Kamath"],
      fundingStage: "100% Bootstrapped (Zero External Capital)",
      valuation: "₹30,000+ Cr (Self-Assessed)",
      businessModel: "Flat-Fee Discount Brokerage + Ecosystem Float",
      revenueModel: "Flat ₹20 per F&O trade + Zero brokerage on Equity Delivery + AMC + Rainmatter Investment Returns",
      moat: "Zero marketing cost, 120-engineer proprietary tech stack, Varsity educational community, high user trust.",
      competitors: ["Groww", "Angel One", "Upstox", "ICICI Direct"]
    },
    {
      id: "zomato",
      name: "Zomato & Blinkit",
      slug: "zomato",
      logo: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=200&q=80",
      tagline: "Better food for more people + Instant commerce in 10 minutes",
      industry: "Food Tech & Quick Commerce",
      founded: 2008,
      headquarters: "Gurugram, Haryana",
      founders: ["Deepinder Goyal"],
      fundingStage: "Public (NSE / BSE: ZOMATO)",
      valuation: "₹2,00,000+ Cr Market Cap",
      businessModel: "Hyperlocal Food Logistics + Dark Store Quick Commerce",
      revenueModel: "Restaurant Commissions (18-25%) + Delivery & Platform Fees + In-app Advertising + Blinkit Dark Store Margins",
      moat: "Unmatched last-mile rider network, high frequency food/grocery purchasing, advertising inventory dominance.",
      competitors: ["Swiggy", "Zepto", "BigBasket"]
    },
    {
      id: "oyo",
      name: "OYO Hotels & Homes",
      slug: "oyo",
      logo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80",
      tagline: "Global hospitality technology platform",
      industry: "Hospitality & Travel Tech",
      founded: 2013,
      headquarters: "Gurugram, Haryana",
      founders: ["Ritesh Agarwal"],
      fundingStage: "Late Stage Venture Backed (SoftBank, Peak XV)",
      valuation: "Global Scale Enterprise",
      businessModel: "Asset-Light Revenue Share Franchise for Unbranded Hotels",
      revenueModel: "20-30% Revenue Share from hotel bookings via OYO OS & App",
      moat: "Proprietary pricing algorithm, standardized guest experience, massive budget traveler distribution.",
      competitors: ["MakeMyTrip", "Treebo", "FabHotels", "Airbnb"]
    },
    {
      id: "zoho",
      name: "Zoho Corporation",
      slug: "zoho",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80",
      tagline: "The Operating System for Business",
      industry: "Enterprise Cloud Software (SaaS)",
      founded: 1996,
      headquarters: "Tenkasi & Chennai, Tamil Nadu",
      founders: ["Sridhar Vembu", "Tony Thomas"],
      fundingStage: "100% Bootstrapped & Highly Profitable",
      valuation: "₹60,000+ Cr Global SaaS Giant",
      businessModel: "Comprehensive Business Suite (55+ SaaS Apps)",
      revenueModel: "SaaS Subscription (Monthly / Annual Per User per App & Zoho One)",
      moat: "Complete in-house R&D ownership, rural campus low-cost structure, 100M+ global enterprise user base.",
      competitors: ["Salesforce", "Microsoft 365", "Freshworks", "HubSpot"]
    }
  ],

  // 3. MASTER STORIES & BUSINESS BREAKDOWNS (Implementing 5-Question Framework)
  stories: [
    {
      id: "zerodha-growth-breakdown",
      slug: "how-zerodha-built-a-2000-crore-profit-machine",
      title: "How Zerodha Built a ₹2,000 Crore Profit Machine Without Spending ₹1 on Ads",
      subtitle: "An unbundled teardown of customer acquisition cost, proprietary tech stack, float income, and why bootstrap economics beat VC competitors.",
      category: "Business Strategy",
      contentType: "Business Breakdown",
      readTime: "12 min read",
      date: "25 August 2026",
      coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      trending: true,
      founderId: "nithin-kamath",
      companyId: "zerodha",
      relatedCourse: {
        title: "Skillsfy AI & Full-Stack Web Development Cohort",
        slug: "workshop-30-aug",
        price: "₹149",
        ctaText: "Learn How Modern Tech & FinTech Apps Are Built →"
      },
      tldr: [
        "Zero Paid Marketing: Acquired 10 Million+ accounts purely through educational content (Varsity) and API developer referrals.",
        "Extreme Operational Efficiency: Generated ₹2,000+ Cr profit with fewer than 120 software engineers.",
        "Revenue Architecture: Flat ₹20 trade fees coupled with float interest income generates 65%+ net profit margins."
      ],
      sections: {
        whatHappened: `In 2010, the Indian brokerage landscape was dominated by large private banks charging between 0.3% and 0.5% commission on every transaction. For active day traders, brokerage fees routinely ate away 20% to 40% of their annual trading returns.

Brothers Nithin and Nikhil Kamath, active traders themselves, recognized that electronic trading exchanges had commoditized trade execution. They founded Zerodha (combining 'Zero' and 'Rodha', the Sanskrit word for barrier) with a radical proposition: flat ₹20 per executed order, regardless of transaction size.

Within a decade, Zerodha surpassed legacy giants like ICICI Direct, HDFC Securities, and Kotak Securities to become India's largest retail stockbroker, generating over ₹2,000 Crores in net annual profit without raising a single rupee in venture capital.`,
        
        whyItHappened: `Traditional brokerages operated with heavy physical branch networks, relationship managers paid on trade turnover, and legacy software that was slow and clunky.

Zerodha identified three fundamental structural shifts:
1. **Democratization of Bandwidth & Smartphones:** Millions of young Indians were coming online with Aadhaar-based e-KYC making paperless account opening instantaneous.
2. **Trader Misalignment:** Legacy brokers made money when clients traded frequently, creating toxic relationships where brokers pushed speculative calls to earn commissions.
3. **Tech Unbundling:** By building Kite in-house on modern web standards (WebSockets, Go, Python), Zerodha provided latency in milliseconds, completely outpacing bank portals.`,

        whatWorked: `### 1. Educational Content as the Core Funnel (Zerodha Varsity)
Instead of buying Google and Facebook ads, Zerodha invested millions into building **Varsity** — a 100% free, comprehensive, zero-jargon capital markets university. Millions of first-time investors learned finance on Varsity and organically opened accounts on Kite.

### 2. Rainmatter API Developer Ecosystem
Zerodha opened its Kite Connect APIs to developers, enabling an entire ecosystem of FinTech startups (Smallcase, Sensibull, Streak, GoldenPi) to build on top of Zerodha. Every new startup became an unpaid distribution partner for Zerodha accounts.

### 3. Culture of Relentless Cost Discipline
Even at thousands of crores in revenue, Zerodha never hired marketing executives, never sponsored sports tournaments, and kept its core engineering team ultra-lean.`,

        whatFailed: `### 1. Technical Glitches During Unprecedented Volatility
During peak market events (such as election days and pandemic crashes), concurrent user spikes caused occasional Kite gateway outages. Rather than deflecting blame, leadership published candid post-mortems and re-engineered the architecture for 10x concurrent traffic.

### 2. The Rise of Aggressive VC-Funded Discount Brokers
Competitors like Groww and Angel One deployed hundreds of crores in performance marketing and referral cashbacks, capturing massive first-time mutual fund users. Zerodha chose to preserve unit economics rather than enter irrational bidding wars.`,

        lessonsLearned: [
          "**Distribution Moats Compound:** Content and developer APIs create permanent organic traffic that doesn't stop when you turn off ad spend.",
          "**Simplicity Beats Feature Bloat:** Fast execution speed on a minimal UI will always win over 100 confusing charts for 95% of users.",
          "**Align Incentives with the Customer:** By never making sales calls or pushing tips, Zerodha built unbreakable multi-generational trust."
        ],

        sources: [
          { title: "MCA Annual Financial Filings (2024-2025)", publisher: "Ministry of Corporate Affairs India", url: "#" },
          { title: "Nithin Kamath In-Depth Interview on Capital Efficiency", publisher: "WTF Podcast / Official YouTube", url: "#" },
          { title: "NSE Active Client Disclosures & Market Share Report", publisher: "National Stock Exchange of India", url: "#" }
        ]
      }
    },
    {
      id: "zomato-blinkit-turnaround",
      slug: "how-zomato-turned-blinkit-into-a-retail-monopoly",
      title: "How Zomato Turned a Struggling Grocery App into a ₹10,000 Cr Quick Commerce Highway",
      subtitle: "The strategic anatomy of dark store density, SKU velocity, and why 10-minute delivery transformed Indian urban consumer habits.",
      category: "Startups & Scale",
      contentType: "Case Study",
      readTime: "10 min read",
      date: "24 August 2026",
      coverImage: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80",
      featured: false,
      trending: true,
      founderId: "deepinder-goyal",
      companyId: "zomato",
      relatedCourse: {
        title: "Skillsfy Digital Business & Growth Strategy",
        slug: "standard-course",
        price: "₹2,999",
        ctaText: "Master Platform Business Models & Growth Strategy →"
      },
      tldr: [
        "Counter-Consensus Bet: When Zomato acquired Blinkit for ₹4,447 Cr in 2022, markets penalized the stock by 20%. Today, Blinkit is valued higher than Zomato's core food delivery.",
        "Dark Store Density: Operating small 3,000 sq. ft. micro-warehouses within a 2 km radius dropped delivery cost per order below ₹50.",
        "Category Expansion: Expanding from tomatoes and milk to iPhones, electronics, and apparel tripled the Average Order Value (AOV)."
      ],
      sections: {
        whatHappened: `In June 2022, Zomato announced the acquisition of Grofers (rebranded to Blinkit) in an all-stock deal valued at approximately ₹4,447 Crore. Stock analysts and institutional investors overwhelmingly criticized the acquisition, calling quick commerce a cash-burning illusion that would destroy Zomato's path to profitability.

Two years later, Blinkit achieved positive contribution margins, expanded dark stores to 800+ across tier-1 cities, and became the fastest-growing retail distribution network in urban India.`,
        
        whyItHappened: `Urban Indian consumers value time and convenience above all else. The traditional scheduled grocery model (order today, deliver tomorrow) failed to capture instant gratification needs.

Blinkit's insights:
1. **Hyperlocal Density Over City Coverage:** Having 20 dark stores in South Delhi creates faster deliveries and higher rider utilization than spreading 20 stores across 5 different cities.
2. **Monetizing Brand Advertising:** FMCG brands (Nestle, HUL, ITC) now spend significant promotional budgets on Blinkit search placement because purchase intent is at the exact moment of decision.`,

        whatWorked: `### 1. The Micro-Warehouse Flywheel
Blinkit standardizes dark store layouts down to the second. Pickers use smart handheld devices with optimized walking routes inside the 3,000 sq ft store, packing orders in under 2 minutes.

### 2. High-Margin Non-Grocery SKUs
During festivals (Rakhi, Diwali, Holi), Blinkit delivers gold coins, electronics, and festive gifts in 10 minutes, generating massive gross margins that subsidize daily essentials.`,

        whatFailed: `### Heavy Initial Cash Burn
Before store-level economics matured, early dark stores suffered from low order density, resulting in heavy per-order operational losses. Stores that did not reach 1,000 orders/day within 90 days were ruthlessly relocated or shut down.`,

        lessonsLearned: [
          "**Audience Attention Equals High Margin Ad Revenue:** When you control the distribution pipe, brands will pay you to be at the top of the shelf.",
          "**Unit Economics Require Hyper-Density:** Delivery logistics only make mathematical sense when riders can complete 3-4 drops every hour."
        ],

        sources: [
          { title: "Zomato Shareholder Letter & Q4 Earnings Disclosures", publisher: "BSE / NSE Corporate Filings", url: "#" },
          { title: "Deepinder Goyal on Quick Commerce Unit Economics", publisher: "Founder Keynotes 2025", url: "#" }
        ]
      }
    },
    {
      id: "zoho-rural-saas-moat",
      slug: "how-zoho-built-a-global-saas-empire-from-indian-villages",
      title: "How Sridhar Vembu Built Zoho into a $1 Billion SaaS Giant from Rural India",
      subtitle: "Why owning the entire tech stack, rejecting VC funding, and training high school dropouts created an indestructible gross margin moat.",
      category: "Leadership & Culture",
      contentType: "Founder Story",
      readTime: "14 min read",
      date: "23 August 2026",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      featured: false,
      trending: true,
      founderId: "sridhar-vembu",
      companyId: "zoho",
      relatedCourse: {
        title: "Skillsfy AI & Full-Stack Web Development",
        slug: "workshop-30-aug",
        price: "₹149",
        ctaText: "Learn How Real Software & Databases Are Engineered →"
      },
      tldr: [
        "100M+ Users Globally: Built over 55 enterprise cloud products used in 180 countries without raising outside venture capital.",
        "Zoho Schools of Learning: Hires and trains talented 12th-grade students, creating deep employee loyalty and avoiding Bengaluru tech salary wars.",
        "Full-Stack R&D Ownership: Owns data centers, compilers, and hardware layers, generating 85%+ gross profit margins."
      ],
      sections: {
        whatHappened: `In 1996, Sridhar Vembu and his brothers founded AdventNet in Chennai. Rather than moving to Silicon Valley to pitch venture capitalists, Vembu established headquarters in Chennai and later expanded into rural Tenkasi, Tamil Nadu.

Today, Zoho Corporation generates over $1 Billion (₹8,000+ Cr) in annual revenue with industry-leading profit margins, competing head-to-head with Microsoft, Google, and Salesforce.`,

        whyItHappened: `Silicon Valley SaaS companies spend 50% to 70% of their revenue on sales and marketing to chase quarterly growth targets demanded by VC boards.

Zoho's contrarian thesis:
1. **Product Depth Over Sales Hype:** When your product is 80% as good as Salesforce at 20% of the price, customers become your sales force.
2. **Talent Geography Arbitrage:** High-tech talent exists across India's small towns. By building rural campuses, Zoho reduced employee attrition to record industry lows.`,

        whatWorked: `### 1. Zoho One (All-in-One Operating System)
Offering 55+ integrated business tools for a single flat subscription eliminated the nightmare of businesses paying 10 different software bills.

### 2. Deep In-House R&D
Zoho owns its servers, networks, AI models, and database infrastructure, ensuring it pays zero rent to AWS or Microsoft Azure.`,

        whatFailed: `### Slower Early Market Recognition
Because Zoho did not spend heavily on billboard ads or PR agencies, enterprise recognition took over 15 years to gain global parity with legacy American software vendors.`,

        lessonsLearned: [
          "**Long-Term R&D Always Beats Short-Term Marketing:** True software value is created in the code and database architecture.",
          "**Resilience Is Greater Than Valuation:** When you owe nothing to external investors, no market downturn can kill your company."
        ],

        sources: [
          { title: "Zoho Financial Performance Filings", publisher: "Registrar of Companies India", url: "#" },
          { title: "Sridhar Vembu Keynote on Rural Technology Ecosystems", publisher: "IIT Madras Leadership Series", url: "#" }
        ]
      }
    }
  ]
};

// Expose on global window for local preview & easy Firebase integration
if (typeof window !== 'undefined') {
  window.INSIGHTS_DATA = INSIGHTS_DATA;
}
