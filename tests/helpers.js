const app = require("../src/app");
const supertest = require('supertest')
const agent = supertest(app)
const mongoose = require("mongoose");
const User = require('../src/models/User')

const badRoutes = [{
    route: '/this/bad1/route',
}, {
    route: '/this/bad2/route',
}, {
    route: '/this/bad3/route',
}, {
    route: '/this/bad4/route/hard/metal',
}, {
    route: '/this/bad2/route/good/bad',
}, {
    route: '/this/bad3/route/nice/horrible/bad/route',
}, {
    route: '/whats/the/difference/between/this/and/that',
}]
const users = [{
    name: "admin",
    email: "admin@gmail.com",
    password: "123456",
    IsAdmin: true,
}, {
    name: "badUserEqualEmail",
    email: "admin@gmail.com",
    password: "123456",
    IsAdmin: true,
}, {
    name: "badUserWrongEmailFormat",
    email: "admin1@gm*ail.com",
    password: "123456",
    IsAdmin: true,
}, {
    name: "badUserWrongPasswordLength",
    email: "badadminpassword@gmail.com",
    password: "123",
    IsAdmin: true,
}, {
    name: "goodUser",
    email: "gooduser@gmail.com",
    password: "123456",
    IsAdmin: false,
}, {
    name: "badUser",
    email: "baduser@gmail.com",
    password: "123456",
    IsAdmin: false,
}, {
    name: "gooUserWithoutEmail_Password",
    email: "",
    password: "",
    IsAdmin: false,
}]

const adminJobs = [{
    company: "PXNDX",
    position: "security",
}, {
    company: "DALTAX",
    position: "human resources",
}, {
    company: "METALIX",
    position: "backend developer",
}, {
    company: "FAXAS",
    position: "tester",
}]

const userJobs = [{
    company: "GOOGLE",
    position: "frontend developer",
}, {
    company: "FACEBOOK",
    position: "ui designer",
}, {
    company: "AMAZON",
    position: "network administrator",
}, {
    company: "TESLA",
    position: "software engineer",
}]

const updateAdminJobs = [{
    company: "SAXON",
    position: "the big sleeper",
}, {
    company: "BRASCUBA",
    position: "the punisher",
}, {
    company: "ICAIC",
    position: "the multi-purpose",
}, {
    company: "EMINEM",
    position: "Slim Shady",
}]

const updateUserJobs = [{
    company: "COCO",
    position: "the deliverer",
}, {
    company: "NANA",
    position: "the cook",
}, {
    company: "CPA",
    position: "this is the best job",
}, {
    company: "V-13-32",
    position: "the tobacco master",
}]

const getAllContetFromJobs = async() => {
    const response = await agent.get('/api/v1/jobs')
    return {
        contents: response.body.map(job => job.content),
        response
    }
}

const getAllTitlesFromJobs = async() => {
    const response = await agent.get('/api/v1/jobs')
    return {
        body: response.body.map(job => job.body),
        response
    }
}

const getUsers = async() => {
    const usersDB = await User.find({})
    return usersDB.map(user => user.toJSON())
}
const closeAllConnections = () => {
    server.close()
    mongoose.connection.close()
}

module.exports = {
    badRoutes,
    users,
    adminJobs,
    userJobs,
    agent,
    getAllContetFromJobs,
    getAllTitlesFromJobs,
    updateAdminJobs,
    updateUserJobs,
    closeAllConnections,
    getUsers
}