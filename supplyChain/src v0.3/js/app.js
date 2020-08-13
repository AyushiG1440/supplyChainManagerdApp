
App = {
  web3Provider: null,
  contracts: {},
  addr:'',
  name:'',
  
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
    }
    web3 = new Web3(App.web3Provider);
    App.populateAddress();
    return App.initContract();
  },
  initContract: function() {
    $.getJSON('supplyChain.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var contractArtifact = data;
    App.contracts.supplyChain = TruffleContract(contractArtifact);

    // Set the provider for our contract
    App.contracts.supplyChain.setProvider(App.web3Provider);
    
    return App.bindEvents();
    });
  },
  populateAddress: function(){
      new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545')).eth.getAccounts((err, accounts) => {
        var txt = "";
          for(var i=0;i<accounts.length;i++){
              txt += "<option value='" + accounts[i] + "'>"+accounts[i]+"</option>";
          }
          $('#address').html(txt);
          $('#user_address').html(txt);
    });
  },
  bindEvents: function(){
    $(document).ready(function(){
        $("#name").on('change', function(){
            window.localStorage.setItem('selected_name',JSON.stringify($('#name').val()));
            App.name = $('#name').val();
            console.log(App.name);
            });
        });
    
    $(document).ready(function(){
        $("#address").on('change', function(){
            window.localStorage.setItem('selected_addr',JSON.stringify($('#address').val()));
            App.addr = $('#address').val();
            console.log(App.addr);
        });
    });
      //Works fine!(but was not working when account switched in metamask before.but today it's working)
    $(document).ready(function(){
        $('.button-start').on('click', function(event){
	        ethereum.enable();
            var msg;
            var contractInstance;
            App.contracts.supplyChain.deployed().then(function(instance) {
            contractInstance = instance;
            return contractInstance.register({from:$('#address').val()});
            }).then(function(res){
                    if(res.receipt.status == '0x01'){
                        msg = "Registration succesful! Your ID is ";
		              }
                    else{
                        msg = "Registration failed";
                    }
                    return contractInstance.temp_id.call({from:$('#address').val()});
            }).then(function(result){
            if(msg == "Registration succesful! Your ID is "){
                $(".container-receipt-start").text(msg+result);
            }
            else{
                $(".container-receipt-start").text(msg);}
            });
        });
    });
    
   
  }
};
$(function() {
    $(window).load(function() {
        App.init();
        console.log('starting app.js');
    });
});

