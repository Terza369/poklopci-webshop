This is a webshop application built for practice using Node.js, Express, MySQL and EJS with a focus on backend technologies.

It is hosted by AWS Elastic Beanstalk, static files are stored on AWS S3 bucket, database is on Heroku, emails are handeled by SendGrid and payments by Stripe.

Click [here](http://poklopciwebshop-env.eba-mputmcmn.eu-central-1.elasticbeanstalk.com/) for live app.

### Implemented features:
- User authorization
- Password encryption
- Server-side form validation
- Sessions and cookies
- CSRF attack protection
- SQL injection protection
- Generating and sending E-mails
- Secure password resetting
- File upload and download
- PDF invoice generation
- Payment

### How to install:
- run `npm install`

### How to run:
- run `npm start` to run it with Nodemon or `node app.js` for a regular run
- type in browser: `http://localhost:3000`

However, you will not be able to run it properly due to missing global variables.