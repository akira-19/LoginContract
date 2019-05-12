App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
      // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/2064023dec254a42ad50c2aeb50fd99e');
  }

  web3 = new Web3(App.web3Provider);
  return App.initContract();
  },

  initContract: function() {
      $.getJSON('LoginContract.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var LoginArtifact = data;
    App.contracts.Login = TruffleContract(LoginArtifact);

    // Set the provider for our contract
    App.contracts.Login.setProvider(App.web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    App.signin();
    App.loginFunc();
    App.logout();
    App.forgotPassword();
    App.getResetNumber();
    App.resetPassword();
    return App.loggedin();
  });
  },

 loginFunc: function(){
     $(document).off('click');
     $(document).on('click','#loginBtn', function(event){
         event.preventDefault();
         let password = $("#password").val();
         App.contracts.Login.deployed().then(instance => {
             instance.login(password);
         }).catch(function(err) {
             console.log(err.message)
         });
     })
 },

 signin: function(){
     $(document).off('click');
     $(document).on('click','#signin', function(event){
         event.preventDefault();
         const password = $("#pass").val();
         const friend1 = $("#fr1").val();
         const friend2 = $("#fr2").val();
         const friend3 = $("#fr3").val();
         App.contracts.Login.deployed().then(instance => {
             return instance.register(password, friend1, friend2, friend3);
         }).catch(function(err) {
                 console.log(err.message)
             });
     });
 },

 loggedin: async function(){
     let account;
     await web3.eth.getAccounts((error, accounts) => {
         account = accounts[0]
     });
     web3.eth.getBlockNumber(function(error, result){
         const expireBlock = result - 360 > 0 ? result - 360 : 1;
          App.contracts.Login.deployed().then(instance => {
              const loginEvent = instance.loginInfo({user: account},{fromBlock: expireBlock, toBlock: 'latest'});
              let latestBlock = 0;
              loginEvent.watch((error, result) => {
                  if (result.blockNumber > latestBlock){
                      latestBlock = result.blockNumber;
                      const currentTime = Date.now();
                      if (result.args.logined && currentTime < result.args.time + 3600){
                          $("#logined").text("Logined");
                          $("#logout").show();
                      }else{
                          $("#logined").text("Not logined");
                          $("#logout").hide();
                      }
                  }

              });
          }).catch(function(err) {
                console.log(err.message)
          });
     });



 },

 logout: function(){
     $(document).off('click');
     $(document).on('click','#logout', function(event){
         event.preventDefault();
          App.contracts.Login.deployed().then(instance => {
              instance.logout();
          }).catch(function(err) {
              console.log(err.message);
          });


     });
 },


 forgotPassword: function(){
     $(document).off('click');
     $(document).on('click','#forgotBtn', function(event){
         App.contracts.Login.deployed().then(instance => {
             instance.forgotPassword();
         }).then(() => {
             alert("Created reset numbers. Ask your friends the numbers.");
         }).catch(function(err) {
            console.log(err.message);
         });
     });
 },

 getResetNumber: function(){
     $(document).off('click');
     $(document).on('click','#resetNum', function(event){
         const resetId = $("#resetId").val();
         App.contracts.Login.deployed().then(instance => {
             return instance.showResetNumber(resetId);
         }).then(number => {
            alert("The reset number is " + number);
         }).catch(function(err) {
             console.log(err.message);
         });
     });

 },

 resetPassword: function(){
     $(document).off('click');
     $(document).on('click','#resetPass', function(event){
         const resetNum1 = $("#reset1").val();
         const resetNum2 = $("#reset2").val();
         const resetNum3 = $("#reset3").val();
         const newPassword = $("#newPassword").val();
         App.contracts.Login.deployed().then(instance => {
             instance.changePassword(resetNum1, resetNum2, resetNum3, newPassword);
         }).catch(function(err) {
             console.log(err.message);
         });
     });

 }





}

$(function() {
  $(window).load(function() {
    App.init();
    $("#logout").hide();
  });
});
