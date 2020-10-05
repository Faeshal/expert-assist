## **EXPERT ASSIST**
![https://img.shields.io/badge/Node-12.15-brightgreen](https://img.shields.io/badge/Node-12.15-brightgreen) ![https://img.shields.io/badge/Express-4.17.1-lightgrey](https://img.shields.io/badge/Express-4.17.1-lightgrey) ![https://img.shields.io/badge/MongoDB-4.2-green](https://img.shields.io/badge/MongoDB-4.2-green) ![https://img.shields.io/badge/Docker-19.03.8-blue](https://img.shields.io/badge/Docker-19.03.8-blue)

![https://i.postimg.cc/zBzB0RV8/Screenshot-3.png](https://i.postimg.cc/zBzB0RV8/Screenshot-3.png)

## **What is Expert Assist ?**
Expert Asisst is Web Application **for connecting user and competent mentor in video conference**. For What ?  Off Course For Solving problem together with the expert. We ensure the mentor that exist is competent because we give test to mentor before they can interact with users.

Build using Node.JS, Express Framework & MongoDB Atlas as a cloud database and using Docker for containerization the app. We'are using docker compose too for managing multi container. For container management we'are using portainer, for Load Balancer handle by HaProxy and much more.
![https://i.postimg.cc/rpCs19yf/Screenshot-5.png](https://i.postimg.cc/rpCs19yf/Screenshot-5.png)

## **Architecture :**
![arch](https://i.postimg.cc/85G5KbPS/arsitektur.png)

## **List Of Feature** 🔥
![https://i.postimg.cc/QMrVKzDB/Screenshot-6.png](https://i.postimg.cc/QMrVKzDB/Screenshot-6.png)

1. Off Course, Video Call Feature with countdown timer based on users payment.
2. Integrated with Xendit Payment Gateway for payment automation.
3. Integrated with Sendgrid Email API for sending Reset Password request, Sending Mentoring Alert etc.
4. Long Polling mechanism for realtime alert.
5. It has commenting system, live chat & Reporting etc.
6. This app have 3 level of authorization, first The User (Expert Seeker), The Mentor (here is The Expert) and The Admin. Here is the Authorization Pages detail :

🐤 **User :**
* Dashboard
* Profile 
* Payment
* Schedule
* Mentoring
* Review

🦁 **Mentor :**
* Dashboard
* Profile
* Exam
* Payment
* Schedule
* Mentoring
* Review
* Withdraw

🐲 **Admin :**
* Dashboard
* Profile
* Exam
* Mentor
* User
* Payment
* Schedule
* Mentoring
* Review
* Withdraw
* Blog
* Message
* Comment
* FAQ

🌈 **FrontPage (for all level) :**
* Landing Page
* Login
* Register
* Forgot Password
* FAQ
* Mentor List 
* Blog with Commenting System

![https://i.postimg.cc/y8RkdHM4/Screenshot-4.**png**](https://i.postimg.cc/y8RkdHM4/Screenshot-4.png)

## **Installation Step 🎊:**
1. Change **example.env** to **.env**
2. Fill the variable with **your own API KEY & MongoDB Database Connection String**
3. Run the server **npm run dev**
4. Access to localhost:3000
5. That's it 

**🐋 If you wanna run with Docker, this is the extra step :**
1. Run docker compose with command : **docker compose up -d** 
2. Because now it's using **load balancer**, access to localhost:80 
4. Up & Running 

**Definetly this app is not perfect, a lot of improvements can be done. Anyway Fell free to contact me. Thank You.**

🗡[faeshal.com](https://faeshal.com) - 2020

