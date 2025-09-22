const express = require("express");
const router = express.Router();
const UserPermissionController = require("../Controller/UserPermission.controller");


router.post("/create", UserPermissionController.create);

router.put(
  "/update",
  UserPermissionController.update
);

router.post(
  "/findById",
  UserPermissionController.findById
);

router.post(
  "/permissionById",
  UserPermissionController.permissionById
);

router.post(
  "/getCount",
  UserPermissionController.findCount
);
router.post(
  "/getforms",
  UserPermissionController.getforms
);
router.get(
  "/getmodules",
  UserPermissionController.getmodules
);
module.exports = router;
