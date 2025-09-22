const letterHeadModel = require("../Models/letterHead.model");
const { verifyJwt } = require("../Controller/jwtAuth");

const letterHeadController = {
  createLetterHead: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const body = req.body;
      const files = req.file; // Retrieve file
      console.log(req.file);
      if (!body.letter_head_name) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "File name is required!",
        });
      }
      if (!files) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Please upload a file!",
        });
      }

      // Validate file extension
      const allowedExtensions = ["doc", "docx"];
      const fileExtension = files.originalname.split(".").pop();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Only .doc and .docx files are allowed!",
        });
      }

      const imageUrl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}`;
      console.log(imageUrl);

      const result = await letterHeadModel.createLetterHead(
        userDetails,
        body,
        files,
        imageUrl
      );
      console.log(result[0]);
      if (result[0][0].response === "fail") {
        return res.status(400).json({
          success: false,
          error: true,
          message: "This Letter Head already exist!",
        });
      } else {
        return res.json({
          success: true,
          error: false,
          message: "Letter Head added successfully!",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  getAllLetterHead: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await letterHeadModel.getAllLetterHead(userDetails);
      // console.log("res", result[0][0]?.response);

      let path;
      result[0].forEach((element) => {
        path = element?.file_path.replace(/\\/g, "/");
        element.file_url = `${process.env.PROTOCOL}://${req.get(
          "host"
        )}/${path}`;
      });

      res.json({
        success: true,
        error: false,
        message: "Letter heads fetched successfully!",
        data: result[0],

        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  DeleteLetterHead: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await letterHeadModel.DeleteLetterHead(
        userDetails,
        req.body.letter_head_id
      );

      res.json({
        success: true,
        error: false,
        message: "Letter heads deleted successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  get_by_id: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await letterHeadModel.get_by_id(
        userDetails,
        req.body.letter_head_id
      );

      let path;
      result[0].forEach((element) => {
        path = element?.file_path.replace(/\\/g, "/");
        element.file_url = `${process.env.PROTOCOL}://${req.get(
          "host"
        )}/${path}`;
      });

      res.json({
        success: true,
        error: false,
        message: "Letter heads fetched successfully!",
        data: result[0],

        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  updateLetterHead: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      const body = req.body;
      const files = req.file; // Retrieve file
      console.log(req.file);
      if (!body.letter_head_name) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "File name is required!",
        });
      }
      if (!files) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Please upload a file!",
        });
      }

      // Validate file extension
      const allowedExtensions = ["doc", "docx"];
      const fileExtension = files.originalname.split(".").pop();
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Only .doc and .docx files are allowed!",
        });
      }

      const imageUrl = `${process.env.PROTOCOL}://${process.env.API_BASE_URL}`;
      console.log(imageUrl);

      const result = await letterHeadModel.updateLetterHead(
        userDetails,
        body,
        files,
        imageUrl
      );
      console.log(result[0]);

      return res.json({
        success: true,
        error: false,
        message: "Letter Head updated successfully!",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  createHeader: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      body = req.body;
      if (!body.header_name) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Header name is required!",
        });
      } else if (!body.description) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Header description is required!",
        });
      }

      const result = await letterHeadModel.createHeader(userDetails, body);
      // console.log(result[0]);
      if (result[0]?.[0]?.response === "fail") {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Header already exist!",
        });
      } else {
        return res.json({
          success: true,
          error: false,
          message: "Header saved successfully!",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  createFooter: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);
      body = req.body;

      if (!body.footer_name) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Footer name is required!",
        });
      } else if (!body.description) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Footer description is required!",
        });
      }
      const result = await letterHeadModel.createFooter(userDetails, body);

      if (result[0]?.[0]?.response === "fail") {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Footer already exist!",
        });
      } else {
        return res.json({
          success: true,
          error: false,
          message: "Footer saved successfully!",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },

  
  getAllHeader: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await letterHeadModel.getAllHeader(userDetails,req.body.headerId);
     
      res.json({
        success: true,
        error: false,
        message: "Header fetched successfully!",
        data: result[0],

        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
  
  getAllFooter: async (req, res) => {
    try {
      const userDetails = verifyJwt(req);

      const result = await letterHeadModel.getAllFooter(userDetails,req.body.footerId);
      
      res.json({
        success: true,
        error: false,
        message: "Footer fetched successfully!",
        data: result[0],

        count: result[1][0].count,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ message: err.message });
    }
  },
};
module.exports = letterHeadController;
