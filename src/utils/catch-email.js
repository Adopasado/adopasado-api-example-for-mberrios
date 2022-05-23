let email = "";
const catchEmail = (req) => {
  email = req;
};
const getEmail = () => {
  return email;
};
module.exports = {catchEmail, getEmail};
