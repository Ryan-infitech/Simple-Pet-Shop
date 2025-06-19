# Welcome to Viiona Pet Shop

## About This Project

Viiona Pet Shop is a full-stack e-commerce application for pet products and services. The project uses:

- **Frontend**: React with TypeScript, Vite, and Shadcn UI components
- **Backend**: Node.js with Express
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v7+)
- MySQL database

### Installation

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd viiona-pet-shop

# Install dependencies for the frontend
npm install

# Install dependencies for the backend
cd backend
npm install
cd ..
```

### Configuration

1. Create a `.env` file in the frontend root:

```
VITE_API_URL=http://localhost:3000/api
```

2. Configure the backend database in `backend/config/database.js`

### Running the Application

You can run both the frontend and backend with a single command:

```sh
npm run dev:all
```

Or run them separately:

```sh
# Run the backend server
npm run backend

# In another terminal, run the frontend dev server
npm run dev
```

## Features

- Product catalog with categories and search
- Service booking
- Shopping cart
- User authentication
- Admin dashboard for managing products and services

## Backend API Documentation

The backend provides the following API endpoints:

- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Services**: `/api/services`
- **Authentication**: `/api/auth`
- **Cart**: `/api/cart`
- **Orders**: `/api/orders`

## Application Structure

- `src/`: Frontend source code
- `backend/`: Backend API server
- `public/`: Static assets

# Step 3: Install the necessary dependencies.

npm i

# Step 4: Start the development server with auto-reloading and an instant preview.

npm run dev

```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/59f14836-63d6-4126-b44f-c96ee3c42a24) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
```
