# NetShare - A Real-Time Social Media Application

[![NetShare Demo](https://img.youtube.com/vi/VX2mnBcnr1g/0.jpg)](https://www.youtube.com/watch?v=VX2mnBcnr1g)

NetShare is a comprehensive social media application built using the MERN stack and socket.io, designed to provide users with a seamless experience for all basic social networking operations.

-   **Live Site**: [NetShare Website](https://netshare.netlify.app)
-   **Demo Video**: [Watch Demo](https://www.youtube.com/watch?v=VX2mnBcnr1g)

## Key Features

1. **User Registration and Authentication**: Secure user registration and login functionality.
2. **Profile Customization**: Users can customize their profiles with avatars, bios, and more.
3. **Post Creation and Interaction**: Create, like, comment, and share posts with ease.
4. **Follow System**: Follow and be followed by other users for a tailored feed.
5. **Real-Time Chat**: Engage in real-time chat with online users.
6. **Direct Messaging**: Send private messages to other users.
7. **Group Chat**: Create and participate in group chats.

## Technologies Used

### Front-end

-   TypeScript
-   React
-   Redux
-   Material-UI
-   Formik

### Back-end

-   TypeScript
-   Node.js
-   Express.js
-   Socket.io
-   Jest (for testing)

### Database

-   MongoDB
-   Cloudinary (for storing images)

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/Ashish-Ranjan007/NetShare.git

    ```

2. Install dependencies:

    ```bash
    cd NetShare/client
    npm install

    cd ../server
    npm install

    ```

3. Create a MongoDB database and configure the connection in the server's .env file.

4. Set up Cloudinary for image storage and update the credentials in the server's .env file.

5. Run the development server for both the frontend and backend:

    ```bash
    cd client
    npm run dev

    cd ../server
    npm run start-dev

    ```

6. Visit http://localhost:3000 in your browser to access the application.
