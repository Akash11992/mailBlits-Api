const express = require("express");
const bodyParser = require("body-parser");
// const dbConn = require("./config/db.config1");
const nodemailer = require("nodemailer");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const unsubscribeRoutes = require('./src/routes/unsubscribe.route');
const segmentRoutes = require('./src/routes/segment.route');
const path = require('path');
const templateRoute = require("./src/Controller/templeteRender.controllar");
const request_save = require("./src/middleware/request-response");
const integratedModuleRoute = require('./src/routes/integratedModule.route');
const openAiRoute = require('./src/routes/open-ai.route');
require('./src/cron');

require("dotenv").config();

const app = express();
app.use(express.json());

// Setup server port
const port = process.env.PORT || 5000;



// Configure Express session
app.use(
  session({
    secret: "mySecretSQM",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  requireTLS: true,
  auth: {
    user: "sqm.client.master@gmail.com",
    pass: "Cylsys@2",
  },
});

app.use('/unsubscribe', unsubscribeRoutes); app.post("/send-email", async (req, res) => {
  const { from, to, subject, text } = req.body;

  // Send email
  try {
    let info = await transporter.sendMail({
      from: "gaurav.shinde592@gmail.com",
      to: "gaurav.shinde@cylsys.com", // Convert array of recipients to comma-separated string
      subject: subject,
      text: text,
    });
    console.log("Email sent: " + info.response);
    res.send("Email sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send email");
  }
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect to a page where the user can set their email as the sender
    res.redirect("/set-sender-email");
  }
);

// app.use(function (req, res, next) {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://apps.sendquickemail.com, http://localhost:34502, http://103.228.83.115:34502", "https://mailblitz.cylsys.com"
//   );
//   res.header("Access-Control-Allow-Headers", "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

const cors = require("cors");
app.use(
  cors({
    origin: [
      "https://apps.sendquickemail.com",
      "http://localhost:34502",
      "http://103.228.83.115:34502",
      "https://mailblitzuat.cylsys.com",
      "https://mailblitz.cylsys.com",
      "https://letterdesk.cylsys.com",
      "https://mailblitzuat.cylsysuat.com",
      "http://mailblitzuat.cylsysuat.com"
    ],
    credentials: true,
    methods: "POST, GET, PUT, OPTIONS, DELETE,PATCH",
  })
);

app.get("/", (req, res) => {
  res.send("Hello World! SendQuickEMail is live!!");
});

// app.use((err, req, res, next) => {
//   // console.log(err);
//   err.statusCode = err.statusCode || 500;
//   err.message = err.message || "Internal Server Error";
//   req.status(err.statusCode).send({
//     message: err.message,
//   });
// });



const routes = require('./src/routes/routes');
const routes1 = require('./src/routes/contact.route');
const routes2 = require('./src/routes/NewGetSegment');
const routes3 = require('./src/routes/company');
const routes4 = require('./src/routes/list');
const emailSenderRoute = require('./src/routes/emailSender');
// -----------------------
const DeleteSegmentRoutes = require("./src/routes/DeleteSegment.route");
const DeleteTemplateRoutes = require("./src/routes/DeleteTemplate.route");

// .....................................................new..........................
const contact_bulkfile = require("./src/routes/contactfile.route");
const template = require("./src/routes/template.route");
const campaign = require("./src/routes/campaign.route");
const emailScheduler = require("./src/routes/scheduler.route");
const reportRoute = require('./src/routes/reports.route')
const userPermission = require("./src/routes/UserPermission.routes");
const dashboardRoutes = require('./src/routes/dashboard.route')
const letterHead = require('./src/routes/letterHead.route')
const approvalFlow= require('./src/routes/user_approval_route');

//...............................
//req-res-log//middleware
app.use(async (req, res, next) => {

  try {
    const request_id = await request_save.save_request_log(req);

    const originalSend = res.send;
    res.send = function (data) {
      // console.log(`Sent ${res.statusCode} response for ${data}`);
      if (res.statusCode === 200) {
        // console.log(request_id, "update_request_log");
        const request_update = request_save.update_request_log(request_id, data);
      } else {
        const request_insert = request_save.save_error_log(
          req,
          res,
          data
        );

      }
      originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error("Error:", error);
    // Handle errors
    next(error); // Pass error to Express error handling middleware
  }
});
//......................................
app.use('/api/v1', segmentRoutes);
// -----------------------------
app.use(emailScheduler)
app.use(templateRoute)
app.use(dashboardRoutes)
app.use(reportRoute)

app.use("/DeleteSegment", DeleteSegmentRoutes);
app.use("/DeleteTemplate", DeleteTemplateRoutes);
app.use(routes);
app.use(routes1);
app.use(routes2);
app.use(routes3);
app.use(routes4);
app.use("/email-sender", emailSenderRoute);
app.use("/campaign", campaign);
app.use('/userpermission', userPermission);
app.use('/letterHead', letterHead);
app.use('/integratedModule', integratedModuleRoute);
app.use('/open-ai', openAiRoute);
app.use('/api/v1/approval',approvalFlow)

// .....................................................new.......................
app.use(contact_bulkfile);
app.use(template)
// Serve static files
app.use(express.static('src/uploads/profile_photo'));
// app.use(express.static('src/uploads/company_logo'));
app.use('/src/uploads/company_logo', express.static('src/uploads/company_logo'));
app.use('/src/uploads/template_attachments', express.static('src/uploads/template_attachments'));
app.use('/src/uploads/campaign_attachments', express.static('src/uploads/campaign_attachments'));
app.use('/src/uploads/campaign_documents', express.static('src/uploads/campaign_documents'));
app.use('/src/uploads/test_campaign_documents', express.static('src/uploads/test_campaign_documents'));
app.use('/src/uploads', express.static('src/uploads'));


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
