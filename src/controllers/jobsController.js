const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const {
    BadRequestError,
    NotFoundError,
} = require("../errors");

// jobs by user
const getAllJobs = async(req, res) => {
    const allJobs = await Job.find({ emailOfCreator: req.user.email }).sort(
        "-updatedAt"
    );
    if (!allJobs || allJobs == "") {
        throw new NotFoundError("You dont have jobs in DB...!!!");
    }
    res.status(StatusCodes.OK).json({ No_Jobs: allJobs.length, allJobs });
};

// all jobs only by admin
const getAllJobsAdmin = async(req, res) => {
    const allJobs = await Job.find({}).sort(
        "-updatedAt"
    );
    if (!allJobs || allJobs == "") {
        throw new NotFoundError("No jobs in DB...!!!");
    }
    res.status(StatusCodes.OK).json({ No_Jobs: allJobs.length, allJobs });
};

// job by user and by id 
const getJob = async(req, res) => {
    const {
        user: { email },
        params: { id: jobID },
    } = req;
    const job = await Job.findOne({ _id: jobID, emailOfCreator: email });
    if (!job || job == "" || job == null) {
        throw new NotFoundError("You dont have jobs with this ID...!!!");
    }
    res.status(StatusCodes.OK).json({ job });
};

// create job by user
const createJob = async(req, res) => {
    // creating new property createdByUserId = userId
    // creating new property emailOfCreator = email
    req.body.createdByUserId = req.user.userId;
    req.body.emailOfCreator = req.user.email;
    const newJob = await Job.create(req.body);
    res.status(StatusCodes.CREATED).json({ newJob });
};

// update job by user and by id
const updateJob = async(req, res) => {
    const {
        body: { company, position },
        user: { email },
        params: { id: jobID },
    } = req;
    //console.log(email);
    if (company === "" || position === "" || !company || !position) {
        throw new BadRequestError(
            "Company and Position fields cannot by empty...!!!"
        );
    }
    const updatedJob = await Job.findOneAndUpdate({ _id: jobID, emailOfCreator: email }, { $set: req.body }, { new: true });
    if (!updatedJob || updatedJob == "") {
        throw new NotFoundError("You dont have jobs with this ID...!!!");
    }
    res.status(StatusCodes.CREATED).json({ updatedJob });
};

// delete job by user and by id
const deleteJob = async(req, res) => {
    const {
        user: { email },
        params: { id: jobID },
    } = req;
    const job = await Job.findOneAndRemove({ _id: jobID, emailOfCreator: email });
    if (!job || job == "") {
        throw new NotFoundError("You dont have jobs with this ID...!!!");
    }
    res.status(StatusCodes.OK).json({ msg: "Job deleted...!!!" });
};

// delete all jobs by user
const deleteAllJobsByUser = async(req, res) => {
    const {
        user: { email },
    } = req;
    const jobs = await Job.find({ emailOfCreator: email });
    if (jobs) {
        for (i in jobs) {
            await Job.findOneAndRemove({ emailOfCreator: jobs[i].emailOfCreator });
        }
    }
    //await Job.deleteMany();
    res.status(StatusCodes.OK).json({ msg: "All your jobs has been eliminated...!!!" });
};

// delete all jobs (GENERAL) with soft delete 
const deleteAllJobs = async(req, res) => {
    const jobs = await Job.find({});
    if (jobs) {
        for (i in jobs) {
            await Job.delete({ emailOfCreator: jobs[i].emailOfCreator });
        }
        res.status(StatusCodes.OK).json({ msg: "All jobs has been eliminated with SD...!!!" });
    } else {
        throw new NotFoundError("No jobs in DB...!!!");
    }
    //await Job.deleteMany();
};


module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    deleteAllJobsByUser,
    getAllJobsAdmin,
    deleteAllJobs
};