# NBFC & Private Bank Analysis Features

## Complete Analysis Framework for Financial Institutions

---

## 🏦 NBFC (Non-Banking Financial Company) Analysis

### 1. Micro-Lending Scoring (5 Features)

#### 1.1 Employer Stability Analysis
- **Company Type Detection**: Public/Private/Government/Startup
- **Employer Rating**: Based on company size, reputation, industry
- **Job Tenure Analysis**: Continuous employment duration
- **Salary Consistency Score**: Regular vs irregular income patterns
- **Sector Risk Assessment**: Industry-specific risk scoring

#### 1.2 Salary Consistency & Pattern
- **Monthly Salary Detection**: Auto-identifies regular salary credits
- **Salary Day Prediction**: Identifies expected salary date
- **Fluctuation Analysis**: Salary variance over 6-12 months
- **Bonus & Incentive Detection**: One-time vs regular bonuses
- **Salary Growth Tracking**: Year-over-year increment analysis

#### 1.3 Quick Decisioning Metrics
- **Auto-Approval Eligibility**: Pre-approved loan amounts
- **Decision Time**: Real-time underwriting (< 15 minutes)
- **Confidence Score**: AI confidence in decision (0-100)
- **Risk-Based Pricing**: Interest rate recommendation
- **Instant Offer Generation**: Personalized loan offers

#### 1.4 Alternative Data Scoring
- **UPI Transaction Analysis**: Frequency, amount, merchants
- **Digital Wallet Activity**: Paytm, PhonePe, Google Pay usage
- **Mobile Recharge Patterns**: Regular recharges indicate stability
- **Utility Payment History**: Electricity, water, gas, broadband
- **Subscription Payments**: Netflix, Spotify, Amazon Prime (lifestyle indicators)

#### 1.5 Collateral-Free Loan Scoring
- **Unsecured Loan Eligibility**: Max amount without collateral
- **Income Stability Weight**: 40% weightage
- **Banking Behavior Weight**: 30% weightage
- **Credit History Weight**: 20% weightage
- **Alternative Data Weight**: 10% weightage

---

### 2. NBFC-Specific Risk Assessment (8 Features)

#### 2.1 Loan Stacking Detection
- **Simultaneous Loan Count**: Active loans from multiple lenders
- **Total Debt Burden**: Aggregate EMI from all sources
- **Lender Network Analysis**: Identifies if borrowing from competitors
- **Stacking Risk Score**: High = Red flag for over-leverage
- **Cooling Period Recommendation**: Suggested waiting period

#### 2.2 EMI Affordability Analysis
- **Existing EMI Detection**: Auto-identifies all loan payments
- **New EMI Capacity**: How much more EMI customer can afford
- **FOIR Calculation**: Fixed Obligation to Income Ratio
- **Stress Testing**: Impact of interest rate hikes
- **Balloon Payment Detection**: Identifies irregular large payments

#### 2.3 Bounce Analysis (Cheque/NACH/ECS)
- **Total Bounce Count**: Last 12 months
- **EMI Bounces**: Specifically loan EMI bounces
- **Cheque Bounces**: Physical cheque dishonors
- **NACH Bounces**: Auto-debit failures
- **ECS Bounces**: Electronic clearing failures
- **Bounce Trend**: Increasing/Stable/Decreasing
- **Reason Analysis**: Insufficient funds vs other reasons

#### 2.4 Gambling & High-Risk Behavior
- **Betting Platform Detection**: Dream11, MPL, Betway, etc.
- **Casino Transactions**: Online/offline gambling
- **Poker/Rummy Apps**: Skill-based gaming platforms
- **Total Gambling Spend**: Last 6 months
- **Addiction Risk Score**: Frequency-based risk assessment
- **Automatic Decline**: If gambling > 20% of income

#### 2.5 Crypto Trading Risk
- **Crypto Exchange Detection**: WazirX, CoinDCX, Binance, etc.
- **Crypto Investment Amount**: Total invested
- **Trading Frequency**: Day trading vs long-term holding
- **Crypto as % of Income**: Risk indicator
- **Volatility Exposure**: High-risk vs stable coins

