# My Application

Requirements
1. Install nodejs at least v10.15.3
2. Install mySQL workbench at least v8.0
3. Install git at least version 2.30
4. A text editor eg. Visual studio, Atom etc.
5. A mail_Jet account(mailjet.com)

Installing applications
1. If this is the first time installing this application, do
git clone https://github.com/online-ticketing/api.git
into any directory of your choice.

2. cd into the api directory and run:
npm install.

3. Edit config/default.json replacing 

    "URL_TO_DATABASE" with your MYSQL database url 
    "DATABASE_USER_NAME" with your MYSQL username
    "DATABASE_PASSWORD" with your MYSQL password
   
  
  
    "MAIL_JET_USER_EMAIL" with your MAIL_JET email
    "MAIL_JET_API_KEY",  with your MAIL_JET api key
    "MAIL_JET_API_SECRET"  with your MAIL_JET secret

4. Start the api server by running:
node .

5. In your browser navigate to http://localhost:3000/explorer/ to view the api endpoints.
