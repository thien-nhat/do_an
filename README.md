## UWC by NodeJs using MVC 

### Overview
The Node.js application is constructed with the Model-View-Controller (MVC) architectural pattern, featuring a RESTful API to seamlessly handle CRUD (Create, Read, Update, Delete) requests for tasks and users. Additionally, it utilizes nodemailer to conveniently send email notifications to Gmail when passwords are forgotten.

### Requirements
To run this app, you'll need to have the following software installed on your machine:

* Node.js
* MongoDB

### Installation
1. Clone this repository to your local machine
```
git clone https://github.com/ngonhatthien120/UWC.git
```

2. Navigate to the project directory
```
cd UWC
```

3. Install dependencies
```
npm install
```

4. Start the app
```
npm start
```

### Usage
Once the app is running, you can use any RESTful client (e.g. Postman, Insomnia) to access the following endpoints:
1. Users:\
`POST /signup`: Returns a list of all users.\
`POST /login`: Returns a list of all users.\
`POST /forgotPassword`: Returns a list of all users.\
`PATCH /resetPassword/:token`: Returns a list of all users.

`PATCH /updateMyPassword`: Returns a list of all users.\
`GET /myInfo`: Returns a list of all users.\
`PATCH /updateMe`: Returns a list of all users.

`GET /users`: Returns a list of all users.\
`GET /users/:id`: Returns a single user by ID.\
`POST /users`: Creates a new user.\
`PATCH api/tasks/:id`: Updates an existing user.\
`DELETE /users/:id`: Deletes a user.

2. Tasks:\
`GET api/tasks`: Returns a list of all tasks.\
`GET api/tasks/:id`: Returns a single task by ID.\
`POST api/tasks`: Creates a new task.\
`PATCH api/tasks/:id`: Updates an existing task.\
`DELETE api/tasks/:id`: Deletes a task.