#### 2.6 Income Verification for Self-Employed
- **Business Income Pattern**: Regular deposits from customers
- **Cash Deposit Analysis**: Frequency and amounts
- **Merchant Transactions**: Payment gateway deposits
- **GST Payment Detection**: Indicates business operations
- **Professional Tax Payment**: Indicates self-employment
- **Estimated Monthly Income**: AI-based income estimation

#### 2.7 MSME Business Analysis
- **Business Age Estimation**: Based on bank account vintage
- **Customer Diversity**: Number of unique payers
- **Revenue Trend**: Growing/Stable/Declining
- **Seasonal Patterns**: Identifies seasonal businesses
- **Working Capital Needs**: Based on cash cycle
- **Supplier Payment Patterns**: Trade credit analysis

#### 2.8 Default Prediction for Unsecured Loans
- **Probability of Default (PD)**: 0-100% score
- **Expected Loss**: Potential loss amount
- **Recovery Rate Estimate**: Based on similar profiles
- **Early Warning Signals**: Red flags before default
- **Collection Difficulty Score**: How hard to collect if defaults

---

### 3. NBFC Underwriting Criteria (10 Features)

#### 3.1 Income Bracket Classification
- **Low Income**: < ₹25,000/month
- **Lower Middle Income**: ₹25,000 - ₹50,000/month
- **Middle Income**: ₹50,000 - ₹1,00,000/month
- **Upper Middle Income**: ₹1,00,000 - ₹2,50,000/month
- **High Income**: > ₹2,50,000/month

#### 3.2 Credit Tier Segmentation
- **Prime**: Credit score > 750, stable income, no bounces
- **Near-Prime**: Credit score 650-750, minor issues
- **Sub-Prime**: Credit score 550-650, higher risk
- **Deep Sub-Prime**: Credit score < 550, very high risk

#### 3.3 Risk-Based Loan Pricing
- **Prime Rate**: Base rate + 0-2%
- **Near-Prime Rate**: Base rate + 2-5%
- **Sub-Prime Rate**: Base rate + 5-10%
- **Deep Sub-Prime Rate**: Base rate + 10-18%

#### 3.4 Loan Tenure Recommendation
- **Income Stability**: Stable = Longer tenure allowed
- **Age Factor**: Younger = Longer tenure
- **Existing Obligations**: High FOIR = Shorter tenure
- **Asset Type**: Depreciating asset = Shorter tenure

#### 3.5 Maximum Loan Amount Calculation
- **Method 1**: 50x monthly income (capped)
- **Method 2**: Based on FOIR (EMI < 40% of income)
- **Method 3**: Based on banking behavior (6-12x monthly balance)
- **Final Amount**: Minimum of all methods

#### 3.6 Processing Fee & Charges Recommendation
- **Prime Customers**: 0-1% processing fee
- **Near-Prime**: 1-2% processing fee
- **Sub-Prime**: 2-3% processing fee
- **Deep Sub-Prime**: 3-5% processing fee

#### 3.7 Guarantor Requirement Assessment
- **No Guarantor**: Prime, salaried, high income
- **Optional Guarantor**: Near-prime, additional comfort
- **Mandatory Guarantor**: Sub-prime, required
- **Co-Applicant**: Self-employed, additional income

#### 3.8 Insurance & Protection Products
- **Credit Protection Insurance**: Recommended for all
- **Life Insurance**: Recommended for term loans
- **Health Insurance**: Cross-sell opportunity
- **Asset Insurance**: For vehicle/property loans

#### 3.9 Repayment Mode Preference
- **NACH (Auto-Debit)**: Preferred, lowest risk
- **ECS**: Acceptable
- **Post-Dated Cheques**: High-risk customers
- **Manual Payment**: Not recommended

#### 3.10 Portfolio Quality Prediction
- **NPL (Non-Performing Loan) Probability**: 0-100%
- **Vintage Analysis**: Performance by loan age
- **Collection Efficiency**: Expected recovery rate
- **Portfolio Risk**: Contribution to overall risk

---

## 🏦 Private Bank Analysis

### 1. Wealth Profiling (8 Features)

#### 1.1 Net Worth Estimation
- **Liquid Assets**: Cash, deposits, liquid funds
- **Investments**: Stocks, bonds, mutual funds, gold
- **Real Estate**: Property transactions, rental income
- **Liabilities**: Loans, credit card debt
- **Net Worth Score**: Total assets - total liabilities

