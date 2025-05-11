import { useEffect, useState } from "react";


const STOCK_NEWS_FILES = {
  "CAT": [
    "2025-04-14 13-20_Caterpillar Celebrates First 100 years with a Commitment to the Future Workforce.txt",
    "2025-04-15 09-01_Construction Machinery Q4 Earnings_ Astec (NASDAQ_ASTE) is the Best in the Biz.txt",
    "2025-04-15 10-45_Caterpillar Chairman and CEO Jim Umpleby to become Executive Chairman; Caterpillar Chief Operating O.txt",
    "2025-04-15 10-55_Caterpillar names insider Joe Creed as successor to CEO Umpleby.txt",
    "2025-04-15 12-35_Caterpillar Changes CEOs, With COO Creed Taking Over.txt",
    "2025-04-15 12-55_NYSE Content Advisory_ Pre-Market update + Bank of America beats earnings estimates.txt",
    "2025-04-15 13-00_Here is What to Know Beyond Why Caterpillar Inc. (CAT) is a Trending Stock.txt",
    "2025-04-15 14-50_Palantir, Caterpillar, HPE_ Trending Tickers.txt",
    "2025-04-15 15-15_Wall Street sees strategic continuity as Caterpillar names Creed CEO.txt",
    "2025-04-15 17-38_Caterpillar (NYSE_CAT) Announces CEO Transition With Joseph E. Creed Succeeding Umpleby.txt",
    "2025-04-15 19-50_Caterpillar Names COO Joseph Creed as Next CEO.txt",
    "2025-04-16 13-00_Caterpillar Inc. to Announce First-Quarter 2025 Financial Results on April 30.txt"
  ],
  "AAPL": [
    "2025-04-15 20-08_Is Apple Inc. (AAPL) The Best American Tech Stock to Buy Now_.txt",
    "2025-04-15 21-31_When Apple's Tim Cook Revealed The Real Reason iPhones Are Made In China\u2014And It's Not 'Low Labor Cos.txt",
    "2025-04-15 21-45_Here's Why Apple (AAPL) Fell More Than Broader Market.txt",
    "2025-04-16 08-35_Got $2,000 to Invest_ This Is 1 of the Smartest Vanguard ETFs to Buy and Hold for 20 Years..txt",
    "2025-04-16 09-14_Television could go the way of newspapers if the US economy tips into recession, analyst warns.txt",
    "2025-04-16 12-08_How the U.S.-China Trade War Benefits Applied Materials Stock (AMAT).txt",
    "2025-04-16 13-20_Retail Sales Jump Most In Two Years In Rush To Buy Autos, iPhones Before Trump Tariffs; S&P 500 Fall.txt",
    "2025-04-16 13-31_Jim Cramer_ Apple Inc. (AAPL) Faces an \u201cExistential\u201d China Risk and Is \u201cA Loser to Samsung\u201d.txt",
    "2025-04-16 14-33_After surge to record highs, gold overtakes 'Magnificent 7' as the most crowded trade on Wall Street.txt",
    "2025-04-16 14-44_Nvidia, Apple, Big Banks' trading revenues_ Trending Tickers.txt",
    "2025-04-16 15-00_Trump's trade war unlikely to bring tech manufacturing back to the US.txt",
    "2025-04-16 15-26_Is Apple Inc. (NASDAQ_AAPL) the Best NASDAQ Stock to Buy So Far in 2025_.txt",
    "2025-04-16 15-30_\u2018It\u2019s going to be the small stuff\u2019_ Trump\u2019s tariffs could make cheap tech gadgets not so cheap.txt",
    "2025-04-16 16-00_Apple market cap falls back below $3 trillion as 'relief rally' fades amid new tariff uncertainty.txt",
    "2025-04-16 16-05_How to invest in Nvidia successfully during Trump tariff turmoil.txt",
    "2025-04-16 19-21_Big Tech\u2019s China Risks Go Far Beyond Nvidia.txt",
    "2025-04-16 19-26_Magnificent Seven Stocks Sell Off_ Nvidia Plunges; Apple, Tesla Dive.txt",
    "2025-04-16 21-03_Trading Day_ When the chips are down.txt",
    "2025-04-16 21-08_Why Apple Inc. (AAPL) Is One of the Best Blue Chip Stocks to Buy According to Billionaires.txt",
    "2025-04-16 22-14_Meta Saw TikTok as \u2018Highly Urgent\u2019 Threat, Zuckerberg Says at Antitrust Trial.txt"
  ],
  "PFE": [
    "2025-04-14 15-18_Pfizer's $130B Weight-Loss Dream Just Collapsed.txt",
    "2025-04-14 15-41_Top Midday Stories_ Stocks Rally on Tariff Exemption News; Pfizer Discontinues Development of Weight.txt",
    "2025-04-14 16-45_Pfizer drops obesity pill development after liver injury report.txt",
    "2025-04-14 16-53_Pfizer Inc. (PFE)_ \u201cDead Money\u2026 Close the Casket,\u201d Says Jim Cramer.txt",
    "2025-04-14 17-19_Pfizer to Discontinue Development of Experimental Weight-Loss Pill Danuglipron.txt",
    "2025-04-14 17-23_Pfizer (NYSE_PFE) Discontinues Danuglipron Development After Safety Review in Study.txt",
    "2025-04-14 17-29_Dell stock pops, Pfizer halts GLP-1 pill trial, M&T Bank outlook.txt",
    "2025-04-14 18-08_Sector Update_ Health Care Stocks Rise Monday Afternoon.txt",
    "2025-04-14 19-55_Stocks to Watch Monday_ Apple, Palantir, Intel, Pfizer.txt",
    "2025-04-14 21-15_Top Analyst Reports for Bank of America, Chevron & Stryker.txt",
    "2025-04-14 21-44_Pfizer hits setback in obesity drug race as GLP-1 trial halts.txt",
    "2025-04-15 03-32_Trump Initiates Chips and Drug Probes\u00a0Ahead of More Tariffs.txt",
    "2025-04-15 04-40_Why Viking Therapeutics, Inc.\u00a0(VKTX) Skyrocketed On Monday_.txt",
    "2025-04-15 11-39_Is High-Yield Pfizer Stock Still a Buy After Scrapping Its Weight Loss Pill_.txt",
    "2025-04-15 14-00_NVO, LLY, GPCR & VKTX Stocks Gain Following PFE's Obesity Study Setback.txt",
    "2025-04-15 14-35_Smaller obesity drugmakers jump after Pfizer scraps weight-loss pill.txt",
    "2025-04-15 15-05_BofA keeps Neutral on Pfizer after danuglipron failure as core thesis unchanged.txt",
    "2025-04-15 16-57_Pfizer Halts Obesity Pill Development Amid Safety Concerns.txt",
    "2025-04-15 22-53_Why Pfizer Stock Topped the Market on Tuesday.txt",
    "2025-04-16 20-15_ACIP Votes to Expand Recommendation for Pfizer\u2019s RSV Vaccine ABRYSVO\u00ae to Include Adults Aged 50 to 5.txt"
  ],
  "MMM": [
    "2025-04-15 11-33_3M Company (MMM)_ Among the Best Value Dividend Stocks to Buy According to Billionaires.txt",
    "2025-04-15 13-05_New Filtrete Refillable Air Filter delivers cleaner air and less waste.txt",
    "2025-04-16 16-12_FUTURO Brand just got an upgrade with movement in mind.txt"
  ],
  "CVX": [
    "2025-04-14 07-14_Zacks Value Trader Highlights_ Exxon Mobil, Chevron and EOG Resources.txt",
    "2025-04-14 08-47_BP Discovers Oil at U.S. Far South Prospect in Gulf of Mexico.txt",
    "2025-04-14 11-44_Chevron's Venezuela Oil Exports Stalled by PDVSA Amid Sanctions.txt",
    "2025-04-14 13-16_These Were the 2 Top-Performing Stocks in the Dow Jones Industrial Average in March 2025.txt",
    "2025-04-14 18-50_OPEC+ Slashes Oil Demand Forecast as Trade War Drags on Growth.txt",
    "2025-04-14 19-07_Chevron Expected to Post 'Strong' Underlying Results in Q1, UBS Says.txt",
    "2025-04-14 21-15_Top Analyst Reports for Bank of America, Chevron & Stryker.txt",
    "2025-04-15 08-14_These Oil Stocks Can Thrive Even With Crude Prices Sinking.txt",
    "2025-04-15 08-23_Get Income Like Warren Buffett_ 3 Dividend Stocks in Berkshire Hathaway's Portfolio That Pay You Bac.txt",
    "2025-04-15 10-46_The Zacks Analyst Blog Bank of America, Chevron, Stryker, Value Line and Sypris.txt",
    "2025-04-15 12-25_Is Chevron Corporation (CVX) the Best Undervalued Energy Stock to Invest in Now_.txt",
    "2025-04-15 13-05_OPEC Revises Oil Demand Outlook Amid Shifting Market Trends.txt",
    "2025-04-15 17-41_Chevron Corporation (CVX)_ Among the Best Oil Stocks to Invest in According to Billionaires.txt",
    "2025-04-16 09-45_3 Dividend Stocks Yielding Over 4% to Buy in April.txt",
    "2025-04-16 10-44_Petrobras' Environmental Hurdles Lead to Oil Blocks Auction in Brazil.txt",
    "2025-04-16 13-07_Chevron or ExxonMobil_ Which Big Oil Leads the Permian Charge_.txt"
  ],
  "GS": [
    "2025-04-15 15-12_US Economy to Lose Billions as Foreign Tourists Stay Away.txt",
    "2025-04-15 15-54_Goldman Sachs Q1 Beat Driven by Record Equity Trading, Might See Revenue Decline, RBC Says.txt",
    "2025-04-15 17-43_Goldman Sachs Group (NYSE_GS) Announces $40 Billion Buyback Amid Strong Q1 Earnings.txt",
    "2025-04-15 19-01_Jim Cramer Calls Goldman Sachs (GS) a Changed Firm_ No Longer Gripped by Wall Street\u2019s Wild Side.txt",
    "2025-04-15 19-44_Cisco Systems (CSCO)_ Among the Top Goldman Sachs Value Stocks.txt",
    "2025-04-15 19-47_Is Accenture plc (ACN) Among the Top Goldman Sachs Value Stocks_.txt",
    "2025-04-15 20-25_Gold Edges Higher as Traders React to Expanding Trade War.txt",
    "2025-04-15 21-05_Goldman, Wells Fargo Lead $17 Billion Bank Borrowing Spree.txt",
    "2025-04-16 06-43_Strong China GDP Growth Fails to Stem Calls for Urgent Stimulus.txt",
    "2025-04-16 08-00_Big banks maintain 'the sky is not falling' amid Trump tariff turmoil. So far..txt",
    "2025-04-16 10-00_Big banks were counting on American prosperity, but volatility works too_ Morning Brief.txt",
    "2025-04-16 12-16_Treasury Secretary Scott Bessent to America's biggest CEOs_ Stop worrying.txt",
    "2025-04-16 13-27_Jim Cramer_ Goldman Sachs (GS) \u201cExcels in Turmoil,\u201d But Investment Banking Is \u201cJust Not Making a Lot.txt",
    "2025-04-16 13-29_Big Banks Step Up Stock Buybacks. Goldman and BofA Stand Out..txt",
    "2025-04-16 14-44_Nvidia, Apple, Big Banks' trading revenues_ Trending Tickers.txt",
    "2025-04-16 16-39_Gold Breaks $3,300 as Expanding Trade War Bolsters Haven Demand.txt",
    "2025-04-16 17-53_Princeton CorpGov Forum Featuring Alternative Investments with NYSE, Goldman Sachs, May 22.txt",
    "2025-04-16 17-53_The Goldman Sachs Group, Inc. Just Recorded A 15% EPS Beat_ Here's What Analysts Are Forecasting Nex.txt",
    "2025-04-16 19-34_Is Energy Transfer LP (ET) Among The Top Goldman Sachs Value Stocks_.txt",
    "2025-04-16 19-36_Is Exxon Mobil (XOM) Among The Top Goldman Sachs Value Stocks_.txt"
  ],
  "HAL": [
    "2025-04-14 17-31_Top 3 Dividend Stocks To Consider For Your Portfolio.txt",
    "2025-04-14 18-00_Exclusive_ Halliburton's E-Fleets Lower Haynesville Completions Costs.txt",
    "2025-04-15 12-30_Halliburton and Nabors Bring Drilling Automation to the Forefront in the Middle East.txt",
    "2025-04-15 13-20_Sector Update_ Energy Stocks Decline Premarket Tuesday.txt",
    "2025-04-15 14-00_Analysts Estimate Halliburton (HAL) to Report a Decline in Earnings_ What to Look Out for.txt",
    "2025-04-16 10-00_Trump energy boss\u2019s company plunging 40% is a warning for US oil production.txt",
    "2025-04-16 11-02_Halliburton & Nabors Unveil First Automated Drilling in Oman.txt",
    "2025-04-16 14-00_Oceaneering International (OII) Earnings Expected to Grow_ Should You Buy_.txt",
    "2025-04-16 22-41_Fracker Liberty\u2019s Profit Falls to 3-Year Low as Oil Slumps.txt"
  ],
  "JNJ": [
    "2025-04-15 15-50_Top Midday Stories_ Elliott Takes Stake of Over $1.5 Billion in HP Enterprise; Johnson & Johnson Lif.txt",
    "2025-04-15 15-51_J&J sees tariff impact from exports to China more than global imports_ CFO.txt",
    "2025-04-15 16-05_J&J beat on earnings, but tariffs still pressure pharma sector.txt",
    "2025-04-15 17-30_Johnson & Johnson (NYSE_JNJ) Increases Dividend and Reports Strong Q1 Earnings Growth.txt",
    "2025-04-15 18-07_Equities Little Changed Intraday After Corporate Earnings.txt",
    "2025-04-15 18-40_J&J projects $400m tariff hit but raises sales outlook.txt",
    "2025-04-15 19-01_Johnson & Johnson (JNJ)_ Stuck in a Range but Ready to Break Out if Legal Clouds Clear \u2013 Jim Cramer .txt",
    "2025-04-15 19-26_J&J Forecasts $400 Million in Tariff-Related Costs This Year.txt",
    "2025-04-15 19-49_J&J expects a $400M hit from tariffs, mostly from China.txt",
    "2025-04-15 20-42_These Stocks Moved the Most Today_ Bank of America, Citigroup, Netflix, Boeing, Tesla, HPE, Applied .txt",
    "2025-04-15 20-44_Stocks fizzle after two-day rally driven by bank earnings and tech.txt",
    "2025-04-16 05-26_Q1 2025 Johnson & Johnson Earnings Call.txt",
    "2025-04-16 07-00_Johnson & Johnson (JNJ) Q1 2025 Earnings Call Highlights_ Strong Sales Growth Amid STELARA ....txt",
    "2025-04-16 13-31_Jim Cramer_ Johnson & Johnson (JNJ) Is a \u201cGreat American Company with a AAA Balance Sheet\u201d.txt",
    "2025-04-16 14-00_ETFs in Focus Post JNJ's Q1 Earnings Beat, Dividend Hike.txt",
    "2025-04-16 15-19_Is Johnson & Johnson (JNJ) the Best Dividend Monarch to Invest in Now_.txt",
    "2025-04-16 15-24_Needham upgrades Boston Scientific on easing competition, growth opportunities.txt",
    "2025-04-16 15-59_Big banks report Q1 beats, China stops taking Boeing deliveries_ Morning Buzz.txt",
    "2025-04-16 16-28_J&J\u2019s electrophysiology sales dip amid slow Varipulse start.txt",
    "2025-04-16 22-35_Buy These Defensive Stocks After Beating Earnings Expectations__ ACI, JNJ.txt"
  ],
  "BAC": [
    "2025-04-15 17-35_Big Banks Show Consumers Remained Resilient Heading Into Tariff Turmoil.txt",
    "2025-04-15 17-52_Merrill Lynch, BofA Private Bank Post Flat First-Quarter Profit While Assets, Clients Increase.txt",
    "2025-04-15 19-01_Bank of America (BAC) Will Be \u2018The Usual Fine Self\u2019 \u2013 Jim Cramer Expects Steady Results.txt",
    "2025-04-15 19-36_Bank of America, Citi Stocks Rally; Wall Street Profits From Tariff Chaos.txt",
    "2025-04-15 20-10_Stock Market Today_ Dow Jones, S&P 500 Close Lower; But This Recent IPO Name Bolts Higher For 3rd St.txt",
    "2025-04-15 20-15_Stocks Halt Rally Amid Lingering Trade-War Risks_ Markets Wrap.txt",
    "2025-04-15 20-44_Stocks fizzle after two-day rally driven by bank earnings and tech.txt",
    "2025-04-15 21-05_Goldman, Wells Fargo Lead $17 Billion Bank Borrowing Spree.txt",
    "2025-04-15 22-31_Big Bank investors 'on edge' despite strong Q1 results.txt",
    "2025-04-16 07-01_Bank of America Corp (BAC) Q1 2025 Earnings Call Highlights_ Strong Financial Performance Amid ....txt",
    "2025-04-16 08-00_Big banks maintain 'the sky is not falling' amid Trump tariff turmoil. So far..txt",
    "2025-04-16 08-55_US Dollar Weakness Returns as Trade War Fears Hurt US Assets.txt",
    "2025-04-16 09-30_Corporate insiders flash bullish stock sign by buying into rout.txt",
    "2025-04-16 10-00_Big banks were counting on American prosperity, but volatility works too_ Morning Brief.txt",
    "2025-04-16 11-32_Bank of America CFO says business owners seek clarity on trade policy and prepare for a \u2018slow-growth.txt",
    "2025-04-16 12-14_Big banks push for simpler mortgage rules as housing market slows.txt",
    "2025-04-16 13-29_Big Banks Step Up Stock Buybacks. Goldman and BofA Stand Out..txt",
    "2025-04-16 15-59_Big banks report Q1 beats, China stops taking Boeing deliveries_ Morning Buzz.txt",
    "2025-04-16 16-39_Gold Breaks $3,300 as Expanding Trade War Bolsters Haven Demand.txt",
    "2025-04-16 17-45_Bank Remains Bullish on BAC Despite Target Cut.txt"
  ],
  "GOOGL": [
    "2025-04-16 05-44_Weekly Picks_ \ud83e\udde0 Alphabet\u2019s AI edge, CSL\u2019s pricing power, and a chip underdog.txt",
    "2025-04-16 09-06_Google faces 5 billion pound UK lawsuit for abusing dominance in online search.txt",
    "2025-04-16 10-00_Google used AI to suspend over 39M ad accounts suspected of fraud.txt",
    "2025-04-16 10-22_Google faces \u00a35 billion lawsuit in U.K. over alleged market abuse.txt",
    "2025-04-16 11-33_Google Faces Potential $6.6 Billion U.K. Antitrust Lawsuit Over Search Advertising.txt",
    "2025-04-16 12-28_Market Chatter_ Alphabet's YouTube Prematurely Promised Immunity From Australian Social Media Ban.txt",
    "2025-04-16 13-00_Investors Heavily Search Alphabet Inc. (GOOG)_ Here is What You Need to Know.txt",
    "2025-04-16 13-00_Investors Heavily Search Alphabet Inc. (GOOGL)_ Here is What You Need to Know.txt",
    "2025-04-16 13-03_Google Faces $6.6B UK Lawsuit Alleging Search Monopoly Abuse; Stock Slides.txt",
    "2025-04-16 13-42_Is Alphabet Inc. (NASDAQ_GOOGL) the Best NASDAQ Stock to Buy So Far in 2025_.txt",
    "2025-04-16 13-53_Alphabet (GOOG) Fell in Q1 Despite Meeting Earnings Expectations.txt",
    "2025-04-16 14-10_Google Sued for $6.6 Billion_ Did It Rig the Internet_.txt",
    "2025-04-16 14-33_After surge to record highs, gold overtakes 'Magnificent 7' as the most crowded trade on Wall Street.txt",
    "2025-04-16 14-56_There are 'definitely buying opportunities' in the tech sell-off.txt",
    "2025-04-16 15-04_What Makes Alphabet (GOOG) a Better Stock Compared to its Peers_.txt",
    "2025-04-16 15-05_Celestica price target lowered to $120 from $150 at CIBC.txt",
    "2025-04-16 17-00_Is Alphabet Inc. (NASDAQ_GOOGL) the Best Machine Learning Stock to Buy Now_.txt",
    "2025-04-16 17-19_Prominent Investor Unloads His GOOG Stock.txt",
    "2025-04-16 20-24_Nvidia's $5.5B charge_ 'Nobody' should be 'surprised'.txt",
    "2025-04-16 22-14_Meta Saw TikTok as \u2018Highly Urgent\u2019 Threat, Zuckerberg Says at Antitrust Trial.txt"
  ],
  "MSFT": [
    "2025-04-16 14-33_After surge to record highs, gold overtakes 'Magnificent 7' as the most crowded trade on Wall Street.txt",
    "2025-04-16 14-56_There are 'definitely buying opportunities' in the tech sell-off.txt",
    "2025-04-16 15-00_Trump's trade war unlikely to bring tech manufacturing back to the US.txt",
    "2025-04-16 15-29_Microsoft Corporation (MSFT)_ UBS Cuts Price Target as Data Center Projects Pause.txt",
    "2025-04-16 15-48_Microsoft researchers say they've developed a hyper-efficient AI model that can run on CPUs.txt",
    "2025-04-16 16-00_Apple market cap falls back below $3 trillion as 'relief rally' fades amid new tariff uncertainty.txt",
    "2025-04-16 16-00_Should You be Confident in Microsoft Corporation\u2019s (MSFT) Ability to Retain Leadership Position in A.txt",
    "2025-04-16 17-40_Veteran Analyst Is Bullish on NVDA, MSFT, AVGO.txt",
    "2025-04-16 18-06_OpenAI\u00a0In Talks to Buy Windsurf for About $3 Billion.txt",
    "2025-04-16 19-00_Microsoft vs. Oracle_ Which Cloud Stock Has More Fuel for Growth_.txt",
    "2025-04-16 19-12_Microsoft (MSFT) Faces Capex Shift but Analysts Stay Bullish on Long-Term AI Plans.txt",
    "2025-04-16 19-26_Magnificent Seven Stocks Sell Off_ Nvidia Plunges; Apple, Tesla Dive.txt",
    "2025-04-16 19-27_Software Stocks Are Way Down, But Shouldn\u2019t Be. Microsoft and 2 More to Buy..txt",
    "2025-04-16 19-58_Sector Update_ Tech Stocks Tumble Late Afternoon.txt",
    "2025-04-16 20-24_Nvidia's $5.5B charge_ 'Nobody' should be 'surprised'.txt",
    "2025-04-16 20-26_Why Microsoft Stock Tumbled 3.7% Today.txt",
    "2025-04-16 20-59_Microsoft Target Slashed to $472 as Demand Slips, but AI Bet Keeps Bulls Hopeful.txt",
    "2025-04-16 21-06_Is Microsoft (MSFT) the Best NASDAQ Stock to Buy So Far in 2025_.txt",
    "2025-04-16 21-27_Microsoft Rethinks AI Growth as Recently Greenlit Ohio Project Gets Shelved.txt",
    "2025-04-16 22-14_Meta Saw TikTok as \u2018Highly Urgent\u2019 Threat, Zuckerberg Says at Antitrust Trial.txt"
  ],
  "META": [
    "2025-04-16 09-19_Global Tech Stocks Drop as ASML Warning Adds to Nvidia Curbs.txt",
    "2025-04-16 10-24_Market Chatter_ Meta Platforms Offered $450 Million Settlement to End FTC Antitrust Case.txt",
    "2025-04-16 13-25_Jim Cramer_ Meta (META) Should \u201cBreak It Up\u201d\u2014WhatsApp Alone Is \u201cWorth the Price\u201d.txt",
    "2025-04-16 14-33_After surge to record highs, gold overtakes 'Magnificent 7' as the most crowded trade on Wall Street.txt",
    "2025-04-16 15-20_Meta trial_ 5 key moments from Zuckerberg's testimony.txt",
    "2025-04-16 15-31_Is Meta Platforms Inc. (NASDAQ_META) a Reddit Stock with High Potential_.txt",
    "2025-04-16 15-31_The price Mark Zuckerberg wasn't willing to pay to halt Meta's antitrust trial.txt",
    "2025-04-16 16-00_Apple market cap falls back below $3 trillion as 'relief rally' fades amid new tariff uncertainty.txt",
    "2025-04-16 16-28_Meta Shares Tips on How to Maximize Click-to-Message Ads.txt",
    "2025-04-16 17-00_Is Meta Platforms, Inc. (META) The Best American Tech Stock To Buy Now_.txt",
    "2025-04-16 19-15_Why Meta Platforms, Inc. (META) is the Best Blue Chip Stock to Buy According to Billionaires.txt",
    "2025-04-16 19-26_Magnificent Seven Stocks Sell Off_ Nvidia Plunges; Apple, Tesla Dive.txt",
    "2025-04-16 20-22_Meta CEO Mark Zuckerberg wraps up testimony in antitrust case.txt",
    "2025-04-16 20-27_Zuckerberg_ Snapchat would have grown faster if it accepted $6B buyout offer.txt",
    "2025-04-16 20-54_Rare Bearish Meta Analyst Cuts Price Target, Says Tech Giant 'Starting To Look Vulnerable'.txt",
    "2025-04-16 21-21_Meta boss Mark Zuckerberg finishes giving evidence in antitrust case.txt",
    "2025-04-16 21-32_Meta CEO Zuckerberg Defends Instagram, WhatsApp Acquisitions in FTC Antitrust Trial.txt",
    "2025-04-16 22-14_Meta Saw TikTok as \u2018Highly Urgent\u2019 Threat, Zuckerberg Says at Antitrust Trial.txt",
    "2025-04-16 22-32_Spinning off Instagram, the decline of \u2018friending\u2019 and other takeaways from Mark Zuckerberg at the F.txt",
    "2025-04-16 22-39_Temu, Shein slash digital ads as tariffs end cheap shipping from China, data show.txt"
  ],
  "MCD": [
    "2025-04-13 21-49_Is McDonald\u2019s Corporation (MCD) the Best Kid-Friendly Stock to Buy According to Billionaires_.txt",
    "2025-04-14 12-02_Beat the Market the Zacks Way_ Casey's, Stride, McDonald's in Focus.txt",
    "2025-04-15 09-06_Reflecting On Traditional Fast Food Stocks\u2019 Q4 Earnings_ Arcos Dorados (NYSE_ARCO).txt",
    "2025-04-15 13-00_Chili\u2019s trolls McDonald\u2019s with its new quarter pounder burger.txt",
    "2025-04-15 13-45_MCD Trades Above 200 & 50-Day SMAs_ Time to Buy or Hold the Stock.txt",
    "2025-04-15 14-38_CMG's High Valuation Meets Tariff Noise_ Book Profit or Hold Tight_.txt",
    "2025-04-15 15-29_Dow Jones Leader McDonald's, Netflix Stock Near New Buy Points.txt",
    "2025-04-15 20-00_Is Arcos Dorados Holdings (ARCO) Among the Top Restaurant Stocks to Buy Under $20_.txt",
    "2025-04-15 21-50_Why McDonald's (MCD) Dipped More Than Broader Market Today.txt"
  ],
  "XOM": [
    "2025-04-14 07-14_Zacks Value Trader Highlights_ Exxon Mobil, Chevron and EOG Resources.txt",
    "2025-04-14 13-51_Exxon Mobil Corporation (XOM)_ Among the Best Dividend Paying Stocks According to Hedge Funds.txt",
    "2025-04-14 21-45_Exxon Mobil (XOM) Gains But Lags Market_ What You Should Know.txt",
    "2025-04-14 23-17_Is Exxon Mobil Corporation (XOM) the Best Bargain Stock to Buy in May_.txt",
    "2025-04-15 09-55_Thinking About Buying Dividend Stocks During the 2025 Nasdaq Bear Market_ Consider These Risks First.txt",
    "2025-04-15 11-09_Desiring Durable Passive Income During an Economic Downturn_ These Elite Dividend Stocks Have Hiked .txt",
    "2025-04-15 13-35_Exxon Mobil (XOM)_ The Best Undervalued Energy Stock to Invest in Now.txt",
    "2025-04-15 14-22_2 Stocks Likely to Beat on Q1 Earnings Echoing XOM's Upstream Optimism.txt",
    "2025-04-15 16-58_ExxonMobil Deems Gas Find at Elektra-1 Well Commercially Unviable.txt",
    "2025-04-15 17-42_Is Exxon Mobil Corporation (XOM) the Best Oil Stock to Invest in According to Billionaires_.txt",
    "2025-04-16 10-40_StoneCo   and RH have been highlighted as Zacks Bull and Bear of the Day.txt",
    "2025-04-16 10-44_Petrobras' Environmental Hurdles Lead to Oil Blocks Auction in Brazil.txt",
    "2025-04-16 12-05_ExxonMobil Begins Installing Fourth FPSO to Tap Guyana's Reserves.txt",
    "2025-04-16 13-07_Chevron or ExxonMobil_ Which Big Oil Leads the Permian Charge_.txt",
    "2025-04-16 13-22_Sector Update_ Energy Stocks Advance Premarket Wednesday.txt",
    "2025-04-16 19-36_Is Exxon Mobil (XOM) Among The Top Goldman Sachs Value Stocks_.txt"
  ],
  "NVDA": [
    "2025-04-16 20-25_Nvidia drags the Nasdaq down 3% and the Dow drops 700 points as stocks tumble on trade war woes.txt",
    "2025-04-16 20-26_Stocks resume sell-off as tariff costs hit tech and Powell delivers starkest warning yet on Trump's .txt",
    "2025-04-16 20-30_Taiwan Semiconductor Earnings Are Coming. Guidance Is Key..txt",
    "2025-04-16 20-33_Nasdaq Tumbles 3.1% as Nvidia Drives Tech Sell-Off; Markets Assess Fed Chair Remarks.txt",
    "2025-04-16 20-36_Nvidia stock plunges 7% as a U.S. ban on China AI exports means a $5.5 billion hit.txt",
    "2025-04-16 20-43_AMD, Micron, Broadcom Stocks Drop as U.S. Tightens Chip Export Rules.txt",
    "2025-04-16 20-45_S&P 500 Gains and Losses Today_ Chip Stocks Drop as Top Firms Cite Export Restriction Effects.txt",
    "2025-04-16 20-46_Nvidia Stock Falls. It Got Bad News About Its H20 Chips From the Government..txt",
    "2025-04-16 20-55_Nvidia, caught in the US-China trade war, takes a $5.5 billion hit.txt",
    "2025-04-16 21-03_Tech Stocks Tumble After Nvidia Discloses Chip Export Restrictions.txt",
    "2025-04-16 21-03_Trading Day_ When the chips are down.txt",
    "2025-04-16 21-05_Is NVIDIA Corp. (NVDA) the Best NASDAQ Stock to Buy So Far in 2025_.txt",
    "2025-04-16 21-14_Watch_ Tech Stocks Tumble After Nvidia Discloses Chip Export Restrictions.txt",
    "2025-04-16 21-28_Gold Hits Record High on Trade Tariffs and Nvidia Warning; Tech Stocks Fall.txt",
    "2025-04-16 22-00_TSMC_ Why This Semiconductor Giant Looks Like a Massive Bargain Right Now.txt",
    "2025-04-16 22-05_Investing $5,000 Into Each of These 3 Stocks During the 2020 Crash Would Have Created a Portfolio Wo.txt",
    "2025-04-16 22-06_Why Taiwan Semiconductor Manufacturing Stock Sank Today.txt",
    "2025-04-16 22-40_Trump administration reportedly considers a US DeepSeek ban.txt",
    "2025-04-16 23-20_China Open to Talks If US Shows Respect, Names Point Person.txt",
    "2025-04-16 23-41_Nvidia Faces More Disruption From New China Export Curbs Than Expected, Morgan Stanley Says.txt"
  ],
  "UNH": [
    "2025-04-13 21-57_Is UnitedHealth Group Incorporated (UNH) the Best Medical Stock to Buy According to Billionaires_.txt",
    "2025-04-14 11-25_How Should You Play UnitedHealth Stock Going Into Q1 Earnings_.txt",
    "2025-04-14 12-02_Beat the Market the Zacks Way_ Casey's, Stride, McDonald's in Focus.txt",
    "2025-04-14 13-15_Gear Up for UnitedHealth (UNH) Q1 Earnings_ Wall Street Estimates for Key Metrics.txt",
    "2025-04-14 13-16_These Were the 2 Top-Performing Stocks in the Dow Jones Industrial Average in March 2025.txt",
    "2025-04-14 13-35_\u201cNo China Exposure_ Incredible!\u201d \u2013 Jim Cramer Flags UnitedHealth Group (UNH) as a Safe Haven.txt",
    "2025-04-14 16-00_What Makes UnitedHealth Group (UNH) a Strong Momentum Stock_ Buy Now_.txt",
    "2025-04-15 08-00_The fallout from UnitedHealth\u2019s CEO slaying.txt",
    "2025-04-15 10-07_UnitedHealth to enter mediation with DOJ over Amedisys deal.txt",
    "2025-04-15 11-23_UnitedHealth Group (UNH)_ One of the Best Dividend Paying Stock According to Hedge Funds.txt",
    "2025-04-15 15-00_Key Large Cap Reports to Watch This Week.txt",
    "2025-04-15 16-09_UnitedHealth Group Incorporated (UNH)_ A Bull Case Theory.txt",
    "2025-04-15 17-26_Jim Cramer Calls UnitedHealth Group Incorporated (UNH) a Universal Buy \u2013 \u201cThe Only Gimme\u201d.txt",
    "2025-04-15 19-00_CVS Health vs. UnitedHealth_ Which Healthcare Stock Has More Upside_.txt",
    "2025-04-16 12-00_UnitedHealth (UNH) Q1 Earnings Report Preview_ What To Look For.txt",
    "2025-04-16 13-26_Jim Cramer_ UnitedHealth (UNH) Is an \u201cAmazing Company\u201d and a \u201cJuggernaut Since Day One\u201d.txt",
    "2025-04-16 15-00_3 Stocks Flashing Bullish Momentum.txt",
    "2025-04-16 16-52_Jim Cramer_ UnitedHealth (UNH) \u201cDefines What People Want\u201d \u2013 Totally Domestic and in Demand.txt",
    "2025-04-16 19-58_UnitedHealth Group Earnings Are Coming. All Eyes Are on Its Insurance Division..txt",
    "2025-04-16 23-00_Netflix & UnitedHealth earnings, housing data_ What to Watch.txt"
  ],
  "KO": [
    "2025-04-13 19-15_The Best High-Yield Dividend Stocks to Buy for 2025 and Beyond.txt",
    "2025-04-13 21-44_\u201cPerfect Coca-Cola!\u201d \u2013 Jim Cramer\u2019s On Coca-Cola Company (KO).txt",
    "2025-04-14 13-00_Investors Heavily Search CocaCola Company (The) (KO)_ Here is What You Need to Know.txt",
    "2025-04-14 14-36_The Coca-Cola Company (KO)_ \u201cA Low-Risk Juggernaut\u201d \u2013 Jim Cramer.txt",
    "2025-04-15 08-23_Get Income Like Warren Buffett_ 3 Dividend Stocks in Berkshire Hathaway's Portfolio That Pay You Bac.txt",
    "2025-04-15 08-55_How Dividend Stocks like Coca-Cola Can Help You Rest Easy Amid Stock Market Unrest.txt",
    "2025-04-15 11-09_Desiring Durable Passive Income During an Economic Downturn_ These Elite Dividend Stocks Have Hiked .txt",
    "2025-04-15 12-30_Coca-Cola Europacific Partners (CCEP)_ Among the Best Performing Stocks in Europe.txt",
    "2025-04-16 08-15_Can Coca-Cola Stock Help Keep Your Money Safe During a Market Crash_.txt",
    "2025-04-16 11-00_The Coca-Cola Company's (NYSE_KO) high institutional ownership speaks for itself as stock continues .txt",
    "2025-04-16 14-10_Soda, candy may lose Arkansas food stamp coverage as soon as next year, WSJ says.txt",
    "2025-04-16 15-14_Coca-Cola Vs PepsiCo_ Which Consumer Giant is Built for the Future_.txt",
    "2025-04-16 15-17_The Coca-Cola Company (KO)_ One of the Best Dividend Monarchs to Invest in Now.txt",
    "2025-04-16 15-33_Coke Stock_ Playing Defense With This Beverage Titan's Shares.txt",
    "2025-04-16 21-45_Coca-Cola (KO) Stock Moves -0.25%_ What You Should Know.txt"
  ],
  "DAL": [
    "2025-04-14 08-59_Morgan Stanley, Citi cut US earnings estimates as season starts.txt",
    "2025-04-14 12-00_United Airlines (UAL) Q1 Earnings_ What To Expect.txt",
    "2025-04-14 15-46_Airline Stock Roundup_ DAL's Q1 Earnings Report & JBLU, VLRS in Focus.txt",
    "2025-04-14 21-45_Hyatt, Hilton, and Marriott Stocks Downgraded by Goldman Sachs on Weaker Hotel Outlook.txt",
    "2025-04-15 10-11_China blocks Boeing deliveries in retaliation to Trump tariffs.txt",
    "2025-04-15 11-31_American Airlines to Provide Free Wi-Fi, Joining Race to Court Connected Travelers.txt",
    "2025-04-15 14-03_UPS hires Delta Air Lines to maintain Boeing 757 engines.txt",
    "2025-04-15 14-51_Travel Stocks Are No Ticket to Paradise.txt",
    "2025-04-15 15-06_American Airlines to Launch Free Wi-Fi for Rewards Members in 2026.txt",
    "2025-04-16 14-00_These Were the 2 Worst-Performing Stocks in the S&P 500 in March 2025.txt",
    "2025-04-16 14-19_Tariffs, Trump, and Turmoil.txt",
    "2025-04-16 18-20_United Airlines Says It's Unfazed by Tariffs\u2019 Potential Impact.txt",
    "2025-04-16 18-29_United Airlines Is So Unsure About the Economy It Offers Two Profit Scenarios.txt"
  ],
  "NKE": [
    "2025-04-13 21-21_Is NIKE, Inc. (NKE) Among the Best Golf Stocks to Buy According to Analysts_.txt",
    "2025-04-13 22-12_Tariff-Sensitive Stocks Apple and Nike Are Getting Clobbered. Time to Buy_.txt",
    "2025-04-14 13-47_Is NIKE Inc. (NKE) the Best Kid-Friendly Stock to Buy According to Billionaires_.txt",
    "2025-04-14 15-19_Reviving the Sneaker Resale Market.txt",
    "2025-04-14 17-28_NIKE (NYSE_NKE) Unveils Vibrant Kool-Aid Sneaker Collaboration With Ja Morant.txt",
    "2025-04-15 00-18_China Suppliers Mock Tariffs With Nike, Lululemon\u00a0Deals on\u00a0TikTok.txt",
    "2025-04-15 13-39_Nike initiated, GM downgraded_ Wall Street's top analyst calls.txt",
    "2025-04-15 16-25_NIKE's Jordan Air Rev Brings Flight Lock System to Aid Golfers' Move.txt",
    "2025-04-15 18-41_Trump Ally Marjorie Taylor Greene\u00a0Bought Tesla, Amazon, Blackstone Before\u00a0Rally.txt",
    "2025-04-16 11-45_Down 69%, Nike Is a Brilliant Stock to Buy Only if You Believe 1 Thing.txt",
    "2025-04-16 13-01_1 of Wall Street\u2019s Favorite Stock on Our Buy List and 2 to Ignore.txt",
    "2025-04-16 15-59_Big banks report Q1 beats, China stops taking Boeing deliveries_ Morning Buzz.txt",
    "2025-04-16 20-24_NIKE, Inc. (NKE)_ Among Mid- And Large-Cap Stocks Insiders Are Buying After Trump\u2019s Tariff Rollout.txt"
  ],
  "JPM": [
    "2025-04-15 12-14_Wall Street banks reap $37bn from Trump trading boom.txt",
    "2025-04-15 13-00_JPMorgan Chase & Co. (JPM) Is a Trending Stock_ Facts to Know Before Betting on It.txt",
    "2025-04-15 13-03_Is JPMorgan Chase (JPM) Among The Top Goldman Sachs Value Stocks_.txt",
    "2025-04-15 13-23_Trump Tariffs_ Here's What JPMorgan Investors Need to Know.txt",
    "2025-04-15 13-37_Where Trump Tariffs Stand Now.txt",
    "2025-04-15 18-41_Trump Ally Marjorie Taylor Greene\u00a0Bought Tesla, Amazon, Blackstone Before\u00a0Rally.txt",
    "2025-04-15 20-33_JPMorganChase Declares Preferred Stock Dividends.txt",
    "2025-04-15 20-35_JPMorganChase 2025 Annual Meeting of Shareholders.txt",
    "2025-04-15 21-05_Goldman, Wells Fargo Lead $17 Billion Bank Borrowing Spree.txt",
    "2025-04-16 05-42_1 Wall Street Analyst Thinks JPMorgan Chase Stock Is Going to $260. Is It a Buy_.txt",
    "2025-04-16 08-00_Big banks maintain 'the sky is not falling' amid Trump tariff turmoil. So far..txt",
    "2025-04-16 10-00_Big banks were counting on American prosperity, but volatility works too_ Morning Brief.txt",
    "2025-04-16 10-00_Trump energy boss\u2019s company plunging 40% is a warning for US oil production.txt",
    "2025-04-16 11-41_JP Morgan, Houlihan Lokey lead M&A advisory rankings in North America for Q1 2025.txt",
    "2025-04-16 12-14_Big banks push for simpler mortgage rules as housing market slows.txt",
    "2025-04-16 12-16_Treasury Secretary Scott Bessent to America's biggest CEOs_ Stop worrying.txt",
    "2025-04-16 13-29_Big Banks Step Up Stock Buybacks. Goldman and BofA Stand Out..txt",
    "2025-04-16 14-44_Nvidia, Apple, Big Banks' trading revenues_ Trending Tickers.txt",
    "2025-04-16 17-32_JPMorgan is going after even more customers who allegedly cashed in on the \u2018infinite money glitch\u2019 s.txt",
    "2025-04-16 20-00_Treasuries Rally as Fed\u2019s Powell Focuses on Price Stability.txt"
  ]
};


export function StockNewsList({ selectedStock }) {
  const [articles, setArticles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const filenames = STOCK_NEWS_FILES[selectedStock] || [];
    Promise.all(
      filenames.map((filename) =>
        fetch(`/data/stocknews/${selectedStock}/${filename}`)
          .then((res) => res.text())
          .then((content) => {
            const [date, ...titleParts] = filename.replace(".txt", "").split("_");
            const title = titleParts.join(" ");
            return {
              date,
              title,
              content,
            };
          })
      )
    )
      .then(setArticles)
      .catch((err) => {
        console.error("Error loading articles:", err);
        setArticles([]);
      });
  }, [selectedStock]);

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h3 className="text-xl font-bold mb-4">
        News for {selectedStock}
      </h3>

      {articles.length === 0 && (
        <p className="text-gray-500">No news available.</p>
      )}

      {articles.map((article, index) => (
        <div
          key={index}
          className="mb-4 p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition"
          onClick={() =>
            setExpandedIndex(expandedIndex === index ? null : index)
          }
        >
          <div className="font-semibold text-md">{article.title}</div>
          <div className="text-sm text-gray-500 mb-1">{article.date}</div>

          {expandedIndex === index && (
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
              {article.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
