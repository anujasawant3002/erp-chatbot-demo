🧠 ERP Chatbot Demo

This project is an ERP system integrated with a real-time chatbot.
It uses a React frontend and a .NET backend with SignalR for bidirectional communication between users and the chatbot.

🚀 Features

🗂️ ERP module with secure login using JWT authentication.

💬 Chatbot integration powered by SignalR for real-time messaging.

⚙️ .NET Backend for authentication, SignalR hub, and API endpoints.

🎨 React Frontend for dashboard, chatbot UI, and interactive interface.

🔐 JWT Authentication for secure access control.




erp-chatbot-demo/
├── backend/                     # .NET backend with SignalR and Controllers
│   ├── ChatHub.cs
│   ├── Controllers/
│   └── ...
├── frontend/
│   └── chatbot-frontend/        # React chatbot frontend UI
├── README.md
└── .gitignore


🧩 Tech Stack

Frontend: React.js, HTML, CSS, JavaScript
Backend: ASP.NET Core, SignalR
Auth: JWT (JSON Web Token)
Communication: WebSocket via SignalR