const { log } = require("handlebars");
const reportModel = require("../Models/report.model");
const { verifyJwt } = require("../Controller/jwtAuth");

const reportController = {
  getAllEmailLogs: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      console.log(userDetails);

      const result = await reportModel.getEmailAnalytics(
        userDetails.companyId,
        req.body.fromDate,
        req.body.toDate
      );

      res.json({
        success: true,
        error: false,
        data: result,
        message: "Email analytics fetched successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  // getSentEmailStatus: async (req, res) => {
  //   try {
  //     const userDetails = verifyJwt(req);

  //     console.log(userDetails)

  //     const result = await reportModel.getSentEmailStatus(
  //       userDetails.companyId,
  //       req.body.fromDate,
  //       req.body.toDate,
  //     );

  //     res.json({
  //       success: true,
  //       error: false,
  //       data:result,
  //       message: "Email Sent Status fetched successfully!",
  //     });
  //   } catch (err) {
  //     console.error("Error fetching data:", err);
  //     res.status(500).json({ message: err.message });
  //   }
  // },

  getSentEmailStatus: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await reportModel.getSentEmailStatus(
        userDetails.companyId,
        req.body.fromDate,
        req.body.toDate,
        req.body.campaign_id

      );

      // console.log("result")
      // console.log(result.length)

      const groupedData = result[0].reduce((acc, obj) => {
        const stringWithoutHtml = removeHtmlTags(obj.description);
        const key = obj.scheduler_rule_id;
        if (!acc[key]) {
          acc[key] = {
            scheduler_rule_id: obj.scheduler_rule_id,
            company_id: obj.company_id,
            mail_send_time: obj.mail_send_time,
            campaign_id: obj.campaign_id,
            campaign_name: obj.campaign_name,
            subject: obj.subject,
            template_description: stringWithoutHtml,
            recipients_email: obj.to,
            sender_email: obj.from,
            email_status: obj.email_status,
            campaign_attachments: [],
            documents: [],
            template_attachments: [],
          };
        }
        // Combine campaign attachments
        if (
          obj.campaign_attachment_name !== null &&
          !acc[key].campaign_attachments.some(
            (attachment) =>
              attachment.campaign_attachment_name ===
              obj.campaign_attachment_name
          )
        ) {
          let path = obj.campaign_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].campaign_attachments.push({
            campaign_attachment_name: obj.campaign_attachment_name,
            campaign_attachment_type: obj.campaign_attachment_type,
            campaign_attachment_path: `${process.env.PROTOCOL}://${req.get(
              "host"
            )}/${path}`,
          });
        }
        // Combine documents
        if (
          obj.document_name !== null &&
          !acc[key].documents.some(
            (document) => document.document_name === obj.document_name
          )
        ) {
          let path = obj.doc_path_url;

          if (path) {
            path = path.replace(/\\/g, "/");
          }

          acc[key].documents.push({
            document_name: obj.document_name,
            document_description: obj.document_description,
            is_password_protected: obj.is_password_protected,
            password_value: obj.password_value,
            documentType: obj.doc_format_type,
            documentPathUrl: `${process.env.PROTOCOL}://${req.get(
              "host"
            )}/${path}`,
          });
        }
        //combine template attachments
        if (
          obj.template_attachment_name !== null &&
          !acc[key].template_attachments.some(
            (attachment) =>
              attachment.template_attachment_name ===
              obj.template_attachment_name
          )
        ) {
          let path = obj.template_attachment_path;

          if (path) {
            path = path.replace(/\\/g, "/");
          }
          acc[key].template_attachments.push({
            template_attachment_name: obj.template_attachment_name,
            template_attachment_type: obj.template_attachment_type,
            template_attachment_path: `${process.env.PROTOCOL}://${req.get(
              "host"
            )}/${path}`,
          });
        }
        return acc;
      }, {});

      // Convert grouped data back to an array
      const data = Object.values(groupedData);
      res.json({
        success: true,
        error: false,
        count: data.length,
        data: data,
        message: "Email Sent Status fetched successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getBounceEmailStatus: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      // console.log("Userdetails",userDetails);

      const result = await reportModel.getBounceEmailStatus(
        userDetails.companyId,
        req.body.fromDate,
        req.body.toDate,
        req.body.campaign_id

      );

      // console.log("result",result[0]);
      const groupedData = result[0].reduce((acc, obj) => {
        const key = obj.scheduler_rule_id;
        if (!acc[key]) {
          const emailBounceTimeUTC = new Date(obj.email_bouncetime);
        const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const emailBounceTimeString = emailBounceTimeUTC.toLocaleString('en-US', options);
          acc[key] = {
            scheduler_rule_id: obj.scheduler_rule_id,
            company_id: obj.company_id,
            email_bouncetime: emailBounceTimeString,
            campaign_id: obj.campaign_id,
            schedule_date: obj.sentdate,
            campaign_name: obj.campaign_name,
            subject: obj.subject,
            template_description: obj.body,
            recipients_email: obj.to,
            sender_email: obj.from,
            email_status: obj.email_status,
          };
        }

        return acc;
      }, {});

      // Convert grouped data back to an array
      const data = Object.values(groupedData);
      res.json({
        success: true,
        error: false,
        count: data.length,
        data: data,
        message: "Email Bounce Status fetched successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getEmailAnalytics: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await reportModel.getEmailAnalytics(
        userDetails.companyId,
        req.body.fromDate,
        req.body.toDate,
        req.body.campaign_id
      );
      // Group data by campaign ID and merge counts
      // const groupedData = result[0].reduce((acc, curr) => {
      //   let sendFromTime = new Date(curr.from_date).toString();
      //   let Fromyear = new Date(curr.from_date).getFullYear();
      //   const FromdatePart = sendFromTime.slice(0, 10);
      //   const concatenatedFromDate =
      //     FromdatePart + " " + Fromyear + " ";
      //   console.log(concatenatedFromDate);
      //   let sendToTime = new Date(curr.to_date).toString();
      //   let Toyear = new Date(curr.to_date).getFullYear();
      //   const TodatePart = sendToTime.slice(0, 10);
      //   const concatenatedToDate =
      //     TodatePart + " " + Toyear + " ";
      //   console.log(concatenatedToDate);

      //   const { campaign_id, campaign_name, ...counts } = curr;
      //   // Add concatenated dates to the counts object
      //   counts.from_date = concatenatedFromDate;
      //   counts.to_date = concatenatedToDate;
      //   if (!acc[campaign_id]) {
      //     acc[campaign_id] = { campaign_id, campaign_name, ...counts };
      //   } else {
      //     Object.keys(counts).forEach((key) => {
      //       acc[campaign_id][key] += counts[key];
      //     });
      //   }
      //   return acc;
      // }, {});

      // Convert grouped data back to array
        // Group data by campaign ID
        const groupedData = result[0].reduce((acc, curr) => {
          const { campaign_id, campaign_name, from_date, to_date, ...counts } = curr;

          // Concatenate dates
          const fromDate = new Date(from_date).toDateString();
          const toDate = new Date(to_date).toDateString();

          // Create unique key for each campaign
          const campaignKey = `${campaign_id}_${campaign_name}_${fromDate}_${toDate}`;

          if (!acc[campaignKey]) {
              acc[campaignKey] = {
                  campaign_id,
                  campaign_name,
                  from_date: fromDate,
                  to_date: toDate,
                  ...counts
              };
          } else {
              // Merge counts
              Object.keys(counts).forEach((key) => {
                  acc[campaignKey][key] += counts[key];
              });
          }
          return acc;
      }, {});

      const mergedResult = Object.values(groupedData);
      res.json({
        success: true,
        error: false,
        count: mergedResult.length,
        data: mergedResult,

        message: "Email Analytics fetched successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
};

function removeHtmlTags(str) {
  // Remove HTML tags

  let cleanStr = str;

  if (str) {
    cleanStr = str.replace(/<[^>]*>/g, " ");
    // Remove encoded characters
    cleanStr = cleanStr.replace(/&#[0-9]+;/g, " ");

    cleanStr = cleanStr.replace(/\s+/g, " ");
  }

  return cleanStr;
}

module.exports = reportController;
