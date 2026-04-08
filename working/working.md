# Professor X AI Interview Platform: Documentation Overview

This folder contains core diagrams that visually explain the inner workings of the `professorX` application. Both the user flow through the React UI and the MongoDB data relationships are modeled here. 

## Diagrams

### 1. [Entity-Relationship Diagram](./er_diagram.md)
The **ER Diagram** outlines the structure of the backend database. We decouple models like `Interview`, `Question`, `Response`, and `Result` to maintain flexibility and scalability. All user sessions revolve around a centralized `User` document.

### 2. [User Flow Diagram](./user_flow_diagram.md)
The **User Flow Diagram** visualizes the journey a user takes from landing on the homepage to navigating the three primary **AI Tools**:
- **Tab 1: Job Role Intelligence**
- **Tab 2: Mock AI Interivew (text-based)**
- **Tab 3: English Communication Assistance**

## How the Application Works

"Professor X" is a MERN stack application built with a focus on dynamically generated content powered by the **Google Gemini API**. 

1. **Frontend (React)**: The client side provides a minimalistic setup where users can request mock interviews or analyze job roles. It handles user inputs (like resume files or text prompts) and sends them backend. The client *never* communicates directly with Gemini.
2. **Backend (Express + Node.js)**: The backend serves as a secure proxy. It orchestrates user authentication (JWT), parses uploaded resumes, and formats context to feed to the Gemini API securely. Using Gemini, it generates dynamic questions for the candidate instead of using static databases. It securely evaluates the candidate's answers similarly.
3. **Database (MongoDB)**: The database is essentially a system of record. Because all questions are dynamically generated at runtime by Gemini, MongoDB is used to archive what was generated, alongside performance metrics, allowing candidates to reflect on past interviews.

For deeper insights into deployment, containerization (Docker), and structural architecture, please check the main `/architecture.md` and `/README.md` roots in this repository.
