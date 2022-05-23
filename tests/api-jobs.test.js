const mongoose = require("mongoose");
const chai = require("chai");
const expect = chai.expect;
const app = require("../src/app");
const supertest = require("supertest");
const agent = supertest(app);
const Job = require("../src/models/Job");
const User = require("../src/models/User");
const {
    badRoutes,
    users,
    adminJobs,
    userJobs,
    updateAdminJobs,
    updateUserJobs,
} = require("./helpers");

// variables
let tokenAdmin = null;
let tokenUser = null;
let tokenFake = null;
let userDocuments = [];
let jobsDocuments = [];
let idForElimination = mongoose.Types.ObjectId();
let invalidId = mongoose.Types.ObjectId();

before(async() => {
    await User.deleteMany({});
    await Job.deleteMany({});
});
describe("Testing NOT FOUND ROUTE =>>", () => {
    it("should return <NotFoundError> when the route is invalid", (done) => {
        for (let i = 0; i < badRoutes.length; i++) {
            agent
                .get(badRoutes[i].route)
                .expect(404)
                .end((err, res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body.msg).to.equal("Route does not exist");
                });
        }
        done();
    });
});
describe("Testing Admin/User Register =>>", () => {
    it("should return <StatusCodes_OK> when <user admin> is created", (done) => {
        agent
            .post("/api/v1/auth/register")
            .send(users[0])
            .end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
    });
    it("should return <BadRequestError> and a below message when user its trying to created with one email that already exist in DB", (done) => {
        agent
            .post("/api/v1/auth/register")
            .send(users[1])
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal(
                    "Duplicate value entered for email field, please choose another value"
                );
                done();
            });
    });
    it("should return <BadRequestError> and a below message when user its trying to created with confused email", (done) => {
        agent
            .post("/api/v1/auth/register")
            .send(users[2])
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Please provide valid email");
                done();
            });
    });
    it("should return <BadRequestError> and a below message when user its trying to created with invalid length password", (done) => {
        agent
            .post("/api/v1/auth/register")
            .send(users[3])
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal(
                    "Path `password` (`123`) is shorter than the minimum allowed length (5)."
                );
                done();
            });
    });
    it("should return <StatusCodes_OK> when <normal user> is created", (done) => {
        agent
            .post("/api/v1/auth/register")
            .send(users[4])
            .end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
    });
});

describe("Testing User Login =>>", () => {
    it("should return <StatusCodes_OK> when <admin user> is login after registration", (done) => {
        agent
            .post("/api/v1/auth/login")
            .send({ email: users[0].email, password: users[0].password })
            .end((err, res) => {
                tokenAdmin = res.body.token; //catch the token for future use
                expect(res.status).to.equal(200);
                done();
            });
    });
    it("should return <StatusCodes_OK> when <normal user> is login after registration", (done) => {
        agent
            .post("/api/v1/auth/login")
            .send({ email: users[4].email, password: users[4].password })
            .end((err, res) => {
                tokenUser = res.body.token; //catch the token for future use
                idForElimination = mongoose.Types.ObjectId(res.body.user.id); //catch the email for future use
                expect(res.status).to.equal(200);
                done();
            });
    });
    it("should return <UnauthenticatedError> when <the user> is login without register first", (done) => {
        agent
            .post("/api/v1/auth/login")
            .send({ email: users[5].email, password: users[5].password })
            .end((err, res) => {
                expect(res.status).to.equal(401);
                expect(res.body.msg).to.equal(
                    "Invalid email or not register yet...!!!"
                );
                done();
            });
    });
    it("should return <BadRequestError> when <the user> is login without email and password", (done) => {
        agent
            .post("/api/v1/auth/login")
            .send({ email: "", password: "" })
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal(
                    "Please provide email and password...!!!"
                );
                done();
            });
    });
    it("should return <UnauthenticatedError> when <the user> is login with wrong password", (done) => {
        agent
            .post("/api/v1/auth/login")
            .send({ email: users[0].email, password: "wrongpassword" })
            .end((err, res) => {
                expect(res.status).to.equal(401);
                expect(res.body.msg).to.equal("Invalid password...!!!");
                done();
            });
    });
});