#### 1.2 Customer Tier Classification
- **Mass Market**: Net worth < ₹10 lakhs
- **Affluent**: Net worth ₹10-50 lakhs
- **High Net Worth (HNI)**: Net worth ₹50 lakhs - ₹5 crores
- **Ultra HNI**: Net worth > ₹5 crores
- **Private Banking Eligible**: Net worth > ₹1 crore

#### 1.3 Investment Portfolio Analysis
- **Equity Investments**: Stock market, mutual funds
- **Debt Investments**: Bonds, FDs, corporate deposits
- **Real Estate**: Property investments
- **Alternative Investments**: Gold, commodities, crypto
- **Portfolio Diversification**: Risk spread across assets

#### 1.4 Risk Appetite Assessment
- **Conservative**: 80% debt, 20% equity
- **Moderate**: 50% debt, 50% equity
- **Aggressive**: 20% debt, 80% equity
- **Very Aggressive**: High-risk instruments, derivatives

#### 1.5 Lifestyle Indicators
- **Premium Credit Card Spend**: International travel, luxury brands
- **High-Value Purchases**: Jewelry, electronics, vehicles
- **Club Memberships**: Golf, private clubs
- **Travel Patterns**: International vs domestic
- **Entertainment**: Fine dining, events, subscriptions

#### 1.6 Business Ownership Indicators
- **Business Income**: Deposits from multiple sources
- **GST Payments**: Regular business tax payments
- **Employee Salary Payments**: Payroll transactions
- **Vendor Payments**: Regular business expenses
- **Company Ownership**: Based on transaction patterns

#### 1.7 Inheritance & Windfall Detection
- **Large One-Time Credits**: > ₹10 lakhs
- **Source Analysis**: Property sale, inheritance, bonus
- **Investment Pattern Post-Windfall**: How money is deployed
- **Wealth Management Opportunity**: Contact within 30 days

#### 1.8 Family Banking Relationship
- **Multiple Account Holders**: Family members with same bank
- **Joint Accounts**: Spouse, children, parents
- **Total Family Relationship Value**: Aggregate deposits/loans
- **Cross-Sell Score**: Products held by family members

---

### 2. Cross-Sell Opportunities (12 Features)

#### 2.1 Credit Card Upgrade
- **Current Card**: Basic/Silver/Gold/Platinum/Black
- **Upgrade Eligibility**: Based on spend pattern
- **Recommended Card**: Best fit based on usage
- **Annual Fee Waiver**: If spend > threshold
- **Reward Optimization**: Maximizes reward points

#### 2.2 Personal Loan Cross-Sell
- **Pre-Approved Amount**: Based on income & banking
- **Interest Rate**: Preferred customer rate
- **No Documentation**: Pre-approved loans
- **Instant Disbursal**: Within 24 hours
- **Balance Transfer**: From other banks

#### 2.3 Home Loan Products
- **Eligibility**: Based on income & age
- **Maximum Loan Amount**: Up to 90% of property value
- **Interest Rate**: Based on credit profile
- **Tenor**: Up to 30 years
- **Top-Up Loan**: For existing customers

#### 2.4 Wealth Management Services
- **Portfolio Management Service (PMS)**: For HNI
- **Private Equity**: Alternative investments
- **Structured Products**: Customized solutions
- **Tax Planning**: CA-assisted tax optimization
- **Estate Planning**: Will, succession planning

#### 2.5 Insurance Products
- **Life Insurance**: Term, endowment, ULIP
- **Health Insurance**: Mediclaim, critical illness
- **General Insurance**: Home, vehicle, travel
- **Wealth Insurance**: Art, jewelry coverage

#### 2.6 Investment Products
- **Mutual Funds**: SIP, lump sum
- **Stocks & Derivatives**: Trading accounts
- **Bonds**: Government, corporate, tax-free
- **Gold**: Digital gold, sovereign gold bonds
- **Real Estate Funds**: REITs, fractional ownership

#### 2.7 Demat & Trading Account
- **Opening Recommendation**: For investment income detected
- **Brokerage Offers**: Discounted rates
- **Margin Funding**: Against securities
- **Research Access**: Premium research reports

