# 🤖 AI Token Tracker Dashboard

A full-stack web application that helps AI developers, students, and companies track, optimize, and visualize token usage across different AI models. Monitor your API consumption, estimate costs, and analyze performance through an intuitive dashboard.

## ✨ Features

- **🔐 User Authentication** - Secure JWT-based registration and login system
- **🤖 Multi-Model Support** - Compatible with GPT-3.5, GPT-4, Claude-2, Llama 2, and more
- **📊 Real-time Analytics** - Track token usage, costs, and response times
- **💰 Cost Estimation** - Automatic cost calculation based on model pricing
- **📈 Interactive Dashboard** - Beautiful charts and visualizations
- **💾 Data Export** - Download usage reports as CSV files
- **🎨 Modern UI** - Glass morphism design with neural network backgrounds

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface library
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Interactive charting library
- **Axios** - HTTP client for API calls
- **React Router DOM** - Client-side routing
- **Lucide React** - Modern icons

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### AI Services
- **Hugging Face API** - AI model inference
- **Custom Token Counter** - Token calculation utilities

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB (local or MongoDB Atlas)
- Hugging Face API account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd ai-token-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

1. **Backend Environment Variables** (`backend/.env`)
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai_token_tracker
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   HUGGING_FACE_API_KEY=your_hugging_face_api_key
   HF_API_URL=https://api-inference.huggingface.com/models
   CLIENT_URL=http://localhost:3000
   ```

2. **Frontend Configuration** (`client/vite.config.js`)
   ```javascript
   export default {
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: 'http://localhost:5000',
           changeOrigin: true,
         },
       },
     },
   }
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Application runs on: `http://localhost:3000`

3. **Access the Application**
   - Open your browser and go to `http://localhost:3000`
   - Register a new account or login
   - Start tracking your AI token usage!

## 📁 Project Structure

```
ai-token-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Layout.jsx
│   │   ├── contexts/      # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Application entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── backend/               # Node.js backend
│   ├── controllers/       # Route controllers
│   │   ├── authController.js
│   │   ├── tokenLogController.js
│   │   └── aiController.js
│   ├── models/           # Database models
│   │   ├── User.js
│   │   └── TokenLog.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── logs.js
│   │   └── ai.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── services/         # Business logic
│   │   └── aiService.js
│   ├── utils/            # Utility functions
│   │   └── tokenCounter.js
│   ├── server.js         # Server entry point
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Token Logs
- `GET /api/logs` - Get user's token logs
- `GET /api/logs/stats` - Get usage statistics
- `POST /api/logs` - Create new token log
- `GET /api/logs/export` - Export logs as CSV

### AI Processing
- `POST /api/ai/process` - Process AI prompt
- `GET /api/ai/models` - Get available AI models

## 🎯 Key Features Explained

### Token Tracking
- **Prompt Tokens**: Count of input tokens sent to AI model
- **Completion Tokens**: Count of output tokens received from AI model
- **Total Tokens**: Sum of prompt and completion tokens
- **Cost Calculation**: Automatic cost estimation based on model pricing

### Supported AI Models
- GPT-3.5 Turbo ($0.002 per 1K tokens)
- GPT-4 ($0.06 per 1K tokens)


### Dashboard Analytics
- **Real-time Stats**: Live updating usage statistics
- **Interactive Charts**: Token usage trends and cost analysis
- **Model Distribution**: Pie charts showing model usage patterns
- **Response Time Tracking**: Performance monitoring across requests

## 🔧 Development

### Adding New AI Models
1. Update the models array in `Dashboard.jsx`
2. Add pricing in `utils/tokenCounter.js`
3. Implement API integration in `services/aiService.js`

### Customizing the UI
- Modify Tailwind classes in components
- Update color schemes in `tailwind.config.js`
- Add new charts using Recharts components

### Database Schema
**User Model:**
- name, email, password, company, subscription type

**TokenLog Model:**
- user reference, prompt, response, model used
- token counts, estimated cost, response time
- timestamps and status fields

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist folder to Vercel
```

### Backend (Render)
```bash
cd backend
# Set environment variables in Render dashboard
# Deploy from GitHub repository
```

### Database (MongoDB Atlas)
- Create free cluster on MongoDB Atlas
- Update `MONGODB_URI` in environment variables
- Whitelist deployment IP addresses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for providing AI model APIs
- **Tailwind CSS** for the amazing utility-first CSS framework
- **Recharts** for beautiful and interactive charts
- **React Community** for excellent documentation and support

## 📞 Support

If you have any questions or need help with setup:
1. Check the existing GitHub issues
2. Create a new issue with detailed description
3. Provide steps to reproduce any bugs

---

**⭐ Don't forget to star this repository if you find it helpful!**

---

*Built with ❤️ using the MERN stack*