describe("Testing User/Admin Roles into users collection in db=>>", () => {
    before(async() => {
        userDocuments = await User.find({});
    });
    it("should return <UnauthenticatedError> when <admin user> get all users in db with bad credentials", (done) => {
        agent
            .get("/api/v1/auth")
            .set("Authorization", `Bearer ${tokenFake}`)
            .end((err, res) => {
                expect(res.status).to.equal(401);
                expect(res.body.msg).to.equal("Authentication Invalid...!!!");
                done();
            });
    });
    it("should return <StatusCodes_OK> when <admin user> get all users in db", (done) => {
        agent
            .get("/api/v1/auth")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an("object");
                expect(res.body.No_Users).to.equal(userDocuments.length);
                done();
            });
    });
    it("should return <UnauthenticatedError> when <normal user> get all users in db", (done) => {
        agent
            .get("/api/v1/auth")
            .set("Authorization", `Bearer ${tokenUser}`)
            .end((err, res) => {
                expect(res.status).to.equal(401);
                expect(res.body.msg).to.equal(
                    "Only administrators can use this route...!!!"
                );
                done();
            });
    });
    it("should return <UnauthenticatedError> when <normal user> trying delete one user by id", (done) => {
        agent
            .delete(`/api/v1/auth/delete/${idForElimination}`)
            .set("Authorization", `Bearer ${tokenUser}`)
            .end((err, res) => {
                expect(res.status).to.equal(401);
                expect(res.body.msg).to.equal(
                    "Only administrators can use this route...!!!"
                );
                done();
            });
    });
    it("should return <NotFoundError> when <admin user> delete one user by invalid id", (done) => {
        agent
            .delete(`/api/v1/auth/delete/${invalidId}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .end((err, res) => {
                expect(res.status).to.equal(404);
                expect(res.body.msg).to.equal(`No user in DB with this id...!!!`);
                done();
            });
    });
    it("should return <OK> when <admin user> delete one user by id", (done) => {
        agent
            .delete(`/api/v1/auth/delete/${idForElimination}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.msg).to.equal("User deleted...!!!");
                done();
            });
    });
});

describe("Testing Jobs/Create in db=>>", () => {
    it("should return <OK> when <admin user> with credentials create a job", (done) => {
        agent
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(adminJobs[0])
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.not.be.empty;
                expect(res.body).to.be.an("object");
                done();
            });
    });
    it("should return <OK> when <normal user> with credentials create a job", (done) => {
        agent
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(userJobs[0])
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.not.be.empty;
                expect(res.body).to.be.an("object");
                done();
            });
    });
    it("should return <BadRequestError> when <the user> with credentials create a bad job v1", (done) => {
        const badJob = {
            company: "",
            position: "",
        };
        agent
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal(
                    "Please provide company name. Please provide position"
                );
                done();
            });
    });
    it("should return <BadRequestError> when <the user> with credentials create a bad job v2", (done) => {
        const badJob = {
            a: "",
            b: "",
            c: "",
        };
        agent
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal(
                    "Please provide position. Please provide company name"
                );
                done();
            });
    });
    it("should return <BadRequestError> when <the user> create a job without position", (done) => {
        const badJob = {
            company: "EXAMPLE",
            position: "",
        };
        agent
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Please provide position");
                done();
            });
    });
    it("should return <BadRequestError> when <the user> create a job without company", (done) => {
        const badJob = {
            company: "",
            position: "example",
        };
        agent
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Please provide company name");
                done();
            });
    });
});
describe("Testing Jobs/Update/Delete/Get By Admin in db=>>", () => {
    before(async() => {
        jobsDocuments = await Job.find({ emailOfCreator: users[0].email });
    });
    it("should return <CREATED> when <admin user> with credentials update a job", (done) => {
        agent
            .patch(`/api/v1/jobs/${jobsDocuments[0]._id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(updateAdminJobs[0])
            .end((err, res) => {
                expect(res.status).to.equal(201);
                expect(res.body.updatedJob).to.deep.include(updateAdminJobs[0]);
                done();
            });
    });
    it("should return <BadRequestError> when <admin user> with credentials update a bad job v1", (done) => {
        const badJob = {
            company: "BADCOMPANY",
            position: ""
        }
        agent
            .patch(`/api/v1/jobs/${jobsDocuments[0]._id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Company and Position fields cannot by empty...!!!");
                done();
            });
    });
    it("should return <BadRequestError> when <admin user> with credentials update a bad job v2", (done) => {
        const badJob = {
            company: "",
            position: "badposition"
        }
        agent
            .patch(`/api/v1/jobs/${jobsDocuments[0]._id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Company and Position fields cannot by empty...!!!");
                done();
            });
    });
    it("should return <BadRequestError> when <admin user> with credentials update a bad job v3", (done) => {
        const badJob = {}
        agent
            .patch(`/api/v1/jobs/${jobsDocuments[0]._id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Company and Position fields cannot by empty...!!!");
                done();
            });
    });
    it("should return <BadRequestError> when <admin user> with credentials update a bad job v3", (done) => {
        const badJob = {}
        agent
            .patch(`/api/v1/jobs/${jobsDocuments[0]._id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(badJob)
            .end((err, res) => {
                expect(res.status).to.equal(400);
                expect(res.body.msg).to.equal("Company and Position fields cannot by empty...!!!");
                done();
            });
    });
});
describe("Testing Jobs/Update/By User in db=>>", () => {
    before(async() => {
        jobsDocuments = await Job.find({ emailOfCreator: users[0].email });
    });
    it("should return <CREATED> when <normal user> with credentials update a job", (done) => {
        agent
            .patch(`/api/v1/jobs/${jobsDocuments[0]._id}`)
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send(updateUserJobs[0])
            .end((err, res) => {
                expect(res.status).to.equal(201);
                expect(res.body.updatedJob).to.deep.include(updateUserJobs[0]);
                done();
            });
    });
});

// NO FINISHED YET....
// SOME TROUBLES WITH THE USER TOKEN