#### 2.8 Fixed Deposits & Recurring Deposits
- **Optimal FD Ladder**: Maximizes interest income
- **Tax-Saving FD**: Section 80C benefits
- **Monthly Income Scheme**: For retirees
- **RD Recommendations**: Based on surplus cash

#### 2.9 Locker Services
- **Locker Eligibility**: Premium customers
- **Size Recommendation**: Small/Medium/Large
- **Insurance Coverage**: Against theft, fire
- **Annual Rental**: Waived for HNI

#### 2.10 Forex & Remittance
- **International Travel**: Forex cards
- **Remittances**: Better rates for HNI
- **NRI Services**: NRE/NRO accounts
- **Global Accounts**: Multi-currency accounts

#### 2.11 Business Banking Products
- **Current Account**: Overdraft facility
- **Business Loans**: Working capital, term loans
- **Merchant Services**: POS, payment gateway
- **Trade Finance**: LC, bank guarantee
- **Cash Management**: Collection, payment automation

#### 2.12 Exclusive Services
- **Relationship Manager**: Dedicated RM for HNI
- **Priority Banking**: Fast-track services
- **Lounge Access**: Airport lounge memberships
- **Concierge Services**: Travel, dining, events
- **Golf Memberships**: Complimentary/discounted

---

### 3. Relationship Value Scoring (6 Features)

#### 3.1 Current Value
- **Deposits**: Savings, current, FD, RD
- **Loans**: Home, personal, vehicle outstanding
- **Investments**: Mutual funds, insurance AUM
- **Fees & Charges**: Annual revenue from customer
- **Total Current Value**: Sum of all products

#### 3.2 Lifetime Value (LTV)
- **Age Factor**: Younger = higher LTV
- **Income Growth**: Expected future income
- **Product Penetration**: Cross-sell potential
- **Attrition Risk**: Likelihood of leaving bank
- **Projected LTV**: Next 10-20 years

#### 3.3 Profitability Analysis
- **Revenue**: Interest, fees, charges earned
- **Cost**: Operations, risk, capital cost
- **Net Profitability**: Revenue - Cost
- **Profit Margin**: As % of relationship value
- **ROE (Return on Equity)**: Bank's return

#### 3.4 Engagement Score
- **Digital Banking Usage**: App, internet banking
- **Product Holdings**: Number of products
- **Transaction Frequency**: Active vs dormant
- **Customer Service Contacts**: Complaints, queries
- **NPS (Net Promoter Score)**: Satisfaction level

#### 3.5 Attrition Risk
- **Balance Decline**: Deposits reducing
- **Loan Closures**: Paying off loans early
- **Competitor Transactions**: Transfers to other banks
- **Service Issues**: Unresolved complaints
- **Retention Actions**: Offers to retain customer

#### 3.6 Growth Potential
- **Income Trend**: Growing income
- **Career Progression**: Job promotions
- **Life Stage**: Marriage, children, home purchase
- **Investment Appetite**: Increasing SIPs, FDs
- **Cross-Sell Score**: Products not yet sold

---

## 🎯 Analysis Output for NBFCs

### NBFC Report Includes:
1. **Quick Decision**: Approve/Reject/Manual Review
2. **Loan Amount**: Pre-approved amount
3. **Interest Rate**: Risk-based pricing
4. **Tenure**: Recommended loan period
5. **Processing Fee**: % of loan amount
6. **Risk Score**: 0-100 (higher is safer)
7. **Credit Tier**: Prime/Near-Prime/Sub-Prime
8. **FOIR**: Current and post-loan
9. **Red Flags**: Critical issues found
10. **Recommendations**: Conditions/requirements

---

## 🎯 Analysis Output for Private Banks

### Private Bank Report Includes:
1. **Customer Tier**: Mass/Affluent/HNI/Ultra HNI
2. **Net Worth**: Estimated wealth
3. **Investment Risk Profile**: Conservative/Moderate/Aggressive
4. **Top 5 Cross-Sell Products**: Prioritized opportunities
5. **Relationship Value**: Current LTV
6. **Lifetime Value**: Projected 10-year value
7. **Engagement Score**: Active/Moderate/Low
8. **Attrition Risk**: Low/Medium/High
9. **Personalized Offers**: Customized products
10. **Relationship Manager Assignment**: Yes/No

---

*Powered by FinScore Analyzer - Complete NBFC & Private Bank Intelligence Platform*
