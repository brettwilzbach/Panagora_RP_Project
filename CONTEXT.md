# PanAgora Risk Parity Discovery Portal - Project Context

## Project Overview

The PanAgora Risk Parity Discovery Portal is an interactive web application designed to educate investors about Risk Parity portfolio strategies and demonstrate how they achieve superior risk-adjusted returns compared to traditional 60/40 portfolios. The application visualizes key concepts from PanAgora Asset Management's research paper "Risk Parity Portfolios: Efficient Portfolios Through True Diversification."

**Key Value Proposition:**
- Demonstrates that traditional 60/40 portfolios have 93% stock risk despite appearing balanced
- Shows how Risk Parity achieves true 50/50 risk diversification
- Illustrates superior Sharpe Ratio (0.87 vs 0.67) through equal risk contribution
- Interactive simulator allows users to explore different market conditions

## Technology Stack

### Frontend Framework
- **React 19.2.0** with TypeScript
- **Vite 7.2.4** for build tooling and dev server
- **Framer Motion 12.23.26** for animations

### UI Components & Styling
- **Tailwind CSS 3.4.19** for utility-first styling
- **Radix UI** components (tabs, slider, switch, tooltip, progress)
- **Recharts 3.6.0** for data visualization
- **Lucide React 0.562.0** for icons
- Custom design system with dark theme optimized for financial dashboards

### Development Tools
- **TypeScript 5.9.3** for type safety
- **ESLint** with TypeScript support
- **PostCSS** and **Autoprefixer** for CSS processing

## Project Structure

```
Panagora/
├── risk-parity-portal/          # Main React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Header and metrics display
│   │   │   ├── education/       # Philosophy and educational content
│   │   │   ├── simulation/      # Interactive simulation cockpit
│   │   │   ├── strategy/         # Strategy selector and details
│   │   │   ├── ui/              # Reusable UI components
│   │   │   └── visualizers/     # Charts and data visualizations
│   │   ├── lib/
│   │   │   ├── calculations.ts   # Core financial calculations
│   │   │   └── utils.ts         # Utility functions
│   │   ├── App.tsx              # Main application component
│   │   └── main.tsx             # Application entry point
│   ├── public/                  # Static assets
│   └── package.json
├── create_presentation.py        # Python script for generating PowerPoint presentations
├── Panagora_Growth_Strategies.pdf
├── PanAgora-Risk-Parity-Portfolios-Efficient-Portfolios-Through-True-Diversification.pdf
└── panagora_logo.png
```

## Core Features

### 1. Overview Tab
- **Hero Section**: Introduction to Risk Parity concept
- **Key Metrics Display**: Side-by-side comparison of 60/40 vs Risk Parity
  - Sharpe Ratios (0.67 vs 0.87)
  - Risk contribution percentages (93% vs 50% stock risk)
- **Egg Basket Visualizer**: Interactive visualization showing capital allocation vs risk contribution
- **Risk Contribution Chart**: Visual comparison of risk distribution
- **Efficient Frontier Chart**: Risk-return tradeoff visualization
- **Twin Engine Analogy**: Educational content explaining the concept

### 2. Simulator Tab
- **Interactive Cockpit**: Real-time parameter adjustment
  - Stock Volatility slider (5-30%)
  - Bond Volatility slider (2-15%)
  - Correlation slider (-0.5 to 1.0)
  - Leverage slider (1x to 4x)
- **Live Calculations**: Updates portfolio metrics in real-time
- **Side-by-Side Comparison**: Traditional 60/40 vs Risk Parity with current parameters
- **Key Insights Cards**: Efficiency gain, diversification metrics, expected returns

### 3. Strategies Tab
- **Strategy Selector**: Three implementation approaches
  - **Unleveraged**: 1:1 leverage, 4-5% risk target, bond-like volatility
  - **Leveraged Balanced** (Recommended): 2:1 leverage, 8-10% risk target, comparable to 60/40 risk
  - **Global Macro**: 4:1 leverage, 16-20% risk target, hedge fund-like risk
