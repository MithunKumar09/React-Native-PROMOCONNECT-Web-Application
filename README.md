# PromoConnect

**PromoConnect** is a dynamic platform designed to streamline and enhance the promotion and marketing processes for users and promoters. Developed using React Native, Expo, and Node.js, the app integrates various functionalities for efficient media management, user interactions, and promotional activities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

PromoConnect is a comprehensive mobile application that facilitates:
- Media capture and management
- Promotion approvals and updates
- Chat interactions between users and promoters
- Payment and verification functionalities

## Features

- **User and Promoter Modules**: Distinct functionalities and screens tailored for users and promoters.
- **Media Capture**: Upload images and post contents, with real-time previews and secure storage.
- **Chat System**: Seamless communication between users and promoters.
- **Promoter Verification**: Special features and badges for verified promoters.
- **Responsive Design**: User-friendly and attractive UI/UX across all devices.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or Yarn
- Firebase CLI (for Firebase operations)
- MongoDb atlas
- JWT token generate

### Clone the Repository

```bash
git clone https://github.com/MithunKumar09/React-Native-PROMOCONNECT-Web-Application.git
cd React-Native-PROMOCONNECT-Web-Application

## Backend Setup
### Navigate to the backend directory:
```bash

cd backend

### Install the dependencies:
```bash

npm install

### Configure environment variables:

### Create a .env file in the backend directory and add the necessary configurations:

**env**

PORT=3000
MONGO_URI=<Your MongoDB URI>
FIREBASE_CONFIG=<Your Firebase Config JSON>

### Start the server:
```bash

node server.js

## Frontend Setup
### Navigate to the frontend directory:

```bash

cd ../frontend

### Install the dependencies:
```bash

npm install

### Start the Expo development server:
```bash

npm start

## Usage
-**Registration and Login:** Use email/password authentication for access.
-**Media Capture:** Use the media capture functionality to record videos and capture images.
-**Promotion Approval:** Submit and manage promotion requests through the app interface.
-**Chat System:** Engage in real-time chats with users or promoters.
