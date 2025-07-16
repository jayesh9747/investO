# InvestO 📈

A modern, feature-rich investment tracking application built with React Native and Expo, designed to provide users with real-time stock market data, watchlist management, and comprehensive stock analysis tools.

## 🚀 Features

### Core Navigation
- **Stocks Tab**: Main dashboard with market overview and quick access to stock information
- **Watchlist Tab**: Personalized stock tracking and portfolio management

### Key Screens

🔍 Explore Screen

Top Gainers and Losers sections with grid cards
Cards display stock symbol, price, change percentage with color indicators
Quick add-to-watchlist functionality

👁️ Watchlist Screen

Multiple custom watchlists with empty state support
Add, edit, delete watchlists with stock summary cards

📊 Product/Stock Details Screen

Real-time stock data with company metrics (market cap, P/E ratio)
Interactive price chart with multiple timeframes (1D-1Y)
Dynamic watchlist add/remove with status indicators

➕ Add to Watchlist Popup

Create new or select existing watchlists
Batch operations with smart name suggestions

📋 View All Screen

Complete stock lists with advanced pagination
Filtering and sorting by price, volume, market cap, and sector

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **State Management**: Zustud State management
- **Navigation**: Expo router
- **Charts**: React Native Chart Kit 
- **UI Components**: React Native Elements
- **Icons**: React Native Vector Icons
- **Storage**: AsyncStorage for local data persistence
- **API**: Stock market data API integration

## Application build link 

https://drive.google.com/file/d/1ew8XdGlbbb-fMIFu38JQOq2uCtpu-9JW/view?usp=sharing

## 📱 Screenshots
<div align="center">
  <img src="https://github.com/user-attachments/assets/7b39f140-4972-4f5a-b844-71f1ca5a813b" width="180" alt="Image 1">
  <img src="https://github.com/user-attachments/assets/8f3cea79-61f2-4acb-a2b5-3a8f72baef23" width="180" alt="Image 2">
  <img src="https://github.com/user-attachments/assets/aecf7ffa-116f-4d4f-bb8c-c3fdc8cc0364" width="180" alt="Image 3">
  <img src="https://github.com/user-attachments/assets/e1bddcc9-4dd9-4af3-ad2a-51ba034bd261" width="180" alt="Image 4">
</div>
<div align="center">
  <img src="https://github.com/user-attachments/assets/bc598244-12cc-4df3-a343-2ee1d96733b5" width="180" alt="Image 6">
  <img src="https://github.com/user-attachments/assets/ffe0d209-0454-4d37-a431-8aebf063f484" width="180" alt="Image 7">
  <img src="https://github.com/user-attachments/assets/8bf5e1c5-afab-49dc-93cc-993ee7aa7eee" width="180" alt="Image 8">
  <img src="https://github.com/user-attachments/assets/42458e1d-d01a-44e6-bb88-33a3bde03dc8" width="180" alt="Image 9">
</div>

## 🎥 Demo Video

https://github.com/user-attachments/assets/a4003c41-762d-4729-b759-f8291ca6f562




## 🏃‍♂️ Running Locally with Expo Go

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI installed globally
- Expo Go app on your mobile device

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/investo-app.git
   cd investo-app
   ```

2. **Install Dependencies**
   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Install Expo CLI (if not already installed)**
   ```bash
   npm install -g @expo/cli
   ```

4. **Set Up Environment Variables**
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   
   # Add your API keys and configuration
   STOCK_API_KEY=your_stock_api_key_here
   STOCK_API_BASE_URL=https://api.stockservice.com
   ```

5. **Start the Development Server**
   ```bash
   npx expo start
   
   # Or with specific options
   npx expo start --clear  # Clear cache
   npx expo start --tunnel # Use tunnel for external access
   ```

### Running on Your Device

1. **Download Expo Go**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to Development Server**
   - **iOS**: Open Camera app and scan the QR code from terminal
   - **Android**: Open Expo Go app and scan the QR code
   - **Alternative**: Enter the URL manually in Expo Go

3. **Network Requirements**
   - Ensure your mobile device and computer are on the same Wi-Fi network
   - If experiencing connection issues, use tunnel mode: `npx expo start --tunnel`

