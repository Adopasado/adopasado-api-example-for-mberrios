const express = require("express");
const verifyAdmin = require("../middleware/isadmin");
const authenticationUser = require("../middleware/authentication");
const router = express.Router();
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  deleteAllJobsByUser,
  getAllJobsAdmin,
  deleteAllJobs
} = require("../controllers/jobsController");



router.route("/").get(authenticationUser, getAllJobs);
router.route("/byid/:id").get(authenticationUser, getJob);
router.route("/").post(authenticationUser, createJob);
router.route("/:id").patch(authenticationUser, updateJob);
router.route("/delete/:id").delete(authenticationUser, deleteJob);
router.route("/byuser/delete_alls").delete(authenticationUser, deleteAllJobsByUser);
router.route("/delete_alls").delete(authenticationUser, verifyAdmin, deleteAllJobs);
router.route("/admin").get(authenticationUser, verifyAdmin, getAllJobsAdmin)

module.exports = router;
