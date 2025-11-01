# KyroWeb - Crypto Payment Platform UI

Kyro is a service that provides a crypto payment platform API, enabling payments for your businesses.

This repository contains the frontend code for the Kyro web application, which provides a user interface for interacting with the Kyro crypto payment platform API.
The API repository can be found here: https://github.com/KyroPayments/kyro

## Features

- View and manage cryptocurrency payments
- Create and manage crypto wallets
- Enable payments for your apps and customers.
- Real-time status updates

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_KYRO_API_URL=http://localhost:3000/api
REACT_APP_KYRO_API_SWAGGER_URL=http://localhost:3000/api-docs
```

## Running the Application

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

## Components

- **Home**: Landing page with an overview of the platform
- **Payments**: Manage cryptocurrency payments
- **Wallets**: Create and manage crypto wallets

## API Integration

The application communicates with the Kyro backend API through the service layer in `src/services/api.js`. The API service handles:

- Authentication
- Request/response interceptors
- Error handling
- CRUD operations for payments, wallets, and transactions

## Folder Structure

```
src/
├── components/     # React components
├── services/       # API services and utilities
├── App.js          # Main application component
└── index.js        # Application entry point
```

## Technologies Used

- React 18
- React Router v6
- React Bootstrap
- Axios for HTTP requests
- Web3.js for blockchain interaction
- React Hook Form for form handling