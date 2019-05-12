var LoginContract = artifacts.require("./LoginContract");

module.exports = function(deployer) {
  deployer.deploy(LoginContract);
};