- **Strategy Details**: Features, implementation notes, expected returns

### 4. Learn Tab
- **Philosophy Cards**: PanAgora's core investment principles
  - The Pilot's Instinct (human-machine synthesis)
  - Smart Data vs Big Data
  - True Diversification
- **Educational Content**: Detailed explanations and research data sources
- **Value Proposition**: Competitive advantages and unique features

## Financial Calculations (`lib/calculations.ts`)

### Core Functions

#### Portfolio Metrics Calculation
```typescript
calculatePortfolioMetrics(inputs: PortfolioInputs): PortfolioMetrics
```
Calculates comprehensive portfolio metrics including:
- Portfolio variance and volatility
- Risk contribution percentages (stock vs bond)
- Sharpe Ratio
- Expected returns
- Leveraged metrics

#### Risk Contribution
```typescript
calculateRiskContribution(inputs: PortfolioInputs): { stock: number; bond: number }
```
Calculates marginal risk contribution using:
- Portfolio variance formula: `w₁²σ₁² + w₂²σ₂² + 2w₁w₂σ₁σ₂ρ`
- Risk contribution: `wᵢ × (wᵢσᵢ² + wⱼσᵢσⱼρ) / σₚ`

#### Risk Parity Weights
```typescript
calculateRiskParityWeights(stockVol: number, bondVol: number, correlation: number): RiskParityWeights
```
Calculates optimal weights for equal risk contribution using inverse volatility weighting (simplified for low correlations).

#### Efficient Frontier Generation
```typescript
generateEfficientFrontier(stockVol, bondVol, correlation, points = 50)
generateLeveragedFrontier(stockVol, bondVol, correlation, maxLeverage = 4, points = 50)
```
Generates risk-return curves for visualization.

### Default Parameters (PanAgora Research 1983-2004)
```typescript
PANAGORA_DEFAULTS = {
  stockVolatility: 0.151,      // 15.1% (Russell 1000)
  bondVolatility: 0.046,       // 4.6% (Lehman Aggregate)
  correlation: 0.2,
  riskFreeRate: 0.02,          // 2%
  stockSharpe: 0.55,
  bondSharpe: 0.80,
  traditionalStockWeight: 0.6,
  traditionalBondWeight: 0.4,
}
```

## Key Components

### Visualizers

#### `EggBasketVisualizer.tsx`
Interactive visualization showing the "eggs in one basket" problem:
- Toggle between Capital Allocation view and Risk Contribution view
- Animated pie chart with Recharts
- Visual egg representation with size scaling based on risk
- Insight cards explaining the hidden truth

#### `RiskContributionChart.tsx`
Bar chart component comparing risk contributions:
- Traditional 60/40: 93% stock, 7% bond
- Risk Parity: 50% stock, 50% bond
- Color-coded bars with percentage labels

#### `EfficientFrontier.tsx`
Scatter chart showing risk-return tradeoff:
- Standard efficient frontier curve
- Optional leveraged Risk Parity frontier
- Highlighted points for 60/40 and Risk Parity portfolios
- Interactive tooltips with detailed metrics

### Interactive Components

#### `SimulationCockpit.tsx`
Main interactive simulation interface:
- Four parameter sliders with reset functionality
- Real-time metric calculations
- Side-by-side comparison cards
- Insight cards showing efficiency gains
- Responsive grid layout

#### `StrategySelector.tsx`
Strategy comparison and selection:
- Three strategy cards with hover effects
- Detailed strategy information panel
- Recommended badge for Leveraged Balanced
- Feature lists and implementation notes

### Educational Components

#### `PhilosophyCards.tsx`
- **PhilosophySection**: Three core philosophy cards with tooltips
- **TwinEngineAnalogy**: Detailed analogy explaining the concept
- **ValueProposition**: PanAgora's competitive advantages

### UI Components (`components/ui/`)
Reusable component library built on Radix UI:
- `card.tsx`: Card container with header/content
- `slider.tsx`: Range input slider
- `switch.tsx`: Toggle switch
- `tabs.tsx`: Tab navigation
- `badge.tsx`: Status badges
- `tooltip.tsx`: Hover tooltips
- `progress.tsx`: Progress indicators

## Design System

### Color Palette
- **Primary (Cyan)**: `hsl(199, 89%, 48%)` - Main brand color
- **Accent (Green)**: `hsl(142, 71%, 45%)` - Success/positive metrics
- **Background**: Dark theme with `hsl(222, 47%, 11%)` base
- **Destructive (Red)**: For warnings/negative comparisons

### Typography
- **Sans**: Inter font family
- **Mono**: JetBrains Mono for numerical data

### Animations
- Framer Motion for page transitions
- Stagger animations for card grids
- Hover effects on interactive elements
- Smooth transitions for state changes

### Layout Patterns
- **Cockpit Grid**: Dashboard-style layout with instrument panels
- **Glass Morphism**: Subtle backdrop blur effects
- **Gradient Backgrounds**: Dark gradients for depth
- **Glow Effects**: Cyan glow on primary elements

## Research Basis

### Data Sources
- **Historical Period**: 1983-2004
- **Stock Index**: Russell 1000 (15.1% volatility)
- **Bond Index**: Lehman Aggregate Bond Index (4.6% volatility)
- **Correlation**: 0.2 between stocks and bonds
- **Key Finding**: Traditional 60/40 has 93% stock risk contribution

### Key Metrics
- **Traditional 60/40 Sharpe**: 0.67
- **Risk Parity Sharpe**: 0.87 (+30% improvement)
- **Risk Parity Stock Risk**: 50% (vs 93% in 60/40)
- **Risk Parity Bond Risk**: 50% (vs 7% in 60/40)

### Asset Classes (Full Implementation)
- US Large-cap Equity
- US Small-cap Equity
- International Equity
- Emerging Markets Equity
- Government Bonds
- Corporate Bonds
- TIPS (Treasury Inflation-Protected Securities)
- Commodities

## Supporting Files

### `create_presentation.py`
Python script for generating PowerPoint presentations:
- Uses `python-pptx` library
- PanAgora brand colors (Navy, Royal Blue, Gold/Teal)
- Custom slide layouts:
  - Title slides with logo
  - Two-column comparison slides
  - Multi-section content slides
- Generates growth strategy presentations

## Development Workflow

### Running the Application
```bash
cd risk-parity-portal
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Key Dependencies
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.4
- Tailwind CSS 3.4.19
- Recharts 3.6.0
- Framer Motion 12.23.26
- Radix UI components

## Future Enhancements

### Potential Additions
1. **Multi-Asset Risk Parity**: Extend beyond stocks/bonds to full 8-asset class model
2. **Historical Backtesting**: Show performance over different time periods
3. **Dynamic Rebalancing**: Simulate rebalancing strategies
4. **ESG Integration**: Add ESG considerations to Risk Parity
5. **Export Functionality**: Download charts and reports
6. **Portfolio Comparison Tool**: Compare multiple portfolio strategies
7. **Risk Decomposition**: Detailed breakdown of risk sources
8. **Monte Carlo Simulation**: Probabilistic return scenarios

## Key Insights for Development

### Calculation Accuracy
- Risk contribution uses marginal contribution to risk (MCR) formula
- Simplified inverse volatility weighting for Risk Parity (works well for low correlations)
- Full optimization could be added for higher correlations

### Performance Considerations
- Use `useMemo` for expensive calculations
- Recharts handles large datasets efficiently
- Framer Motion animations are GPU-accelerated

### Accessibility
- Radix UI components include ARIA attributes
- Keyboard navigation supported
- Color contrast meets WCAG standards

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features used
- CSS Grid and Flexbox for layouts

## Git Repository

- **Remote**: `https://github.com/brettwilzbach/Panagora_RP_Project.git`
- **Branch**: `main`
- **Status**: Active development

## Notes

- The application is educational and for demonstration purposes
- All calculations are based on historical research data
- Past performance does not guarantee future results
- The simulator uses simplified models for educational clarity
- Production implementations would require more sophisticated optimization


